import { type NextRequest, NextResponse } from "next/server"

// Student Login Siteとの接続テストAPI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentLoginUrl, apiKey } = body

    if (!studentLoginUrl || !apiKey) {
      return NextResponse.json({ success: false, error: "Missing required parameters" }, { status: 400 })
    }

    try {
      // Student Login Siteのヘルスチェックエンドポイントにリクエスト
      const response = await fetch(`${studentLoginUrl}/api/health`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        // タイムアウトを設定
        signal: AbortSignal.timeout(10000), // 10秒
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      return NextResponse.json({
        success: true,
        data: {
          status: "connected",
          studentLoginSite: result,
          timestamp: new Date().toISOString(),
        },
      })
    } catch (fetchError) {
      console.error("Connection test failed:", fetchError)

      return NextResponse.json(
        {
          success: false,
          error: "Connection failed",
          details: fetchError instanceof Error ? fetchError.message : "Unknown error",
        },
        { status: 503 },
      )
    }
  } catch (error) {
    console.error("Test connection error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
