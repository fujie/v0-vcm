import { NextResponse } from "next/server"
import { headers } from "next/headers"

// /api/credentials/types エンドポイント - /api/credential-types と同じ機能
export async function GET(request: Request) {
  try {
    // 認証ヘッダーを検証
    const headersList = headers()
    const apiKey = headersList.get("x-api-key") || headersList.get("authorization")?.replace("Bearer ", "")

    // 実際の実装では、APIキーの検証を行う
    const isValidApiKey = apiKey && (apiKey.startsWith("sl_") || process.env.HEALTH_API_KEY === apiKey)

    if (!isValidApiKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid API key",
        },
        { status: 401 },
      )
    }

    // ローカルストレージからクレデンシャルタイプを取得
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

    return NextResponse.json({
      success: true,
      credentialTypes: formattedCredentialTypes,
      count: formattedCredentialTypes.length,
    })
  } catch (error) {
    console.error("Credential types API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch credential types",
      },
      { status: 500 },
    )
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
