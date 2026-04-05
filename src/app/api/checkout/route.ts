import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { contentHash } = (await req.json()) as { contentHash?: string };

    if (!contentHash) {
      return NextResponse.json(
        { error: "必要なパラメータが不足しています" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const allowedOrigins = [
      "https://ai-survival-pi.vercel.app",
      "https://ai-survival.vercel.app",
      "http://localhost:3000",
    ];
    const reqOrigin = req.headers.get("origin") || "";
    const origin = allowedOrigins.includes(reqOrigin)
      ? reqOrigin
      : allowedOrigins[0];

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "jpy",
            product_data: {
              name: "AI生存診断 - 詳細レポート",
              description:
                "5軸スコア分析 + 致命的欠陥 + 生存戦略 + 改善アドバイス",
            },
            unit_amount: 500,
          },
          quantity: 1,
        },
      ],
      metadata: { contentHash },
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?cancelled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("Checkout error:", e);
    return NextResponse.json(
      { error: "決済セッションの作成に失敗しました" },
      { status: 500 }
    );
  }
}
