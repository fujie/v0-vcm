import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { validateApiKey, formatCredentialTypeForAPI } from "@/lib/server-data"
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

    // クライアントサイドのデータを取得（ヘッダーから）
    const clientCredentialTypesData = headersList.get("x-credential-types-data")
    let credentialTypes: any[] = []

    if (clientCredentialTypesData) {
      try {
        const decodedData = decodeURIComponent(clientCredentialTypesData)
        const parsedData = JSON.parse(decodedData)
        credentialTypes = parsedData.filter((ct: any) => ct.isActive)
        console.log("Using client-side credential types:", credentialTypes.length, "types")
      } catch (error) {
        console.error("Failed to parse client credential types data:", error)
      }
    }

    // クライアントサイドのデータがない場合は、環境変数から取得
    if (credentialTypes.length === 0) {
      try {
        const envData = process.env.CREDENTIAL_TYPES_DATA || process.env.NEXT_PUBLIC_CREDENTIAL_TYPES_DATA
        if (envData) {
          const parsedData = JSON.parse(envData)
          credentialTypes = parsedData.filter((ct: any) => ct.isActive)
          console.log("Using environment credential types:", credentialTypes.length, "types")
        }
      } catch (error) {
        console.error("Failed to parse environment credential types data:", error)
      }
    }

    // まだデータがない場合はデフォルトデータを使用
    if (credentialTypes.length === 0) {
      const defaultTypes = [
        {
          id: "1",
          name: "学生証",
          description: "大学の学生証明書",
          version: "1.0",
          schema: {
            type: "object",
            properties: {
              studentId: { type: "string", title: "学籍番号" },
              name: { type: "string", title: "氏名" },
              department: { type: "string", title: "学部" },
              year: { type: "number", title: "学年" },
              enrollmentDate: { type: "string", format: "date", title: "入学日" },
            },
            required: ["studentId", "name", "department", "year"],
          },
          createdAt: "2024-01-15",
          updatedAt: "2024-01-15",
          isActive: true,
        },
        {
          id: "2",
          name: "卒業証明書",
          description: "大学の卒業証明書",
          version: "1.0",
          schema: {
            type: "object",
            properties: {
              studentId: { type: "string", title: "学籍番号" },
              name: { type: "string", title: "氏名" },
              department: { type: "string", title: "学部" },
              graduationDate: { type: "string", format: "date", title: "卒業日" },
              degree: { type: "string", title: "学位" },
            },
            required: ["studentId", "name", "department", "graduationDate", "degree"],
          },
          createdAt: "2024-01-20",
          updatedAt: "2024-01-20",
          isActive: true,
        },
      ]
      credentialTypes = defaultTypes
      console.log("Using default credential types:", credentialTypes.length, "types")
    }

    // Student Login Site形式にフォーマット
    const formattedTypes = credentialTypes.map(formatCredentialTypeForAPI)

    console.log("Credential types count:", formattedTypes.length)
    console.log(
      "Formatted types:",
      formattedTypes.map((t) => ({ id: t.id, name: t.name })),
    )

    const successResponse = {
      success: true,
      data: {
        credentialTypes: formattedTypes,
        count: formattedTypes.length,
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
      responseBody: { count: formattedTypes.length },
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
