"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type {
  DiagnosisFull,
  DiagnosisScores,
} from "@/types/diagnosis";

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="flex-1 flex items-center justify-center">
          <p className="text-zinc-400">読み込み中...</p>
        </main>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}

const SCORE_META: {
  key: keyof DiagnosisScores;
  label: string;
  desc: string;
  invert?: boolean;
}[] = [
  {
    key: "aiExposure",
    label: "AI露出度",
    desc: "高いほど危険",
    invert: true,
  },
  {
    key: "augmentationPotential",
    label: "拡張ポテンシャル",
    desc: "AIで生産性UP余地",
  },
  {
    key: "interpersonalDepth",
    label: "対人スキル深度",
    desc: "共感・交渉の深さ",
  },
  {
    key: "physicalIntelligence",
    label: "物理的知性",
    desc: "モラベックの壁",
  },
  { key: "adaptability", label: "学習適応力", desc: "変化への対応力" },
];

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [result, setResult] = useState<DiagnosisFull | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setError("無効なセッションです");
      setLoading(false);
      return;
    }

    const encryptedPaid = localStorage.getItem("encrypted_paid");
    const previewStr = localStorage.getItem("preview_data");
    if (!encryptedPaid || !previewStr) {
      setError("診断結果が見つかりません。再度診断してください");
      setLoading(false);
      return;
    }
    let previewData;
    try {
      previewData = JSON.parse(previewStr);
    } catch {
      setError("診断データが破損しています。再度診断してください");
      setLoading(false);
      return;
    }

    fetch("/api/result", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, encryptedPaid }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("決済の確認に失敗しました");
        return res.json();
      })
      .then((paidContent) => {
        setResult({
          preview: previewData.preview,
          scores: paidContent.scores || null,
          flaws: paidContent.flaws,
          strategies: paidContent.strategies || [],
          tips: paidContent.tips || [],
          actions: paidContent.actions || [],
        });
        localStorage.removeItem("encrypted_paid");
        localStorage.removeItem("preview_data");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <p className="text-zinc-400">結果を取得中...</p>
      </main>
    );
  }

  if (error || !result) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center gap-4">
        <p className="text-red-400">{error || "結果が見つかりません"}</p>
        <a href="/" className="text-sm text-zinc-400 hover:text-zinc-200">
          トップに戻る
        </a>
      </main>
    );
  }

  const rateColor = (rate: number) =>
    rate <= 20
      ? "text-red-500"
      : rate <= 40
        ? "text-orange-500"
        : rate <= 60
          ? "text-yellow-500"
          : rate <= 80
            ? "text-green-500"
            : "text-cyan-400";

  return (
    <main className="flex-1 flex flex-col items-center px-4 py-8 md:py-16">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold">診断結果</h1>
          <p className="text-sm text-zinc-400 mt-1">九条レイの診断</p>
        </div>

        {/* Preview summary */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 flex items-center justify-between">
          <div>
            <span
              className={`text-3xl font-bold ${rateColor(result.preview.survivalRate)}`}
            >
              {result.preview.survivalRate}%
            </span>
            <span className="text-sm text-zinc-400 ml-2">
              {result.preview.survivalLabel}
            </span>
          </div>
          <span className="text-lg font-bold text-amber-400">
            {result.preview.profileLabel}
          </span>
        </div>

        {/* Verdict */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
          <p className="text-sm text-zinc-300 italic leading-relaxed">
            &quot;{result.preview.verdict}&quot;
          </p>
        </div>

        {/* 5-axis Scores */}
        {result.scores && (
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
            <h2 className="text-sm font-medium text-zinc-300 mb-4">
              5軸スコア
            </h2>
            <div className="space-y-3">
              {SCORE_META.map(({ key, label, desc, invert }) => {
                const val = result.scores![key];
                const barColor = invert
                  ? val <= 30
                    ? "bg-green-500"
                    : val <= 60
                      ? "bg-amber-500"
                      : "bg-red-500"
                  : val >= 70
                    ? "bg-green-500"
                    : val >= 40
                      ? "bg-amber-500"
                      : "bg-red-500";
                const textColor = invert
                  ? val <= 30
                    ? "text-green-400"
                    : val <= 60
                      ? "text-amber-400"
                      : "text-red-400"
                  : val >= 70
                    ? "text-green-400"
                    : val >= 40
                      ? "text-amber-400"
                      : "text-red-400";
                return (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-300">
                        {label}
                        <span className="text-zinc-500 ml-1">{desc}</span>
                      </span>
                      <span className={textColor}>{val}</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${barColor}`}
                        style={{ width: `${val}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Flaws */}
        {result.flaws.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
            <h2 className="text-sm font-medium text-zinc-300 mb-4">
              致命的欠陥
            </h2>
            <div className="space-y-4">
              {result.flaws.map((flaw, i) => (
                <div key={i}>
                  <p className="text-sm text-zinc-100">
                    {i + 1}. 「{flaw.quote}」
                  </p>
                  <p className="text-sm text-zinc-400 mt-1 pl-4">
                    → {flaw.critique}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Strategies */}
        {result.strategies.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
            <h2 className="text-sm font-medium text-zinc-300 mb-4">
              生存戦略
            </h2>
            <div className="space-y-4">
              {result.strategies.map((s, i) => (
                <div
                  key={i}
                  className="border-l-2 border-cyan-500/50 pl-3"
                >
                  <p className="text-xs text-cyan-400 font-medium">
                    {s.timeframe}
                  </p>
                  <p className="text-sm text-zinc-100 mt-0.5">{s.action}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        {result.tips.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
            <h2 className="text-sm font-medium text-zinc-300 mb-4">
              データに基づく改善アドバイス
            </h2>
            <div className="space-y-3">
              {result.tips.map((tip, i) => (
                <div key={i} className="border-l-2 border-amber-500/50 pl-3">
                  <p className="text-sm font-medium text-amber-400">
                    {tip.label}
                  </p>
                  <p className="text-sm text-zinc-400 mt-0.5">{tip.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {result.actions.length > 0 && (
          <div className="bg-zinc-900 border border-red-700/30 rounded-lg p-6">
            <h2 className="text-sm font-medium text-zinc-300 mb-3">
              今すぐやること
            </h2>
            <div className="space-y-2">
              {result.actions.map((action, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-red-400 text-sm font-bold mt-0.5">
                    {i + 1}.
                  </span>
                  <p className="text-sm text-zinc-100">{action}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Share & Reset */}
        <div className="flex gap-3">
          <a
            href={`https://x.com/intent/tweet?text=${encodeURIComponent(
              `AI時代の生存率：${result.preview.survivalRate}%（${result.preview.survivalLabel}）\nキャリア分類：${result.preview.profileLabel}\n\n#AI生存診断`
            )}&url=${encodeURIComponent(
              `${window.location.origin}/share?rate=${result.preview.survivalRate}&label=${encodeURIComponent(result.preview.survivalLabel)}&tag=${encodeURIComponent(result.preview.profileLabel)}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-lg text-center transition-colors"
          >
            Xでシェア
          </a>
          <a
            href="/"
            className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-lg text-center transition-colors"
          >
            もう一度診断
          </a>
        </div>
      </div>
    </main>
  );
}
