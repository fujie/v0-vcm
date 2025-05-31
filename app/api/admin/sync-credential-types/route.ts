import { NextResponse } from "next/server"
import { updateServerCredentialTypes } from "@/lib/server-data"
import { saveServerApiLog } from "@/lib/server-logs"

// 管理者がクライアントサイドのデータをサーバーサイドに同期するAPI
export async function POST(request: Request) {
  const startTime = Date.now()

  console.log("=== ADMIN SYNC CREDENTIAL TYPES API CALLED ===")

  try {
    const body = await request.json()
    const { credentialTypes, adminToken } = body

    // 管理者認証をチェック（簡易版）
    if (!adminToken || adminToken !== "admin_sync_token") {
      const errorResponse = {
        success: false,
        error: "Unauthorized",
        message: "Valid admin token is required",
      }

      saveServerApiLog({
        timestamp: new Date().toISOString(),
        endpoint: "/api/admin/sync-credential-types",
        method: "POST",
        source: "internal",
        sourceIp: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
        requestHeaders: Object.fromEntries(request.headers.entries()),
        responseStatus: 401,
        responseBody: errorResponse,
        duration: Date.now() - startTime,
        success: false,
        error: "Unauthorized",
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
        endpoint: "/api/admin/sync-credential-types",
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

    // サーバーサイドのデータを更新
    const updateSuccess = updateServerCredentialTypes(credentialTypes)

    if (updateSuccess) {
      const successResponse = {
        success: true,
        data: {
          syncedCount: credentialTypes.length,
          timestamp: new Date().toISOString(),
          message: "Credential types synchronized to server successfully",
        },
      }

      saveServerApiLog({
        timestamp: new Date().toISOString(),
        endpoint: "/api/admin/sync-credential-types",
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
    } else {
      const errorResponse = {
        success: false,
        error: "Sync failed",
        message: "Failed to update server credential types",
      }

      saveServerApiLog({
        timestamp: new Date().toISOString(),
        endpoint: "/api/admin/sync-credential-types",
        method: "POST",
        source: "internal",
        sourceIp: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
        requestHeaders: Object.fromEntries(request.headers.entries()),
        requestBody: { credentialTypesCount: credentialTypes.length },
        responseStatus: 500,
        responseBody: errorResponse,
        duration: Date.now() - startTime,
        success: false,
        error: "Sync failed",
      })

      return NextResponse.json(errorResponse, { status: 500 })
    }
  } catch (error) {
    console.error("Admin sync error:", error)

    const errorResponse = {
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    }

    saveServerApiLog({
      timestamp: new Date().toISOString(),
      endpoint: "/api/admin/sync-credential-types",
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
