import { NextResponse } from "next/server"

// Student Login Siteからのヘルスチェックリクエストを受け取るAPI
export async function GET() {
  try {
    // システムの基本的な健全性をチェック
    const healthData = {
      status: "healthy",
      service: "Verifiable Credential Manager",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      features: {
        credentialTypes: true,
        credentialIssuance: true,
        credentialRevocation: true,
        webhooks: true,
        sync: true,
      },
      endpoints: {
        credentialTypes: "/api/credential-types",
        credentialIssue: "/api/credentials/issue",
        credentialRevoke: "/api/credentials/revoke",
        webhookCredentialIssued: "/api/webhooks/credential-issued",
        webhookCredentialRevoked: "/api/webhooks/credential-revoked",
        sync: "/api/sync/credential-types",
      },
    }

    // 基本的なシステムチェック
    const checks = {
      database: "healthy", // 実際の実装ではデータベース接続をチェック
      storage: "healthy", // 実際の実装ではストレージ接続をチェック
      memory: process.memoryUsage(),
    }

    return NextResponse.json({
      ...healthData,
      checks,
    })
  } catch (error) {
    console.error("Health check failed:", error)

    return NextResponse.json(
      {
        status: "unhealthy",
        service: "Verifiable Credential Manager",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 },
    )
  }
}

// POSTリクエストもサポート（Student Login Siteが認証情報を送信する場合）
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const authHeader = request.headers.get("authorization")

    // 認証情報がある場合は検証
    let authStatus = "none"
    if (authHeader) {
      if (authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7)
        // 実際の実装では適切なトークン検証を行う
        authStatus = token.startsWith("sl_") ? "valid" : "invalid"
      } else {
        authStatus = "invalid_format"
      }
    }

    const healthData = {
      status: "healthy",
      service: "Verifiable Credential Manager",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      authentication: {
        status: authStatus,
        required: false, // ヘルスチェックには認証不要
      },
      client: {
        userAgent: request.headers.get("user-agent"),
        origin: request.headers.get("origin"),
        requestBody: body,
      },
      features: {
        credentialTypes: true,
        credentialIssuance: true,
        credentialRevocation: true,
        webhooks: true,
        sync: true,
      },
      endpoints: {
        credentialTypes: "/api/credential-types",
        credentialIssue: "/api/credentials/issue",
        credentialRevoke: "/api/credentials/revoke",
        webhookCredentialIssued: "/api/webhooks/credential-issued",
        webhookCredentialRevoked: "/api/webhooks/credential-revoked",
        sync: "/api/sync/credential-types",
      },
    }

    return NextResponse.json(healthData)
  } catch (error) {
    console.error("Health check POST failed:", error)

    return NextResponse.json(
      {
        status: "unhealthy",
        service: "Verifiable Credential Manager",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 },
    )
  }
}

// OPTIONSリクエストをサポート（CORS preflight）
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  })
}
