// クレデンシャルタイプの変更をサーバーサイドに同期するヘルパー関数

export async function syncCredentialTypesToServer(apiKey?: string) {
  try {
    const credentialTypes = JSON.parse(localStorage.getItem("credentialTypes") || "[]")
    const integrationSettings = JSON.parse(localStorage.getItem("integrationSettings") || "{}")

    const effectiveApiKey = apiKey || integrationSettings.apiKey

    if (!effectiveApiKey) {
      console.warn("No API key available for sync")
      return false
    }

    console.log("Syncing credential types to server...")
    console.log(
      "Types to sync:",
      credentialTypes.map((ct: any) => ({ id: ct.id, name: ct.name })),
    )

    const response = await fetch("/api/vcm/sync-client-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        credentialTypes: credentialTypes,
        apiKey: effectiveApiKey,
      }),
    })

    const result = await response.json()

    if (result.success) {
      console.log("Credential types synced to server successfully:", result.data)
      return true
    } else {
      console.error("Failed to sync credential types to server:", result.error)
      return false
    }
  } catch (error) {
    console.error("Error syncing credential types to server:", error)
    return false
  }
}

// ローカルストレージの変更を監視して自動同期
export function setupCredentialTypesAutoSync() {
  let lastData = localStorage.getItem("credentialTypes") || "[]"

  const checkForChanges = () => {
    const currentData = localStorage.getItem("credentialTypes") || "[]"

    if (currentData !== lastData) {
      console.log("Credential types changed, triggering auto sync...")
      lastData = currentData

      // 少し遅延させて同期を実行
      setTimeout(() => {
        syncCredentialTypesToServer()
      }, 1000)
    }
  }

  // 定期的にチェック
  const interval = setInterval(checkForChanges, 5000) // 5秒ごと

  // ストレージイベントもリッスン
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === "credentialTypes") {
      console.log("Credential types storage event detected, triggering sync...")
      setTimeout(() => {
        syncCredentialTypesToServer()
      }, 1000)
    }
  }

  window.addEventListener("storage", handleStorageChange)

  return () => {
    clearInterval(interval)
    window.removeEventListener("storage", handleStorageChange)
  }
}
