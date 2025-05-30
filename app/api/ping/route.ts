import { NextResponse } from "next/server"

// シンプルなping/pongエンドポイント
export async function GET() {
  return NextResponse.json({
    message: "pong",
    timestamp: new Date().toISOString(),
    service: "Verifiable Credential Manager",
  })
}

export async function POST() {
  return NextResponse.json({
    message: "pong",
    timestamp: new Date().toISOString(),
    service: "Verifiable Credential Manager",
  })
}
