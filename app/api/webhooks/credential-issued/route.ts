import { type NextRequest, NextResponse } from "next/server"

// Student Login Siteからのクレデンシャル発行通知を受け取るWebhook
export async function POST(request: NextRequest) {
  try {
    // リクエストボディを取得
    const body = await request.json()

    // 認証ヘッダーを検証（実際の実装ではAPIキーやシークレットを検証）
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // 発行されたクレデンシャル情報を取得
    const { credentialId, credentialTypeId, recipientId, recipientName, data } = body

    // 既存のクレデンシャルを取得
    const issuedCredentials = JSON.parse(localStorage.getItem("issuedCredentials") || "[]")

    // クレデンシャルタイプ情報を取得
    const credentialTypes = JSON.parse(localStorage.getItem("credentialTypes") || "[]")
    const credentialType = credentialTypes.find((ct: any) => ct.id === credentialTypeId)

    if (!credentialType) {
      return NextResponse.json({ success: false, error: "Credential type not found" }, { status: 404 })
    }

    // 新しいクレデンシャルを作成
    const newCredential = {
      id: credentialId || `cred-${Date.now()}`,
      credentialTypeId,
      credentialTypeName: credentialType.name,
      recipientId,
      recipientName,
      issuedAt: new Date().toISOString().split("T")[0],
      status: "active",
      data,
    }

    // 発行済みクレデンシャルに追加
    const updatedCredentials = [...issuedCredentials, newCredential]
    localStorage.setItem("issuedCredentials", JSON.stringify(updatedCredentials))

    console.log("Webhook: クレデンシャルが発行されました", newCredential)

    return NextResponse.json({
      success: true,
      data: {
        credentialId: newCredential.id,
        status: "active",
      },
    })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
