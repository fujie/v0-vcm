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
    // サーバーサイドでは何もしない
    if (typeof window === "undefined") {
      console.log("Server-side API log:", JSON.stringify(log, null, 2))
      return null
    }

    const logs = getApiLogs()
    const newLog = {
      ...log,
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    }

    // 最大200件のログを保持（増加）
    const updatedLogs = [newLog, ...logs].slice(0, 200)
    localStorage.setItem("apiLogs", JSON.stringify(updatedLogs))

    // ログページに変更を通知
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "apiLogs",
        newValue: JSON.stringify(updatedLogs),
        storageArea: localStorage,
      }),
    )

    console.log("API Log saved:", newLog)
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
    // サーバーサイドでは空配列を返す
    if (typeof window === "undefined") {
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
    if (typeof window === "undefined") {
      return false
    }

    localStorage.removeItem("apiLogs")

    // ログページに変更を通知
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "apiLogs",
        newValue: null,
        storageArea: localStorage,
      }),
    )

    return true
  } catch (error) {
    console.error("Error clearing API logs:", error)
    return false
  }
}

/**
 * クライアントサイドでAPIログを記録するためのヘルパー関数
 */
export function logClientApiRequest(
  endpoint: string,
  method: string,
  requestData?: any,
  responseData?: any,
  responseStatus?: number,
  duration?: number,
  error?: string,
) {
  if (typeof window === "undefined") return

  const log = {
    timestamp: new Date().toISOString(),
    endpoint,
    method,
    source: "client",
    sourceIp: "client",
    userAgent: navigator.userAgent,
    requestHeaders: {},
    requestBody: requestData,
    responseStatus: responseStatus || (error ? 500 : 200),
    responseBody: responseData,
    duration: duration || 0,
    success: !error && (responseStatus ? responseStatus < 400 : true),
    error,
  }

  saveApiLog(log)
}
