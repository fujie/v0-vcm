"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Plus, Trash2, Eye, RefreshCw } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SchemaProperty {
  name: string
  type: string
  title: string
  required: boolean
  format?: string
  description?: string
}

// スキーマに基づいてサンプルデータを生成する関数
function generateSampleData(properties: SchemaProperty[]): Record<string, any> {
  const sampleData: Record<string, any> = {}

  properties.forEach((prop) => {
    if (!prop.name) return

    switch (prop.type) {
      case "string":
        if (prop.format === "date") {
          sampleData[prop.name] = new Date().toISOString().split("T")[0]
        } else if (prop.format === "email") {
          sampleData[prop.name] = "sample@example.com"
        } else if (prop.format === "uri") {
          sampleData[prop.name] = "https://example.com"
        } else {
          // プロパティ名に基づいてサンプル値を生成
          if (prop.name.toLowerCase().includes("name")) {
            sampleData[prop.name] = "山田太郎"
          } else if (prop.name.toLowerCase().includes("id")) {
            sampleData[prop.name] = "ID" + Math.floor(10000 + Math.random() * 90000)
          } else if (prop.name.toLowerCase().includes("department")) {
            sampleData[prop.name] = "情報工学部"
          } else if (prop.name.toLowerCase().includes("degree")) {
            sampleData[prop.name] = "学士（工学）"
          } else {
            sampleData[prop.name] = `${prop.title}のサンプル値`
          }
        }
        break
      case "number":
        if (prop.name.toLowerCase().includes("year")) {
          sampleData[prop.name] = new Date().getFullYear()
        } else if (prop.name.toLowerCase().includes("age")) {
          sampleData[prop.name] = 20
        } else {
          sampleData[prop.name] = Math.floor(Math.random() * 100)
        }
        break
      case "boolean":
        sampleData[prop.name] = true
        break
      case "array":
        sampleData[prop.name] = ["サンプル項目1", "サンプル項目2"]
        break
      default:
        sampleData[prop.name] = null
    }
  })

  return sampleData
}

