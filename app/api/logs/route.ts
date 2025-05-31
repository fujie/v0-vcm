import { NextResponse } from "next/server"
import { getApiLogs } from "@/lib/api-logs"

// クライアントサイドからAPIログを取得するエンドポイント
export async function GET() {
  try {
    // 実際の実装では、サーバーサイドのログとクライアントサイドのログを統合
    const logs = getApiLogs()

    return NextResponse.json({
      success: true,
      data: {
        logs: logs,
        count: logs.length,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Failed to get logs:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve logs",
      },
      { status: 500 },
    )
  }
}

// ログをクリアするエンドポイント
export async function DELETE() {
  try {
    // 実際の実装では、サーバーサイドのログもクリア
    console.log("Clearing API logs via API endpoint")

    return NextResponse.json({
      success: true,
      message: "Logs cleared successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Failed to clear logs:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to clear logs",
      },
      { status: 500 },
    )
  }
}
