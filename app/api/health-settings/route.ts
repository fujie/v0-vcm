import { type NextRequest, NextResponse } from "next/server"

// ヘルスチェック設定を管理するAPI
export async function GET() {
  try {
    // 実際の実装では環境変数やデータベースから取得
    const settings = {
      requireAuth: process.env.HEALTH_REQUIRE_AUTH === "true",
      hasApiKey: !!process.env.HEALTH_API_KEY,
      endpoints: {
        health: "/api/health",
        status: "/api/status",
        ping: "/api/ping",
      },
    }

    return NextResponse.json({
      success: true,
      data: settings,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to get health settings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { requireAuth, apiKey, action } = body

    // 管理者認証をチェック（実際の実装では適切な認証を行う）
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer admin_")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    if (action === "generate_key") {
      // 新しいAPI Keyを生成
      const newApiKey =
        "health_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

      return NextResponse.json({
        success: true,
        data: {
          apiKey: newApiKey,
          message: "New API key generated. Please save this key securely.",
        },
      })
    }

    if (action === "update_settings") {
      // 設定を更新（実際の実装では環境変数やデータベースを更新）
      console.log("Health check settings updated:", { requireAuth, hasApiKey: !!apiKey })

      return NextResponse.json({
        success: true,
        data: {
          requireAuth: requireAuth,
          hasApiKey: !!apiKey,
          message: "Settings updated successfully",
        },
      })
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update health settings" }, { status: 500 })
  }
}
