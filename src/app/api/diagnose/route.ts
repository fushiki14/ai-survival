import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSystemPrompt } from "@/lib/prompts";
import { encrypt } from "@/lib/crypto";
import { checkServerRateLimit } from "@/lib/rate-limit";
import { redis } from "@/lib/redis";

export const maxDuration = 30;

const anthropic = new Anthropic();

const INJECTION_PATTERNS = [
  /(?:無視|ignore|disregard|forget).*(?:指示|instruction|prompt|system)/i,
  /(?:以上|上記|これまで|previous).*(?:無視|忘れ|取り消)/i,
  /(?:act|behave|respond)\s+as/i,
  /(?:you\s+are\s+now|new\s+instruction)/i,
  /(?:system\s*prompt|システムプロンプト)/i,
];

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

const ALLOWED_ORIGINS = [
  "https://ai-survival.vercel.app",
  "http://localhost:3000",
];

export async function POST(req: NextRequest) {
  try {
    const reqOrigin = req.headers.get("origin") || "";
    if (!ALLOWED_ORIGINS.includes(reqOrigin)) {
      return NextResponse.json(
        { error: "不正なリクエスト元です" },
        { status: 403 }
      );
    }

    const ip = getClientIp(req);
    if (!(await checkServerRateLimit(ip, 2))) {
      return NextResponse.json(
        { error: "本日の無料診断枠（2回）を使い切りました。診断済みの結果がある場合は、そちらから詳細レポートを購入できます。" },
        { status: 429 }
      );
    }

    const { careerText, quiz } = (await req.json()) as {
      careerText: string;
      quiz?: { aiUsage?: string; jobChange?: string; learning?: string };
    };

    if (!careerText || careerText.trim().length < 20) {
      return NextResponse.json(
        { error: "職種・スキルの記述は20文字以上必要です" },
        { status: 400 }
      );
    }

    if (INJECTION_PATTERNS.some((p) => p.test(careerText))) {
      return NextResponse.json(
        { error: "入力内容に不正なパターンが検出されました。キャリア情報のみを入力してください。" },
        { status: 400 }
      );
    }

    if (careerText.length > 3000) {
      return NextResponse.json(
        { error: "入力は3000文字以内にしてください" },
        { status: 400 }
      );
    }

    const systemPrompt = getSystemPrompt(quiz);

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `以下のキャリア情報を診断してください。\n\n${careerText}`,
        },
      ],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "診断結果の解析に失敗しました" },
        { status: 500 }
      );
    }

    const cleaned = jsonMatch[0].replace(
      /"(?:[^"\\]|\\.)*"/g,
      (match) =>
        match.replace(/[\x00-\x1F\x7F]/g, (c) => {
          switch (c) {
            case "\n":
              return "\\n";
            case "\r":
              return "\\r";
            case "\t":
              return "\\t";
            default:
              return " ";
          }
        })
    );
    const result = JSON.parse(cleaned);

    if (
      !result.preview ||
      typeof result.preview.survivalRate !== "number" ||
      typeof result.preview.survivalLabel !== "string" ||
      typeof result.preview.profileLabel !== "string" ||
      !Array.isArray(result.flaws)
    ) {
      return NextResponse.json(
        { error: "診断結果の形式が不正です。再度お試しください" },
        { status: 500 }
      );
    }

    result.preview.survivalRate = Math.max(
      0,
      Math.min(100, Math.round(result.preview.survivalRate))
    );

    const validFlaws = result.flaws.filter(
      (f: Record<string, unknown>) =>
        typeof f.quote === "string" && typeof f.critique === "string"
    );
    result.flaws = validFlaws;

    const validTips = Array.isArray(result.tips)
      ? result.tips.filter(
          (t: Record<string, unknown>) =>
            typeof t.label === "string" && typeof t.body === "string"
        )
      : [];

    const validActions = Array.isArray(result.actions)
      ? result.actions.filter((a: unknown) => typeof a === "string")
      : [];

    const validStrategies = Array.isArray(result.strategies)
      ? result.strategies.filter(
          (s: Record<string, unknown>) =>
            typeof s.timeframe === "string" && typeof s.action === "string"
        )
      : [];

    const scores =
      result.scores && typeof result.scores === "object"
        ? {
            aiExposure: Math.max(
              0,
              Math.min(100, Math.round(result.scores.aiExposure || 0))
            ),
            augmentationPotential: Math.max(
              0,
              Math.min(
                100,
                Math.round(result.scores.augmentationPotential || 0)
              )
            ),
            interpersonalDepth: Math.max(
              0,
              Math.min(
                100,
                Math.round(result.scores.interpersonalDepth || 0)
              )
            ),
            physicalIntelligence: Math.max(
              0,
              Math.min(
                100,
                Math.round(result.scores.physicalIntelligence || 0)
              )
            ),
            adaptability: Math.max(
              0,
              Math.min(100, Math.round(result.scores.adaptability || 0))
            ),
          }
        : null;

    const paidContent = JSON.stringify({
      flaws: result.flaws,
      scores,
      strategies: validStrategies,
      tips: validTips,
      actions: validActions,
    });
    const encryptedPaid = await encrypt(paidContent);

    redis.incr("survival:diagnosis:count").catch(() => {});

    return NextResponse.json({
      preview: result.preview,
      firstFlaw: result.flaws?.[0] || null,
      flawCount: result.flaws?.length || 0,
      encryptedPaid,
    });
  } catch (e) {
    console.error("Diagnosis error:", e);
    return NextResponse.json(
      { error: "診断中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
