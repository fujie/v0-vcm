// クレデンシャルタイプのフォーマット用ユーティリティ関数

/**
 * ローカルストレージからクレデンシャルタイプを取得し、Student Login Site形式に変換
 */
export function getFormattedCredentialTypes() {
  try {
    // ブラウザ環境でのみ実行
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      // サーバーサイドの場合はデフォルトデータを返す
      return getDefaultCredentialTypes()
    }

    const storedCredentialTypes = localStorage.getItem("credentialTypes")
    const credentialTypes = storedCredentialTypes ? JSON.parse(storedCredentialTypes) : getDefaultCredentialTypes()

    return credentialTypes
      .filter((ct: any) => ct.isActive) // 有効なもののみ
      .map((ct: any) => formatCredentialType(ct))
  } catch (error) {
    console.error("Error getting credential types:", error)
    return getDefaultCredentialTypes().map((ct: any) => formatCredentialType(ct))
  }
}

/**
 * デフォルトのクレデンシャルタイプを取得
 */
function getDefaultCredentialTypes() {
  return [
    {
      id: "1",
      name: "学生証",
      description: "大学の学生証明書",
      version: "1.0",
      schema: {
        type: "object",
        properties: {
          studentId: { type: "string", title: "学籍番号" },
          name: { type: "string", title: "氏名" },
          department: { type: "string", title: "学部" },
          year: { type: "number", title: "学年" },
          enrollmentDate: { type: "string", format: "date", title: "入学日" },
        },
        required: ["studentId", "name", "department", "year"],
      },
      createdAt: "2024-01-15",
      updatedAt: "2024-01-15",
      isActive: true,
    },
    {
      id: "2",
      name: "卒業証明書",
      description: "大学の卒業証明書",
      version: "1.0",
      schema: {
        type: "object",
        properties: {
          studentId: { type: "string", title: "学籍番号" },
          name: { type: "string", title: "氏名" },
          department: { type: "string", title: "学部" },
          graduationDate: { type: "string", format: "date", title: "卒業日" },
          degree: { type: "string", title: "学位" },
        },
        required: ["studentId", "name", "department", "graduationDate", "degree"],
      },
      createdAt: "2024-01-20",
      updatedAt: "2024-01-20",
      isActive: true,
    },
  ]
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
