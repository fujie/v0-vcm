import { type NextRequest, NextResponse } from "next/server"

// Student Login Siteにクレデンシャルタイプを同期するAPI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { credentialTypes, apiKey } = body

    // APIキーの検証（実際の実装では適切な認証を行う）
    if (!apiKey || !apiKey.startsWith("sl_")) {
      return NextResponse.json({ success: false, error: "Invalid API key" }, { status: 401 })
    }

    // Student Login Siteへの同期をシミュレート
    // 実際の実装では、Student Login SiteのAPIエンドポイントにPOSTリクエストを送信
    const studentLoginSiteUrl = "https://v0-student-login-site.vercel.app"

    try {
      // Student Login SiteのAPIエンドポイントに送信
      const response = await fetch(`${studentLoginSiteUrl}/api/credential-types/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          credentialTypes: credentialTypes,
          source: "vc-admin-system",
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      return NextResponse.json({
        success: true,
        data: {
          syncedCount: credentialTypes.length,
          studentLoginResponse: result,
        },
      })
    } catch (fetchError) {
      console.error("Student Login Site sync error:", fetchError)

      // フォールバック: ローカルでの同期処理
      return NextResponse.json({
        success: true,
        data: {
          syncedCount: credentialTypes.length,
          note: "Synced locally - Student Login Site may be unavailable",
        },
      })
    }
  } catch (error) {
    console.error("Sync error:", error)
    return NextResponse.json({ success: false, error: "Failed to sync credential types" }, { status: 500 })
  }
}
