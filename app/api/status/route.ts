import { NextResponse } from "next/server"

// Safe function to get system information
function getSystemInfo() {
  try {
    return {
      uptime: typeof process !== "undefined" && process.uptime ? process.uptime() : 0,
      nodeVersion: typeof process !== "undefined" && process.version ? process.version : "unknown",
      platform: typeof process !== "undefined" && process.platform ? process.platform : "unknown",
      memory:
        typeof process !== "undefined" && process.memoryUsage
          ? process.memoryUsage()
          : {
              rss: 0,
              heapTotal: 0,
              heapUsed: 0,
              external: 0,
              arrayBuffers: 0,
            },
      pid: typeof process !== "undefined" && process.pid ? process.pid : 0,
      env: typeof process !== "undefined" && process.env ? process.env.NODE_ENV || "development" : "development",
    }
  } catch (error) {
    console.error("Error getting system info:", error)
    return {
      uptime: 0,
      nodeVersion: "unknown",
      platform: "unknown",
      memory: {
        rss: 0,
        heapTotal: 0,
        heapUsed: 0,
        external: 0,
        arrayBuffers: 0,
      },
      pid: 0,
      env: "development",
    }
  }
}

// より詳細なステータス情報を提供するAPI
export async function GET() {
  try {
    const systemInfo = getSystemInfo()

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
      uptime: systemInfo.uptime,
      environment: systemInfo.env,
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
        nodeVersion: systemInfo.nodeVersion,
        platform: systemInfo.platform,
        memory: systemInfo.memory,
        pid: systemInfo.pid,
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
