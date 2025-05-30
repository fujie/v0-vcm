import { type NextRequest, NextResponse } from "next/server"

// Student Login Siteからのクレデンシャル無効化通知を受け取るWebhook
export async function POST(request: NextRequest) {
  try {
    // リクエストボディを取得
    const body = await request.json()

    // 認証ヘッダーを検証（実際の実装ではAPIキーやシークレットを検証）
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // 無効化するクレデンシャルIDを取得
    const { credentialId, reason } = body

    if (!credentialId) {
      return NextResponse.json({ success: false, error: "Credential ID is required" }, { status: 400 })
    }

    // 既存のクレデンシャルを取得
    const issuedCredentials = JSON.parse(localStorage.getItem("issuedCredentials") || "[]")

    // クレデンシャルを見つける
    const credentialIndex = issuedCredentials.findIndex((cred: any) => cred.id === credentialId)

    if (credentialIndex === -1) {
      return NextResponse.json({ success: false, error: "Credential not found" }, { status: 404 })
    }

    // クレデンシャルを無効化
    issuedCredentials[credentialIndex].status = "revoked"
    issuedCredentials[credentialIndex].revokedAt = new Date().toISOString().split("T")[0]
    issuedCredentials[credentialIndex].revocationReason = reason || "Revoked via webhook"

    // 更新したクレデンシャルを保存
    localStorage.setItem("issuedCredentials", JSON.stringify(issuedCredentials))

    console.log("Webhook: クレデンシャルが無効化されました", {
      credentialId,
      reason,
    })

    return NextResponse.json({
      success: true,
      data: {
        credentialId,
        status: "revoked",
        revokedAt: issuedCredentials[credentialIndex].revokedAt,
      },
    })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
