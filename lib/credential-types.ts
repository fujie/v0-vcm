// クレデンシャルタイプのフォーマット用ユーティリティ関数

/**
 * ローカルストレージからクレデンシャルタイプを取得し、Student Login Site形式に変換
 */
export function getFormattedCredentialTypes() {
  try {
    // ブラウザ環境でのみ実行
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      return []
    }

    const storedCredentialTypes = localStorage.getItem("credentialTypes")
    const credentialTypes = storedCredentialTypes ? JSON.parse(storedCredentialTypes) : []

    return credentialTypes.map((ct: any) => formatCredentialType(ct))
  } catch (error) {
    console.error("Error getting credential types:", error)
    return []
  }
}

/**
 * クレデンシャルタイプをStudent Login Site形式に変換
 */
export function formatCredentialType(credentialType: any) {
  return {
    id: credentialType.id,
    name: credentialType.name,
    description: credentialType.description,
    version: credentialType.version || "1.0.0",
    schema: {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      type: "object",
      properties: credentialType.schema.properties,
      required: credentialType.schema.required || [],
      additionalProperties: false,
    },
    display: {
      name: credentialType.name,
      description: credentialType.description,
      locale: "ja-JP",
      backgroundColor: "#1e40af",
      textColor: "#ffffff",
    },
    issuanceConfig: {
      validityPeriod: 365,
      issuer: "https://vcm.example.com",
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential", `${credentialType.name.replace(/\s/g, "")}Credential`],
      revocable: true,
      batchIssuance: false,
    },
    createdAt: credentialType.createdAt || new Date().toISOString(),
    updatedAt: credentialType.updatedAt || new Date().toISOString(),
    status: credentialType.isActive ? "active" : "inactive",
  }
}

/**
 * APIキーの検証
 */
export function validateApiKey(apiKey: string | null) {
  if (!apiKey) return false

  // 環境変数のAPI Keyと一致するか、sl_で始まるキーを許可
  return apiKey.startsWith("sl_") || apiKey === process.env.HEALTH_API_KEY
}
