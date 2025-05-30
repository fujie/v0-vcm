import { type NextRequest, NextResponse } from "next/server"

// Student Login SiteからのCredential無効化リクエストを受け取るAPI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { credentialId, reason } = body

    // 実際の実装では、データベースでクレデンシャルを無効化
    console.log(`クレデンシャル ${credentialId} が無効化されました。理由: ${reason}`)

    return NextResponse.json({
      success: true,
      data: {
        credentialId,
        status: "revoked",
        revokedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to revoke credential" }, { status: 500 })
  }
}
