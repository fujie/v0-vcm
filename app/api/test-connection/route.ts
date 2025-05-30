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
      // まず基本的な接続テスト（ルートパスへのGETリクエスト）
      const response = await fetch(studentLoginUrl, {
        method: "GET",
        headers: {
          "User-Agent": "VC-Admin-System/1.0",
        },
        // タイムアウトを設定
        signal: AbortSignal.timeout(10000), // 10秒
      })

      if (!response.ok) {
        // 404や他のHTTPエラーでも、サイトが存在することは確認できる
        if (response.status === 404 || response.status === 403 || response.status === 405) {
          return NextResponse.json({
            success: true,
            data: {
              status: "connected",
              message: "Student Login Site is reachable",
              httpStatus: response.status,
              timestamp: new Date().toISOString(),
            },
          })
        }

        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // 成功レスポンス
      return NextResponse.json({
        success: true,
        data: {
          status: "connected",
          message: "Student Login Site is accessible",
          httpStatus: response.status,
          timestamp: new Date().toISOString(),
        },
      })
    } catch (fetchError) {
      console.error("Connection test failed:", fetchError)

      // より詳細なエラー情報を提供
      let errorMessage = "Connection failed"
      let errorDetails = "Unknown error"

      if (fetchError instanceof Error) {
        if (fetchError.name === "TimeoutError") {
          errorMessage = "Connection timeout"
          errorDetails = "The request timed out after 10 seconds"
        } else if (fetchError.message.includes("fetch")) {
          errorMessage = "Network error"
          errorDetails = "Unable to reach the Student Login Site"
        } else {
          errorDetails = fetchError.message
        }
      }

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          details: errorDetails,
          timestamp: new Date().toISOString(),
        },
        { status: 503 },
      )
    }
  } catch (error) {
    console.error("Test connection error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
