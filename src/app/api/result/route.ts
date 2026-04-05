import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { decrypt } from "@/lib/crypto";

export const runtime = "edge";

async function sha256Base64(input: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input)
  );
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

export async function POST(req: NextRequest) {
  try {
    const { sessionId, encryptedPaid } = (await req.json()) as {
      sessionId: string;
      encryptedPaid: string;
    };

    if (!sessionId || !encryptedPaid) {
      return NextResponse.json(
        { error: "必要なパラメータが不足しています" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "決済が完了していません" },
        { status: 402 }
      );
    }

    const computedHash = await sha256Base64(encryptedPaid);
    if (session.metadata?.contentHash !== computedHash) {
      return NextResponse.json(
        { error: "不正なリクエストです" },
        { status: 403 }
      );
    }

    const decrypted = await decrypt(encryptedPaid);
    const paidContent = JSON.parse(decrypted);

    return NextResponse.json(paidContent);
  } catch (e) {
    console.error("Result fetch error:", e);
    return NextResponse.json(
      { error: "結果の取得に失敗しました" },
      { status: 500 }
    );
  }
}
