import { type NextRequest, NextResponse } from "next/server"

// Student Login SiteからのCredential発行リクエストを受け取るAPI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { credentialTypeId, recipientId, recipientName, data } = body

    // 新しいクレデンシャルを作成
    const newCredential = {
      id: `cred-${Date.now()}`,
      credentialTypeId,
      credentialTypeName: data.credentialTypeName || "Unknown",
      recipientId,
      recipientName,
      issuedAt: new Date().toISOString().split("T")[0],
      status: "active",
      data,
    }

    // 実際の実装では、データベースに保存
    // ここではレスポンスのみ返す
    console.log("新しいクレデンシャルが発行されました:", newCredential)

    return NextResponse.json({
      success: true,
      data: {
        credentialId: newCredential.id,
        issuedAt: newCredential.issuedAt,
        status: newCredential.status,
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to issue credential" }, { status: 500 })
  }
}
