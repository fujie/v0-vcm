import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { getServerCredentialTypes, formatCredentialTypeForAPI, validateApiKey } from "@/lib/server-data"
import { saveServerApiLog } from "@/lib/server-logs"

// /api/v1/credential-types エンドポイント - /api/credential-types と同じ機能
export async function GET(request: Request) {
  const startTime = Date.now()
  const headersList = headers()
  const requestHeaders: Record<string, string> = {}

  // リクエストヘッダーを取得
  headersList.forEach((value, key) => {
    requestHeaders[key] = value
  })

  try {
    // 認証ヘッダーを検証
    const apiKey = headersList.get("x-api-key") || headersList.get("authorization")?.replace("Bearer ", "")

    // APIキーの検証
    const isValidApiKey = validateApiKey(apiKey)

    if (!isValidApiKey) {
      const errorResponse = {
        success: false,
        message: "Invalid API key",
      }

      // エラーログを記録
      saveServerApiLog({
        timestamp: new Date().toISOString(),
        endpoint: "/api/v1/credential-types",
        method: "GET",
        source: "external",
        sourceIp: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
        requestHeaders,
        responseStatus: 401,
        responseBody: errorResponse,
        duration: Date.now() - startTime,
        success: false,
        error: "Invalid API key",
      })

      return NextResponse.json(errorResponse, { status: 401 })
    }

    // サーバーサイドからクレデンシャルタイプを取得
    const credentialTypes = getServerCredentialTypes()

    // Student Login Siteが期待する形式に変換
    const formattedCredentialTypes = credentialTypes
      .filter((ct) => ct.isActive) // 有効なもののみ
      .map((ct) => formatCredentialTypeForAPI(ct))

    const successResponse = {
      success: true,
      credentialTypes: formattedCredentialTypes,
      count: formattedCredentialTypes.length,
    }

    // 成功ログを記録
    saveServerApiLog({
      timestamp: new Date().toISOString(),
      endpoint: "/api/v1/credential-types",
      method: "GET",
      source: "external",
      sourceIp: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
      requestHeaders,
      responseStatus: 200,
      responseBody: { count: formattedCredentialTypes.length },
      duration: Date.now() - startTime,
      success: true,
    })

    return NextResponse.json(successResponse)
  } catch (error) {
    console.error("Credential types API error:", error)

    const errorResponse = {
      success: false,
      error: "Failed to fetch credential types",
    }

    // エラーログを記録
    saveServerApiLog({
      timestamp: new Date().toISOString(),
      endpoint: "/api/v1/credential-types",
      method: "GET",
      source: "external",
      sourceIp: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
      requestHeaders,
      responseStatus: 500,
      responseBody: errorResponse,
      duration: Date.now() - startTime,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

// OPTIONSリクエストをサポート
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
      "Access-Control-Max-Age": "86400",
    },
  })
}
