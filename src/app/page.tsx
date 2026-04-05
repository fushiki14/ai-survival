"use client";

import { useState, useEffect } from "react";
import type { DiagnosisPreview } from "@/types/diagnosis";

type Step = "landing" | "quiz" | "input" | "preview" | "paying" | "result";

interface PreviewData {
  preview: DiagnosisPreview;
  firstFlaw: { quote: string; critique: string } | null;
  flawCount: number;
  encryptedPaid: string;
}

interface QuizAnswers {
  aiUsage: string;
  jobChange: string;
  learning: string;
}

const QUIZ_STEPS = [
  {
    key: "aiUsage" as const,
    question: "普段、AIツールをどのくらい使っている？",
    options: [
      { value: "daily", label: "毎日使っている" },
      { value: "weekly", label: "週に数回" },
      { value: "rarely", label: "ほとんど使わない" },
      { value: "never", label: "全く使わない" },
    ],
  },
  {
    key: "jobChange" as const,
    question: "転職経験は？",
    options: [
      { value: "none", label: "なし" },
      { value: "once", label: "1回" },
      { value: "few", label: "2〜3回" },
      { value: "many", label: "4回以上" },
    ],
  },
  {
    key: "learning" as const,
    question: "新しいスキルの学習は？",
    options: [
      { value: "active", label: "積極的に学んでいる" },
      { value: "sometimes", label: "たまに学ぶ" },
      { value: "passive", label: "必要に迫られたら" },
      { value: "none", label: "特に学んでいない" },
    ],
  },
];