export default function NewCredentialTypePage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [version, setVersion] = useState("1.0")
  const [isActive, setIsActive] = useState(true)
  const [properties, setProperties] = useState<SchemaProperty[]>([
    { name: "", type: "string", title: "", required: false },
  ])
  const [sampleData, setSampleData] = useState<Record<string, any>>({})

  const addProperty = () => {
    setProperties([...properties, { name: "", type: "string", title: "", required: false }])
  }

  const removeProperty = (index: number) => {
    setProperties(properties.filter((_, i) => i !== index))
  }

  const updateProperty = (index: number, field: keyof SchemaProperty, value: string | boolean) => {
    const updated = properties.map((prop, i) => (i === index ? { ...prop, [field]: value } : prop))
    setProperties(updated)
  }

  const regenerateSampleData = () => {
    setSampleData(generateSampleData(properties))
  }

  const updateSampleData = (key: string, value: any) => {
    setSampleData({
      ...sampleData,
      [key]: value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // バリデーション
    if (!name || !description) {
      alert("名前と説明は必須です")
      return
    }

    const validProperties = properties.filter((prop) => prop.name && prop.title)
    if (validProperties.length === 0) {
      alert("少なくとも1つのプロパティを定義してください")
      return
    }

    // スキーマオブジェクトを構築
    const schemaProperties: any = {}
    const required: string[] = []

    validProperties.forEach((prop) => {
      schemaProperties[prop.name] = {
        type: prop.type,
        title: prop.title,
      }
      if (prop.format) {
        schemaProperties[prop.name].format = prop.format
      }
      if (prop.description) {
        schemaProperties[prop.name].description = prop.description
      }
      if (prop.required) {
        required.push(prop.name)
      }
    })

    const schema = {
      type: "object",
      properties: schemaProperties,
      required,
    }

    // 新しいCredential Typeを作成
    const newCredentialType = {
      id: Date.now().toString(),
      name,
      description,
      version,
      schema,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      isActive,
    }

    // ローカルストレージに保存
    const existing = JSON.parse(localStorage.getItem("credentialTypes") || "[]")
    const updated = [...existing, newCredentialType]
    localStorage.setItem("credentialTypes", JSON.stringify(updated))

    // サーバーサイドに同期
    fetch("/api/admin/sync-credential-types", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        credentialTypes: updated,
        adminToken: "admin_sync_token",
      }),
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          console.log("Server sync successful after creating new credential type")
        } else {
          console.warn("Server sync failed after creating new credential type:", result.error)
        }
      })
      .catch((error) => {
        console.error("Server sync error after creating new credential type:", error)
      })

    // Student Login Siteへの通知をシミュレート
    console.log("Student Login Siteに新規Credential Type通知を送信:", newCredentialType)

    router.push("/dashboard/credential-types")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/credential-types">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">新規Credential Type作成</h1>
          <p className="text-gray-600 mt-2">新しいVerifiable Credentialのスキーマを定義</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
            <CardDescription>Credential Typeの基本的な情報を設定</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">名前 *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例: 学生証"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="version">バージョン</Label>
                <Input id="version" value={version} onChange={(e) => setVersion(e.target.value)} placeholder="1.0" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">説明 *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="このCredential Typeの説明を入力"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
              <Label htmlFor="isActive">有効状態</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>スキーマ定義</CardTitle>
            <CardDescription>Credential に含まれるプロパティを定義</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {properties.map((property, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">プロパティ {index + 1}</h4>
                  {properties.length > 1 && (
                    <Button type="button" variant="outline" size="sm" onClick={() => removeProperty(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>プロパティ名</Label>
                    <Input
                      value={property.name}
                      onChange={(e) => updateProperty(index, "name", e.target.value)}
                      placeholder="例: studentId"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>表示名</Label>
                    <Input
                      value={property.title}
                      onChange={(e) => updateProperty(index, "title", e.target.value)}
                      placeholder="例: 学籍番号"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>データ型</Label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={property.type}
                      onChange={(e) => updateProperty(index, "type", e.target.value)}
                    >
                      <option value="string">文字列</option>
                      <option value="number">数値</option>
                      <option value="boolean">真偽値</option>
                      <option value="array">配列</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>フォーマット</Label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={property.format || ""}
                      onChange={(e) => updateProperty(index, "format", e.target.value)}
                    >
                      <option value="">なし</option>
                      <option value="date">日付</option>
                      <option value="email">メール</option>
                      <option value="uri">URI</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>説明（オプション）</Label>
                  <Input
                    value={property.description || ""}
                    onChange={(e) => updateProperty(index, "description", e.target.value)}
                    placeholder="このプロパティの説明"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={property.required}
                    onCheckedChange={(checked) => updateProperty(index, "required", checked)}
                  />
                  <Label>必須項目</Label>
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={addProperty}>
              <Plus className="h-4 w-4 mr-2" />
              プロパティを追加
            </Button>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit">作成</Button>
          <Link href="/dashboard/credential-types">
            <Button type="button" variant="outline">
              キャンセル
            </Button>
          </Link>

          <Dialog>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" className="ml-auto">
                <Eye className="h-4 w-4 mr-2" />
                プレビュー
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>クレデンシャルプレビュー</DialogTitle>
                <DialogDescription>現在のスキーマ定義に基づいたサンプルクレデンシャルのプレビュー</DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="preview" className="mt-4">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="preview">プレビュー</TabsTrigger>
                  <TabsTrigger value="edit">サンプルデータ編集</TabsTrigger>
                </TabsList>

                <TabsContent value="preview" className="space-y-4">
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={regenerateSampleData}>
                      <RefreshCw className="h-3 w-3 mr-2" />
                      再生成
                    </Button>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">{name || "クレデンシャル名"}</CardTitle>
                      <CardDescription>{description || "クレデンシャルの説明"}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {properties
                          .filter((p) => p.name)
                          .map((prop, idx) => (
                            <div key={idx} className="grid grid-cols-3 gap-4 items-center">
                              <div className="font-medium">{prop.title || prop.name}:</div>
                              <div className="col-span-2">
                                {sampleData[prop.name] !== undefined
                                  ? typeof sampleData[prop.name] === "boolean"
                                    ? String(sampleData[prop.name])
                                    : Array.isArray(sampleData[prop.name])
                                      ? sampleData[prop.name].join(", ")
                                      : String(sampleData[prop.name])
                                  : "未設定"}
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">JSONプレビュー</h4>
                    <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto max-h-64">
                      {JSON.stringify(
                        {
                          "@context": [
                            "https://www.w3.org/2018/credentials/v1",
                            "https://www.w3.org/2018/credentials/examples/v1",
                          ],
                          id: "http://example.edu/credentials/1872",
                          type: ["VerifiableCredential", name || "SampleCredential"],
                          issuer: "https://example.edu/issuers/565049",
                          issuanceDate: new Date().toISOString(),
                          credentialSubject: {
                            id: "did:example:ebfeb1f712ebc6f1c276e12ec21",
                            ...sampleData,
                          },
                        },
                        null,
                        2,
                      )}
                    </pre>
                  </div>
                </TabsContent>

                <TabsContent value="edit" className="space-y-4">
                  <div className="text-sm text-gray-600 mb-4">
                    サンプルデータを編集して、プレビュータブで結果を確認できます。
                  </div>

                  {properties
                    .filter((p) => p.name)
                    .map((prop, idx) => (
                      <div key={idx} className="space-y-2">
                        <Label htmlFor={`sample-${prop.name}`}>{prop.title || prop.name}</Label>
                        {prop.type === "boolean" ? (
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`sample-${prop.name}`}
                              checked={!!sampleData[prop.name]}
                              onCheckedChange={(checked) => updateSampleData(prop.name, checked)}
                            />
                            <Label htmlFor={`sample-${prop.name}`}>{sampleData[prop.name] ? "有効" : "無効"}</Label>
                          </div>
                        ) : prop.type === "number" ? (
                          <Input
                            id={`sample-${prop.name}`}
                            type="number"
                            value={sampleData[prop.name] || ""}
                            onChange={(e) => updateSampleData(prop.name, Number(e.target.value))}
                          />
                        ) : (
                          <Input
                            id={`sample-${prop.name}`}
                            value={sampleData[prop.name] || ""}
                            onChange={(e) => updateSampleData(prop.name, e.target.value)}
                          />
                        )}
                      </div>
                    ))}

                  <Button type="button" onClick={regenerateSampleData} className="mt-4">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    サンプルデータを再生成
                  </Button>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </form>
    </div>
  )
}
