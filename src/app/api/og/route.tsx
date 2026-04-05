import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rate = searchParams.get("rate") || "??";
  const label = searchParams.get("label") || "";
  const tag = searchParams.get("tag") || "";

  const rateNum = parseInt(rate);
  const color =
    rateNum <= 20
      ? "#ef4444"
      : rateNum <= 40
        ? "#f97316"
        : rateNum <= 60
          ? "#eab308"
          : rateNum <= 80
            ? "#22c55e"
            : "#06b6d4";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090b",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 32, color: "#a1a1aa", marginBottom: 16 }}>
          AI生存診断
        </div>
        <div style={{ fontSize: 24, color: "#a1a1aa", marginBottom: 8 }}>
          生存率
        </div>
        <div style={{ fontSize: 120, fontWeight: 700, color, lineHeight: 1 }}>
          {rate}%
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#a1a1aa",
            marginTop: 12,
          }}
        >
          {label}
        </div>
        {tag && (
          <div
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: "#f59e0b",
              marginTop: 24,
            }}
          >
            {tag}
          </div>
        )}
        <div
          style={{
            fontSize: 18,
            color: "#52525b",
            marginTop: 32,
          }}
        >
          九条レイ — AIキャリア生存アナリスト
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
