import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシーポリシー | AI生存診断",
};

export default function PrivacyPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">プライバシーポリシー</h1>

      <div className="space-y-8 text-sm text-zinc-300 leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-zinc-100 mb-3">
            1. 収集する情報
          </h2>
          <p>「AI生存診断」（以下「本サービス」）では、以下の情報を取得します。</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>診断のために入力された職種・スキル・業務内容</li>
            <li>選択されたクイズ回答（AI活用度、転職経験、学習姿勢）</li>
            <li>
              決済に必要な情報（クレジットカード情報はStripe社が直接処理し、当方では保持しません）
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-100 mb-3">
            2. 利用目的
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>キャリア診断結果の生成</li>
            <li>決済処理</li>
            <li>サービスの改善・不具合対応</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-100 mb-3">
            3. データの保存・削除
          </h2>
          <p>
            入力されたキャリア情報は診断処理のためにのみ使用され、サーバーに永続的に保存されることはありません。診断完了後に自動で破棄されます。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-100 mb-3">
            4. 第三者への提供
          </h2>
          <p>
            本サービスでは、以下の外部サービスを利用しています。各サービスのプライバシーポリシーに従ってデータが処理されます。
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Stripe（決済処理）</li>
            <li>Anthropic（AI診断エンジン）</li>
            <li>Vercel（ホスティング）</li>
          </ul>
          <p className="mt-2">
            上記以外の第三者にお客様の情報を提供することはありません。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-100 mb-3">
            5. 免責事項
          </h2>
          <p>
            本サービスが提供する診断結果はAIによる分析であり、キャリアに関する専門的な助言を構成するものではありません。診断結果に基づく行動はご自身の判断と責任において行ってください。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-100 mb-3">
            6. Cookieについて
          </h2>
          <p>
            本サービスでは、決済処理およびアクセス解析の目的でCookieを使用する場合があります。ブラウザの設定によりCookieを無効にすることも可能ですが、一部機能が制限される場合があります。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-100 mb-3">
            7. お問い合わせ
          </h2>
          <p>
            個人情報の取り扱いに関するお問い合わせは、以下までご連絡ください。
          </p>
          <p className="mt-2">
            メールアドレス:{" "}
            <a
              href="mailto:miroku_works@yahoo.co.jp"
              className="text-zinc-100 underline hover:text-white"
            >
              miroku_works@yahoo.co.jp
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-100 mb-3">
            8. 改定について
          </h2>
          <p>
            本ポリシーは、必要に応じて予告なく改定する場合があります。改定後のポリシーは本ページに掲載した時点で効力を生じます。
          </p>
        </section>

        <p className="text-zinc-500 pt-4">制定日: 2026年4月6日</p>
      </div>

      <div className="mt-8">
        <a href="/" className="text-zinc-400 hover:text-zinc-200 text-sm">
          ← トップに戻る
        </a>
      </div>
    </main>
  );
}
