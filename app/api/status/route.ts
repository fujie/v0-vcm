import { NextResponse } from "next/server"

// より詳細なステータス情報を提供するAPI
export async function GET() {
  try {
    // ローカルストレージのデータを取得（実際の実装ではデータベースから取得）
    const credentialTypesCount = 2 // デフォルト値
    const issuedCredentialsCount = 3 // デフォルト値
    const integrationSettings = {
      enabled: false,
      connectionStatus: "disconnected",
    }

    const statusData = {
      service: "Verifiable Credential Manager",
      version: "1.0.0",
      status: "operational",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      statistics: {
        credentialTypes: {
          total: credentialTypesCount,
          active: credentialTypesCount,
        },
        credentials: {
          total: issuedCredentialsCount,
          active: issuedCredentialsCount,
          revoked: 0,
        },
      },
      integration: {
        studentLoginSite: {
          enabled: integrationSettings.enabled,
          status: integrationSettings.connectionStatus,
          lastSync: null,
        },
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        memory: process.memoryUsage(),
        pid: process.pid,
      },
      endpoints: {
        health: "/api/health",
        status: "/api/status",
        credentialTypes: "/api/credential-types",
        credentialIssue: "/api/credentials/issue",
        credentialRevoke: "/api/credentials/revoke",
        webhooks: {
          credentialIssued: "/api/webhooks/credential-issued",
          credentialRevoked: "/api/webhooks/credential-revoked",
        },
        sync: "/api/sync/credential-types",
        testConnection: "/api/test-connection",
      },
    }

    return NextResponse.json(statusData)
  } catch (error) {
    console.error("Status check failed:", error)

    return NextResponse.json(
      {
        service: "Verifiable Credential Manager",
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
