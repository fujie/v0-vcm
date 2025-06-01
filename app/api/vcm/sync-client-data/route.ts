import { NextResponse } from "next/server"
import { validateApiKey } from "@/lib/server-data"
import { saveServerApiLog } from "@/lib/server-logs"

// クライアントサイドのクレデンシャルタイプデータをサーバーサイドに同期するAPI
export async function POST(request: Request) {
  const startTime = Date.now()

  console.log("=== VCM SYNC CLIENT DATA API CALLED ===")

  try {
    const body = await request.json()
    const { credentialTypes, apiKey } = body

    // APIキーの検証
    const isValidApiKey = validateApiKey(apiKey)

    if (!isValidApiKey) {
      const errorResponse = {
        success: false,
        error: "Invalid API key",
        message: "Authentication required",
      }

      saveServerApiLog({
        timestamp: new Date().toISOString(),
        endpoint: "/api/vcm/sync-client-data",
        method: "POST",
        source: "internal",
        sourceIp: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
        requestHeaders: Object.fromEntries(request.headers.entries()),
        responseStatus: 401,
        responseBody: errorResponse,
        duration: Date.now() - startTime,
        success: false,
        error: "Invalid API key",
      })

      return NextResponse.json(errorResponse, { status: 401 })
    }

    if (!credentialTypes || !Array.isArray(credentialTypes)) {
      const errorResponse = {
        success: false,
        error: "Invalid data",
        message: "credentialTypes must be an array",
      }

      saveServerApiLog({
        timestamp: new Date().toISOString(),
        endpoint: "/api/vcm/sync-client-data",
        method: "POST",
        source: "internal",
        sourceIp: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
        requestHeaders: Object.fromEntries(request.headers.entries()),
        requestBody: { credentialTypesCount: "invalid" },
        responseStatus: 400,
        responseBody: errorResponse,
        duration: Date.now() - startTime,
        success: false,
        error: "Invalid data",
      })

      return NextResponse.json(errorResponse, { status: 400 })
    }

    // 環境変数にデータを保存（実際の実装ではデータベースに保存）
    process.env.CREDENTIAL_TYPES_DATA = JSON.stringify(credentialTypes)

    console.log("=== CLIENT DATA SYNCED TO SERVER ===")
    console.log("Synced credential types count:", credentialTypes.length)
    console.log(
      "Credential types:",
      credentialTypes.map((ct: any) => ({ id: ct.id, name: ct.name })),
    )
    console.log("=====================================")

    const successResponse = {
      success: true,
      data: {
        syncedCount: credentialTypes.length,
        timestamp: new Date().toISOString(),
        message: "Client credential types synchronized to server successfully",
      },
    }

    saveServerApiLog({
      timestamp: new Date().toISOString(),
      endpoint: "/api/vcm/sync-client-data",
      method: "POST",
      source: "internal",
      sourceIp: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
      requestHeaders: Object.fromEntries(request.headers.entries()),
      requestBody: { credentialTypesCount: credentialTypes.length },
      responseStatus: 200,
      responseBody: successResponse,
      duration: Date.now() - startTime,
      success: true,
    })

    return NextResponse.json(successResponse)
  } catch (error) {
    console.error("VCM sync client data error:", error)

    const errorResponse = {
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    }

    saveServerApiLog({
      timestamp: new Date().toISOString(),
      endpoint: "/api/vcm/sync-client-data",
      method: "POST",
      source: "internal",
      sourceIp: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
      requestHeaders: Object.fromEntries(request.headers.entries()),
      responseStatus: 500,
      responseBody: errorResponse,
      duration: Date.now() - startTime,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })

    return NextResponse.json(errorResponse, { status: 500 })
  }
}