export default function Home() {
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Partial<QuizAnswers>>({});
  const [careerText, setCareerText] = useState("");
  const [step, setStep] = useState<Step>("landing");
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("");
  const [diagnosisCount, setDiagnosisCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => setDiagnosisCount(d.count))
      .catch(() => {});
  }, []);

  const charCount = careerText.length;
  const uniqueChars = new Set(careerText.trim()).size;
  const canSubmit = careerText.trim().length >= 50 && uniqueChars >= 10;

  function handleQuizAnswer(value: string) {
    const currentQuestion = QUIZ_STEPS[quizStep];
    const updated = { ...quizAnswers, [currentQuestion.key]: value };
    setQuizAnswers(updated);

    if (quizStep < QUIZ_STEPS.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      setStep("input");
    }
  }

  function checkRateLimit(): boolean {
    const key = "survival_dates";
    const today = new Date().toISOString().slice(0, 10);
    const stored = localStorage.getItem(key);
    const dates: string[] = stored ? JSON.parse(stored) : [];
    const todayCount = dates.filter((d) => d === today).length;
    if (todayCount >= 2) return false;
    dates.push(today);
    const recent = dates.filter(
      (d) =>
        d >= new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)
    );
    localStorage.setItem(key, JSON.stringify(recent));
    return true;
  }

  async function handleDiagnose() {
    if (!checkRateLimit()) {
      setError(
        "本日の無料診断回数（2回）に達しました。明日またお試しください。"
      );
      return;
    }
    setLoading(true);
    setError("");

    const messages = [
      "解析中...",
      "スコアを算出中...",
      "データを照合中...",
      "レポートを生成中...",
    ];
    let msgIndex = 0;
    setLoadingMessage(messages[0]);
    const timer = setInterval(() => {
      msgIndex++;
      if (msgIndex < messages.length) {
        setLoadingMessage(messages[msgIndex]);
      }
    }, 3000);

    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ careerText, quiz: quizAnswers }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "診断に失敗しました");
      }
      const data = (await res.json()) as PreviewData;
      setPreviewData(data);
      localStorage.setItem("encrypted_paid", data.encryptedPaid);
      localStorage.setItem(
        "preview_data",
        JSON.stringify({
          preview: data.preview,
          firstFlaw: data.firstFlaw,
          flawCount: data.flawCount,
        })
      );
      setStep("preview");
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      clearInterval(timer);
      setLoading(false);
      setLoadingMessage("");
    }
  }

  async function handlePayment() {
    setStep("paying");
    try {
      const encryptedPaid =
        localStorage.getItem("encrypted_paid") || previewData?.encryptedPaid;
      const hashBuf = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(encryptedPaid || "")
      );
      const contentHash = btoa(
        String.fromCharCode(...new Uint8Array(hashBuf))
      );

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentHash }),
      });
      if (!res.ok) throw new Error("決済の開始に失敗しました");
      const { url } = await res.json();
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "決済エラー");
      setStep("preview");
    }
  }

  function handleReset() {
    setStep("landing");
    setQuizStep(0);
    setQuizAnswers({});
    setPreviewData(null);
    setCareerText("");
    setError("");
    localStorage.removeItem("encrypted_paid");
    localStorage.removeItem("preview_data");
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
      <div className="w-full max-w-lg">
        {/* Header */}
        {step !== "landing" && (
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              AI生存診断
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              九条レイ — AIキャリア生存アナリスト
            </p>
          </div>
        )}

        {/* Landing */}
        {step === "landing" && (
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
                あなたのキャリア、
                <br />
                <span className="text-red-500">AI時代に生き残れるか。</span>
              </h1>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-sm mx-auto">
                OpenAI・野村総研・WEF・PwCの研究データに基づき、
                あなたの職種とスキルをAIが5軸で容赦なく診断。
                生存率と具体的な生存戦略を即時提供。
              </p>
            </div>

            {diagnosisCount !== null && diagnosisCount > 0 && (
              <p className="text-xs text-zinc-500">
                {diagnosisCount.toLocaleString()}人が診断済み
              </p>
            )}

            <button
              onClick={() => setStep("quiz")}
              className="py-3.5 px-10 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors text-sm"
            >
              無料で診断する
            </button>

            <div className="text-xs text-zinc-600 space-y-1">
              <p>無料：生存率 + キャリア分類 + 致命的欠陥1件</p>
              <p>有料（500円）：5軸スコア + 全欠陥 + 生存戦略 + 改善提案</p>
            </div>
          </div>
        )}

        {/* Quiz */}
        {step === "quiz" && (
          <div className="space-y-6">
            <div className="flex gap-1.5 mb-2">
              {QUIZ_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full ${
                    i <= quizStep ? "bg-red-500" : "bg-zinc-800"
                  }`}
                />
              ))}
            </div>
            <p className="text-lg font-medium text-center">
              {QUIZ_STEPS[quizStep].question}
            </p>
            <div className="space-y-3">
              {QUIZ_STEPS[quizStep].options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleQuizAnswer(opt.value)}
                  className="w-full py-3 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-600 rounded-lg text-sm text-left transition-colors"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        {step === "input" && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-zinc-300 mb-2">
                あなたの職種・スキル・日々の業務内容を書いてください
              </label>
              <p className="text-xs text-zinc-500 mb-3">
                詳しく書くほど診断の精度が上がります。職種名、使っているツール、主な業務内容、得意なスキルなど。
              </p>
              <textarea
                value={careerText}
                onChange={(e) => setCareerText(e.target.value)}
                placeholder={"例：経理部で10年勤務。仕訳入力、月次決算、\n税務申告の補助が主な業務。Excel VBAで\n簡単な自動化はしているが、AIツールは\nまだ使っていない。簿記2級保持。"}
                rows={8}
                maxLength={3000}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 resize-none"
              />
              <div className="flex justify-between mt-1.5">
                <span
                  className={`text-xs ${
                    charCount < 20 ? "text-zinc-500" : "text-zinc-400"
                  }`}
                >
                  {charCount}文字{charCount < 50 && "（50文字以上）"}
                </span>
                <span className="text-xs text-zinc-600">最大3000文字</span>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg px-4 py-2">
                {error}
              </p>
            )}

            <button
              onClick={handleDiagnose}
              disabled={!canSubmit || loading}
              className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-medium rounded-lg transition-colors text-sm"
            >
              {loading ? loadingMessage : "診断する"}
            </button>
          </div>
        )}

        {/* Preview */}
        {step === "preview" && previewData && (
          <div className="space-y-6">
            {/* Survival Rate */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 text-center">
              <p className="text-xs text-zinc-500 mb-1">AI時代 生存率</p>
              <p
                className={`text-6xl font-bold ${rateColor(previewData.preview.survivalRate)}`}
              >
                {previewData.preview.survivalRate}%
              </p>
              <p className="text-sm text-zinc-400 mt-2">
                {previewData.preview.survivalLabel}
              </p>
            </div>

            {/* Profile Label */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 text-center">
              <p className="text-xs text-zinc-500 mb-1">キャリア分類</p>
              <p className="text-xl font-bold text-amber-400">
                {previewData.preview.profileLabel}
              </p>
            </div>

            {/* Verdict */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
              <p className="text-sm text-zinc-300 italic leading-relaxed">
                &quot;{previewData.preview.verdict}&quot;
              </p>
              <p className="text-xs text-zinc-500 mt-2 text-right">
                — 九条レイ
              </p>
            </div>

            {/* First Flaw (free) */}
            {previewData.firstFlaw && (
              <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
                <p className="text-xs text-zinc-500 mb-2">
                  致命的欠陥 1/{previewData.flawCount}
                </p>
                <p className="text-sm text-zinc-100">
                  「{previewData.firstFlaw.quote}」
                </p>
                <p className="text-sm text-zinc-400 mt-1.5 pl-3 border-l-2 border-red-500/50">
                  {previewData.firstFlaw.critique}
                </p>
              </div>
            )}

            {/* CTA */}
            <div className="bg-zinc-900 border border-red-700/30 rounded-lg p-6 space-y-4">
              <p className="text-sm text-zinc-300 text-center">
                5軸スコア分析・残り
                {Math.max(0, previewData.flawCount - 1)}
                件の致命的欠陥・
                <br />
                具体的な生存戦略を見る
              </p>
              <button
                onClick={handlePayment}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors text-sm"
              >
                詳細レポートを見る（500円）
              </button>
            </div>

            {/* Share */}
            <div className="flex gap-3">
              <a
                href={`https://x.com/intent/tweet?text=${encodeURIComponent(
                  `AI時代の生存率：${previewData.preview.survivalRate}%（${previewData.preview.survivalLabel}）\nキャリア分類：${previewData.preview.profileLabel}\n\n#AI生存診断`
                )}&url=${encodeURIComponent(
                  typeof window !== "undefined"
                    ? `${window.location.origin}/share?rate=${previewData.preview.survivalRate}&label=${encodeURIComponent(previewData.preview.survivalLabel)}&tag=${encodeURIComponent(previewData.preview.profileLabel)}`
                    : ""
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-lg text-center transition-colors"
              >
                Xでシェア
              </a>
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-lg text-center transition-colors"
              >
                もう一度診断
              </button>
            </div>
          </div>
        )}

        {/* Paying */}
        {step === "paying" && (
          <div className="text-center py-16">
            <p className="text-zinc-400">決済ページに移動中...</p>
          </div>
        )}
      </div>
    </main>
  );
}
