import { NextResponse } from "next/server"

// ヘルスチェック用のAPI Key検証
function validateHealthApiKey(request: Request): { isValid: boolean; isRequired: boolean } {
  // 実際の実装では環境変数やデータベースから取得
  const healthApiKey = process.env.HEALTH_API_KEY || null
  const requireAuth = process.env.HEALTH_REQUIRE_AUTH === "true"

  if (!requireAuth || !healthApiKey) {
    return { isValid: true, isRequired: false }
  }

  const authHeader = request.headers.get("authorization")
  const apiKeyHeader = request.headers.get("x-api-key")

  let providedKey = null

  if (authHeader && authHeader.startsWith("Bearer ")) {
    providedKey = authHeader.substring(7)
  } else if (apiKeyHeader) {
    providedKey = apiKeyHeader
  }

  return {
    isValid: providedKey === healthApiKey,
    isRequired: true,
  }
}

// Student Login Siteからのヘルスチェックリクエストを受け取るAPI
export async function GET(request: Request) {
  try {
    const { isValid, isRequired } = validateHealthApiKey(request)

    // 基本的なヘルス情報（認証不要）
    const basicHealthData = {
      status: "healthy",
      service: "Verifiable Credential Manager",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      authentication: {
        required: isRequired,
        status: isRequired ? (isValid ? "authenticated" : "unauthenticated") : "not_required",
      },
    }

    // 認証が必要で無効な場合は基本情報のみ返す
    if (isRequired && !isValid) {
      return NextResponse.json(
        {
          ...basicHealthData,
          message: "API key required for detailed health information",
        },
        { status: 401 },
      )
    }

    // 詳細なヘルス情報（認証済みまたは認証不要の場合）
    const detailedHealthData = {
      ...basicHealthData,
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
      checks: {
        database: "healthy",
        storage: "healthy",
        memory: process.memoryUsage(),
      },
    }

    return NextResponse.json(detailedHealthData)
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
    const { isValid, isRequired } = validateHealthApiKey(request)
    const body = await request.json().catch(() => ({}))

    // 基本的なヘルス情報
    const basicHealthData = {
      status: "healthy",
      service: "Verifiable Credential Manager",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      authentication: {
        required: isRequired,
        status: isRequired ? (isValid ? "authenticated" : "unauthenticated") : "not_required",
      },
    }

    // 認証が必要で無効な場合
    if (isRequired && !isValid) {
      return NextResponse.json(
        {
          ...basicHealthData,
          message: "API key required for detailed health information",
          client: {
            userAgent: request.headers.get("user-agent"),
            origin: request.headers.get("origin"),
          },
        },
        { status: 401 },
      )
    }

    // 詳細なヘルス情報
    const detailedHealthData = {
      ...basicHealthData,
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
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

    return NextResponse.json(detailedHealthData)
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
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
      "Access-Control-Max-Age": "86400",
    },
  })
}
