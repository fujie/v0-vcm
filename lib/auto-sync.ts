// 自動同期機能のユーティリティ

interface SyncOptions {
  apiKey: string
  enabled: boolean
  studentLoginUrl: string
}

/**
 * クレデンシャルタイプの変更を監視し、自動同期を実行
 */
export function setupAutoSync(options: SyncOptions) {
  if (!options.enabled) {
    console.log("Auto sync is disabled")
    return
  }

  // ローカルストレージの変更を監視
  const handleStorageChange = async (e: StorageEvent) => {
    if (e.key === "credentialTypes" && e.newValue) {
      console.log("Credential types changed, triggering auto sync...")

      try {
        const credentialTypes = JSON.parse(e.newValue)
        await syncToStudentLoginSite(credentialTypes, options)
      } catch (error) {
        console.error("Auto sync failed:", error)
      }
    }
  }

  // イベントリスナーを追加
  window.addEventListener("storage", handleStorageChange)

  // クリーンアップ関数を返す
  return () => {
    window.removeEventListener("storage", handleStorageChange)
  }
}

/**
 * Student Login Siteへの同期を実行
 */
async function syncToStudentLoginSite(credentialTypes: any[], options: SyncOptions) {
  try {
    const response = await fetch("/api/vcm/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        credentialTypes: credentialTypes.filter((ct: any) => ct.isActive),
        apiKey: options.apiKey,
        action: "auto-sync",
      }),
    })

    const result = await response.json()

    if (result.success) {
      console.log("Auto sync completed:", result.data)

      // 成功通知を表示（オプション）
      if (typeof window !== "undefined" && window.dispatchEvent) {
        window.dispatchEvent(
          new CustomEvent("autoSyncCompleted", {
            detail: result.data,
          }),
        )
      }
    } else {
      console.error("Auto sync failed:", result.error)
    }
  } catch (error) {
    console.error("Auto sync error:", error)
  }
}

/**
 * 手動同期を実行
 */
export async function manualSync(options: SyncOptions) {
  try {
    const credentialTypes = JSON.parse(localStorage.getItem("credentialTypes") || "[]")

    const response = await fetch("/api/vcm/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        credentialTypes: credentialTypes.filter((ct: any) => ct.isActive),
        apiKey: options.apiKey,
        action: "manual-sync",
      }),
    })

    const result = await response.json()
    return result
  } catch (error) {
    console.error("Manual sync error:", error)
    throw error
  }
}
