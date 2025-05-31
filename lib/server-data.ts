// サーバーサイドでのデータ管理用ユーティリティ

interface CredentialType {
  id: string
  name: string
  description: string
  version: string
  schema: any
  createdAt: string
  updatedAt: string
  isActive: boolean
}

// デフォルトのクレデンシャルタイプデータ
const defaultCredentialTypes: CredentialType[] = [
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

/**
 * サーバーサイドでクレデンシャルタイプを取得
 * 環境変数から最新のデータを取得し、なければデフォルトデータを使用
 */
export function getServerCredentialTypes(): CredentialType[] {
  try {
    // 環境変数からカスタムデータを取得する場合
    const customData = process.env.CREDENTIAL_TYPES_DATA
    if (customData) {
      try {
        const parsedData = JSON.parse(customData)
        console.log("Using credential types from environment variable:", parsedData.length, "types")
        return parsedData
      } catch (error) {
        console.error("Failed to parse custom credential types data:", error)
      }
    }

    // NEXT_PUBLIC_ 環境変数からも試行（クライアントサイドで設定された場合）
    const publicData = process.env.NEXT_PUBLIC_CREDENTIAL_TYPES_DATA
    if (publicData) {
      try {
        const parsedData = JSON.parse(publicData)
        console.log("Using credential types from public environment variable:", parsedData.length, "types")
        return parsedData
      } catch (error) {
        console.error("Failed to parse public credential types data:", error)
      }
    }

    console.log("Using default credential types:", defaultCredentialTypes.length, "types")
    return defaultCredentialTypes
  } catch (error) {
    console.error("Error getting server credential types:", error)
    return defaultCredentialTypes
  }
}

/**
 * クレデンシャルタイプをStudent Login Site形式に変換
 */
export function formatCredentialTypeForAPI(credentialType: CredentialType) {
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
export function validateApiKey(apiKey: string | null): boolean {
  if (!apiKey) return false

  // 環境変数のAPI Keyと一致するか、sl_で始まるキーを許可
  return apiKey.startsWith("sl_") || apiKey === process.env.HEALTH_API_KEY
}

/**
 * サーバーサイドでクレデンシャルタイプデータを更新
 * 実際の実装では、データベースに保存するが、ここでは環境変数に保存をシミュレート
 */
export function updateServerCredentialTypes(credentialTypes: CredentialType[]): boolean {
  try {
    // 実際の実装では、データベースに保存
    // ここでは、ログに出力してデータが更新されたことを示す
    console.log("=== UPDATING SERVER CREDENTIAL TYPES ===")
    console.log("New credential types count:", credentialTypes.length)
    console.log("Credential types:", JSON.stringify(credentialTypes, null, 2))
    console.log("==========================================")

    // 環境変数への保存をシミュレート（実際の実装では永続化）
    process.env.CREDENTIAL_TYPES_DATA = JSON.stringify(credentialTypes)

    return true
  } catch (error) {
    console.error("Failed to update server credential types:", error)
    return false
  }
}
