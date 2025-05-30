import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { saveApiLog } from "@/lib/api-logs"

// Student Login Site向けのAPI エンドポイント
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

    // 実際の実装では、APIキーの検証を行う
    // ここでは簡易的な検証のみ
    const isValidApiKey = apiKey && (apiKey.startsWith("sl_") || process.env.HEALTH_API_KEY === apiKey)

    if (!isValidApiKey) {
      const errorResponse = {
        success: false,
        message: "Invalid API key",
      }

      // エラーログを記録
      saveApiLog({
        timestamp: new Date().toISOString(),
        endpoint: "/api/credential-types",
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

    // ローカルストレージからクレデンシャルタイプを取得
    // 実際の実装では、データベースから取得
    const storedCredentialTypes = localStorage.getItem("credentialTypes")
    const credentialTypes = storedCredentialTypes ? JSON.parse(storedCredentialTypes) : []

    // Student Login Siteが期待する形式に変換
    const formattedCredentialTypes = credentialTypes.map((ct: any) => ({
      id: ct.id,
      name: ct.name,
      description: ct.description,
      version: ct.version || "1.0.0",
      schema: {
        $schema: "https://json-schema.org/draft/2020-12/schema",
        type: "object",
        properties: ct.schema.properties,
        required: ct.schema.required || [],
        additionalProperties: false,
      },
      display: {
        name: ct.name,
        description: ct.description,
        locale: "ja-JP",
        backgroundColor: "#1e40af",
        textColor: "#ffffff",
      },
      issuanceConfig: {
        validityPeriod: 365,
        issuer: "https://vcm.example.com",
        context: ["https://www.w3.org/2018/credentials/v1"],
        type: ["VerifiableCredential", `${ct.name.replace(/\s/g, "")}Credential`],
        revocable: true,
        batchIssuance: false,
      },
      createdAt: ct.createdAt || new Date().toISOString(),
      updatedAt: ct.updatedAt || new Date().toISOString(),
      status: ct.isActive ? "active" : "inactive",
    }))

    const successResponse = {
      success: true,
      credentialTypes: formattedCredentialTypes,
      count: formattedCredentialTypes.length,
    }

    // 成功ログを記録
    saveApiLog({
      timestamp: new Date().toISOString(),
      endpoint: "/api/credential-types",
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
      message: error instanceof Error ? error.message : "Unknown error",
    }

    // エラーログを記録
    saveApiLog({
      timestamp: new Date().toISOString(),
      endpoint: "/api/credential-types",
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
