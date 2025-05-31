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
    console.log("API Log:", JSON.stringify(logEntry, null, 2))

    // 環境変数でログレベルを制御
    const nodeEnv = typeof process !== "undefined" && process.env ? process.env.NODE_ENV : "development"
    if (nodeEnv === "development") {
      console.log(`[${log.method}] ${log.endpoint} - ${log.responseStatus} (${log.duration}ms)`)
      if (!log.success && log.error) {
        console.error(`Error: ${log.error}`)
      }
    }

    return logEntry
  } catch (error) {
    console.error("Error saving server API log:", error)
    return null
  }
}
