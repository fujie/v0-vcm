import { type NextRequest, NextResponse } from "next/server"

// Student Login Siteとの接続テスト用API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentLoginUrl, apiKey } = body

    if (!studentLoginUrl) {
      return NextResponse.json({ success: false, error: "Student Login Site URLが必要です" }, { status: 400 })
    }

    // 接続テスト
    try {
      // まずヘルスチェックエンドポイントを試す
      const healthEndpoints = ["/api/health", "/api/status", "/health", "/api/v1/health"]

      for (const endpoint of healthEndpoints) {
        try {
          const healthUrl = `${studentLoginUrl}${endpoint}`
          console.log(`Trying health endpoint: ${healthUrl}`)

          const response = await fetch(healthUrl, {
            method: "GET",
            headers: {
              "User-Agent": "VC-Admin-System/1.0",
              ...(apiKey
                ? {
                    Authorization: `Bearer ${apiKey}`,
                    "X-API-Key": apiKey,
                  }
                : {}),
            },
            signal: AbortSignal.timeout(5000), // 5秒タイムアウト
          })

          if (response.ok) {
            const data = await response.json()

            return NextResponse.json({
              success: true,
              data: {
                status: "connected",
                message: "Student Login Siteに接続できました",
                endpoint: endpoint,
                healthData: data,
                timestamp: new Date().toISOString(),
              },
            })
          }
        } catch (endpointError) {
          console.error(`Error testing ${endpoint}:`, endpointError)
          continue
        }
      }

      // ヘルスチェックが失敗した場合、ルートパスを試す
      const rootResponse = await fetch(studentLoginUrl, {
        method: "GET",
        headers: {
          "User-Agent": "VC-Admin-System/1.0",
        },
        signal: AbortSignal.timeout(5000),
      })

      if (rootResponse.ok || rootResponse.status === 404) {
        return NextResponse.json({
          success: true,
          data: {
            status: "connected",
            message: "Student Login Siteに接続できましたが、ヘルスチェックエンドポイントが見つかりませんでした",
            httpStatus: rootResponse.status,
            timestamp: new Date().toISOString(),
          },
        })
      }

      throw new Error(`HTTP error! status: ${rootResponse.status}`)
    } catch (fetchError) {
      console.error("Connection test failed:", fetchError)

      let errorMessage = "接続に失敗しました"
      let errorDetails = "不明なエラー"

      if (fetchError instanceof Error) {
        if (fetchError.name === "TimeoutError" || fetchError.name === "AbortError") {
          errorMessage = "接続タイムアウト"
          errorDetails = "リクエストが5秒以内に完了しませんでした"
        } else if (fetchError.message.includes("fetch")) {
          errorMessage = "ネットワークエラー"
          errorDetails = "Student Login Siteに到達できません"
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
    return NextResponse.json({ success: false, error: "内部サーバーエラー" }, { status: 500 })
  }
}
