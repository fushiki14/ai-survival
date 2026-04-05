import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記 | AI生存診断",
};

export default function TokushohoPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">特定商取引法に基づく表記</h1>
      <table className="w-full text-sm">
        <tbody className="divide-y divide-zinc-800">
          <tr>
            <th className="py-3 pr-4 text-left text-zinc-400 align-top w-40">
              販売業者
            </th>
            <td className="py-3">Miroku Works</td>
          </tr>
          <tr>
            <th className="py-3 pr-4 text-left text-zinc-400 align-top">
              運営責任者
            </th>
            <td className="py-3">
              請求があった場合に遅滞なく開示いたします
            </td>
          </tr>
          <tr>
            <th className="py-3 pr-4 text-left text-zinc-400 align-top">
              所在地
            </th>
            <td className="py-3">
              請求があった場合に遅滞なく開示いたします
            </td>
          </tr>
          <tr>
            <th className="py-3 pr-4 text-left text-zinc-400 align-top">
              電話番号
            </th>
            <td className="py-3">
              請求があった場合に遅滞なく開示いたします
            </td>
          </tr>
          <tr>
            <th className="py-3 pr-4 text-left text-zinc-400 align-top">
              メールアドレス
            </th>
            <td className="py-3">miroku_works@yahoo.co.jp</td>
          </tr>
          <tr>
            <th className="py-3 pr-4 text-left text-zinc-400 align-top">
              販売価格
            </th>
            <td className="py-3">500円（税込）</td>
          </tr>
          <tr>
            <th className="py-3 pr-4 text-left text-zinc-400 align-top">
              販売価格以外の費用
            </th>
            <td className="py-3">
              インターネット接続料等はお客様のご負担となります
            </td>
          </tr>
          <tr>
            <th className="py-3 pr-4 text-left text-zinc-400 align-top">
              支払方法
            </th>
            <td className="py-3">クレジットカード、Apple Pay、Google Pay（Stripe決済）</td>
          </tr>
          <tr>
            <th className="py-3 pr-4 text-left text-zinc-400 align-top">
              支払時期
            </th>
            <td className="py-3">購入時に即時決済</td>
          </tr>
          <tr>
            <th className="py-3 pr-4 text-left text-zinc-400 align-top">
              商品の引渡時期
            </th>
            <td className="py-3">決済完了後、即時表示</td>
          </tr>
          <tr>
            <th className="py-3 pr-4 text-left text-zinc-400 align-top">
              返品・キャンセル
            </th>
            <td className="py-3">
              デジタルコンテンツの性質上、購入後の返品・キャンセルはお受けしておりません
            </td>
          </tr>
          <tr>
            <th className="py-3 pr-4 text-left text-zinc-400 align-top">
              動作環境
            </th>
            <td className="py-3">
              JavaScript対応のモダンブラウザ（Chrome, Safari, Firefox, Edge）
            </td>
          </tr>
        </tbody>
      </table>
      <div className="mt-8">
        <a href="/" className="text-zinc-400 hover:text-zinc-200 text-sm">
          ← トップに戻る
        </a>
      </div>
    </main>
  );
}
