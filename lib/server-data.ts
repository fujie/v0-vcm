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

// サンプルのクレデンシャルタイプデータ
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
 * 実際の実装では、データベースから取得する
 */
export function getServerCredentialTypes(): CredentialType[] {
  // 環境変数からカスタムデータを取得する場合
  const customData = process.env.CREDENTIAL_TYPES_DATA
  if (customData) {
    try {
      return JSON.parse(customData)
    } catch (error) {
      console.error("Failed to parse custom credential types data:", error)
    }
  }

  // デフォルトのサンプルデータを返す
  return defaultCredentialTypes
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
