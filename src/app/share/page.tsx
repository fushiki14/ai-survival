import { Metadata } from "next";

interface Props {
  searchParams: Promise<{ rate?: string; label?: string; tag?: string }>;
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const params = await searchParams;
  const rate = params.rate || "??";
  const label = params.label || "";
  const tag = params.tag || "";

  const ogUrl = new URL(
    "/api/og",
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"
  );
  ogUrl.searchParams.set("rate", rate);
  ogUrl.searchParams.set("label", label);
  ogUrl.searchParams.set("tag", tag);

  const title = `生存率${rate}%（${label}）- ${tag}`;
  const description = "AI生存診断 — あなたのキャリア、AI時代に生き残れるか。";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogUrl.toString(), width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl.toString()],
    },
  };
}

export default async function SharePage({ searchParams }: Props) {
  const params = await searchParams;
  const rate = params.rate || "??";
  const label = params.label || "";
  const tag = params.tag || "";

  const rateNum = parseInt(rate);
  const color =
    rateNum <= 20
      ? "text-red-500"
      : rateNum <= 40
        ? "text-orange-500"
        : rateNum <= 60
          ? "text-yellow-500"
          : rateNum <= 80
            ? "text-green-500"
            : "text-cyan-400";

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg text-center space-y-6">
        <h1 className="text-2xl font-bold">AI生存診断</h1>

        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 space-y-4">
          <div>
            <p className="text-xs text-zinc-500">AI時代 生存率</p>
            <p className={`text-5xl font-bold mt-1 ${color}`}>{rate}%</p>
            <p className="text-sm text-zinc-400 mt-1">{label}</p>
          </div>
          <div className="border-t border-zinc-800 pt-4">
            <p className="text-xs text-zinc-500">キャリア分類</p>
            <p className="text-xl font-bold text-amber-400 mt-1">{tag}</p>
          </div>
        </div>

        <a
          href="/"
          className="inline-block py-3 px-8 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors text-sm"
        >
          自分のキャリアも診断する
        </a>
      </div>
    </main>
  );
}
