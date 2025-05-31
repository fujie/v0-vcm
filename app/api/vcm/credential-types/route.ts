import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { getFormattedCredentialTypes, validateApiKey } from "@/lib/credential-types"
import { saveServerApiLog } from "@/lib/server-logs"

// Student Login Site向けの /api/vcm/credential-types エンドポイント
export async function GET(request: Request) {
  const startTime = Date.now()
  const headersList = headers()
  const requestHeaders: Record<string, string> = {}

  // リクエストヘッダーを取得
  headersList.forEach((value, key) => {
    requestHeaders[key] = value
  })

  console.log("=== VCM CREDENTIAL TYPES API CALLED ===")
  console.log("Headers:", requestHeaders)
  console.log("URL:", request.url)

  try {
    // 認証ヘッダーを検証
    const apiKey = headersList.get("x-api-key") || headersList.get("authorization")?.replace("Bearer ", "")

    console.log("API Key provided:", !!apiKey)
    console.log("API Key starts with sl_:", apiKey?.startsWith("sl_"))

    // APIキーの検証
    const isValidApiKey = validateApiKey(apiKey)

    if (!isValidApiKey) {
      const errorResponse = {
        success: false,
        message: "Invalid API key",
        error: "Authentication required",
      }

      console.log("Authentication failed")

      // サーバーログを記録
      saveServerApiLog({
        timestamp: new Date().toISOString(),
        endpoint: "/api/vcm/credential-types",
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

    // フォーマットされたクレデンシャルタイプを取得
    const credentialTypes = getFormattedCredentialTypes()

    console.log("Credential types count:", credentialTypes.length)

    const successResponse = {
      success: true,
      data: {
        credentialTypes: credentialTypes,
        count: credentialTypes.length,
        lastUpdated: new Date().toISOString(),
        version: "1.0.0",
      },
      meta: {
        endpoint: "/api/vcm/credential-types",
        timestamp: new Date().toISOString(),
        source: "vc-admin-system",
      },
    }

    console.log("Sending successful response")

    // サーバーログを記録
    saveServerApiLog({
      timestamp: new Date().toISOString(),
      endpoint: "/api/vcm/credential-types",
      method: "GET",
      source: "external",
      sourceIp: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
      requestHeaders,
      responseStatus: 200,
      responseBody: { count: credentialTypes.length },
      duration: Date.now() - startTime,
      success: true,
    })

    return NextResponse.json(successResponse)
  } catch (error) {
    console.error("VCM Credential types API error:", error)

    const errorResponse = {
      success: false,
      error: "Failed to fetch credential types",
      message: error instanceof Error ? error.message : "Unknown error",
    }

    // サーバーログを記録
    saveServerApiLog({
      timestamp: new Date().toISOString(),
      endpoint: "/api/vcm/credential-types",
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

// OPTIONSリクエストをサポート（CORS preflight）
export async function OPTIONS() {
  console.log("=== VCM CREDENTIAL TYPES OPTIONS CALLED ===")

  // OPTIONSリクエストもログに記録
  saveServerApiLog({
    timestamp: new Date().toISOString(),
    endpoint: "/api/vcm/credential-types",
    method: "OPTIONS",
    source: "external",
    sourceIp: "unknown",
    userAgent: "unknown",
    requestHeaders: {},
    responseStatus: 200,
    responseBody: { message: "CORS preflight" },
    duration: 0,
    success: true,
  })

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
