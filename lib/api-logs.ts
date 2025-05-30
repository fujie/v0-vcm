// APIリクエストログを管理するユーティリティ関数

export interface ApiLog {
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
 * APIログをローカルストレージに保存
 */
export function saveApiLog(log: Omit<ApiLog, "id">) {
  try {
    // ブラウザ環境でのみ実行
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      return null
    }

    const logs = getApiLogs()
    const newLog = {
      ...log,
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    }

    // 最大100件のログを保持
    const updatedLogs = [newLog, ...logs].slice(0, 100)
    localStorage.setItem("apiLogs", JSON.stringify(updatedLogs))

    return newLog
  } catch (error) {
    console.error("Error saving API log:", error)
    return null
  }
}

/**
 * APIログをローカルストレージから取得
 */
export function getApiLogs(): ApiLog[] {
  try {
    // ブラウザ環境でのみ実行
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      return []
    }

    const logs = localStorage.getItem("apiLogs")
    return logs ? JSON.parse(logs) : []
  } catch (error) {
    console.error("Error getting API logs:", error)
    return []
  }
}

/**
 * 特定のAPIログを取得
 */
export function getApiLogById(id: string): ApiLog | null {
  try {
    const logs = getApiLogs()
    return logs.find((log) => log.id === id) || null
  } catch (error) {
    console.error("Error getting API log by ID:", error)
    return null
  }
}

/**
 * APIログをクリア
 */
export function clearApiLogs() {
  try {
    localStorage.removeItem("apiLogs")
    return true
  } catch (error) {
    console.error("Error clearing API logs:", error)
    return false
  }
}
