import { NextResponse } from "next/server"
import { getServerCredentialTypes, formatCredentialTypeForAPI } from "@/lib/server-data"

// テスト用のエンドポイント（認証なし）
export async function GET() {
  try {
    const credentialTypes = getServerCredentialTypes()
    const formattedCredentialTypes = credentialTypes
      .filter((ct) => ct.isActive)
      .map((ct) => formatCredentialTypeForAPI(ct))

    return NextResponse.json({
      success: true,
      message: "Test endpoint - no authentication required",
      credentialTypes: formattedCredentialTypes,
      count: formattedCredentialTypes.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Test credential types API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch credential types",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
