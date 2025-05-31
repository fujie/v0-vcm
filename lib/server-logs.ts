// サーバーサイドでのログ記録用ユーティリティ

export interface ServerApiLog {
  id: string
  timestamp: string
  endpoint: string
  method: string
  source: string
  sourceIp?: string
  userAgent?: string
  requestHeaders?: Record<string, string>
  requestBody?: any
  responseStatus: number
  responseBody?: any
  duration: number
  success: boolean
  error?: string
}

/**
 * サーバーサイドでAPIログを記録
 * 実際の実装では、データベースやログファイルに保存
 */
export function saveServerApiLog(log: Omit<ServerApiLog, "id">) {
  try {
    const logEntry = {
      ...log,
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    }

    // コンソールにログを出力（実際の実装ではデータベースに保存）
    console.log("=== SERVER API LOG ===")
    console.log(`[${log.method}] ${log.endpoint} - ${log.responseStatus} (${log.duration}ms)`)
    console.log("Source:", log.source)
    console.log("Success:", log.success)
    if (!log.success && log.error) {
      console.error("Error:", log.error)
    }
    console.log("Full log:", JSON.stringify(logEntry, null, 2))
    console.log("======================")

    // 環境変数でログレベルを制御
    const nodeEnv = typeof process !== "undefined" && process.env ? process.env.NODE_ENV : "development"
    if (nodeEnv === "development") {
      // 開発環境では詳細ログを出力
      if (log.requestBody) {
        console.log("Request Body:", JSON.stringify(log.requestBody, null, 2))
      }
      if (log.responseBody) {
        console.log("Response Body:", JSON.stringify(log.responseBody, null, 2))
      }
    }

    return logEntry
  } catch (error) {
    console.error("Error saving server API log:", error)
    return null
  }
}

/**
 * クライアントサイドでアクセス可能なログを取得するためのAPI
 */
export function getServerLogsForClient(): ServerApiLog[] {
  // 実際の実装では、データベースから最新のログを取得
  // ここでは空配列を返す（実装は後で追加）
  return []
}
