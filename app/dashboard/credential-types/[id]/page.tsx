"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Trash2, Eye, Calendar, Hash } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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

export default function CredentialTypeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [credentialType, setCredentialType] = useState<CredentialType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = params.id as string
    const stored = localStorage.getItem("credentialTypes")
    if (stored) {
      const credentialTypes = JSON.parse(stored)
      const found = credentialTypes.find((ct: CredentialType) => ct.id === id)
      setCredentialType(found || null)
    }
    setLoading(false)
  }, [params.id])

  const handleDelete = () => {
    const stored = localStorage.getItem("credentialTypes")
    if (stored) {
      const credentialTypes = JSON.parse(stored)
      const updated = credentialTypes.filter((ct: CredentialType) => ct.id !== params.id)
      localStorage.setItem("credentialTypes", JSON.stringify(updated))

      // Student Login Siteへの削除通知をシミュレート
      console.log("Student Login Siteに削除通知を送信:", params.id)

      router.push("/dashboard/credential-types")
    }
  }

  const toggleActive = () => {
    if (!credentialType) return

    const stored = localStorage.getItem("credentialTypes")
    if (stored) {
      const credentialTypes = JSON.parse(stored)
      const updated = credentialTypes.map((ct: CredentialType) =>
        ct.id === credentialType.id ? { ...ct, isActive: !ct.isActive } : ct,
      )
      localStorage.setItem("credentialTypes", JSON.stringify(updated))
      setCredentialType({ ...credentialType, isActive: !credentialType.isActive })

      // Student Login Siteへの状態変更通知をシミュレート
      console.log("Student Login Siteに状態変更通知を送信:", credentialType.id)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">読み込み中...</div>
  }

  if (!credentialType) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/credential-types">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Credential Type が見つかりません</h1>
          </div>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600">指定されたCredential Typeは存在しません。</p>
            <Link href="/dashboard/credential-types">
              <Button className="mt-4">一覧に戻る</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/credential-types">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{credentialType.name}</h1>
            <p className="text-gray-600 mt-2">{credentialType.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/credential-types/${credentialType.id}/edit`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              編集
            </Button>
          </Link>
          <Button variant="outline" onClick={toggleActive}>
            {credentialType.isActive ? "無効化" : "有効化"}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4 mr-2" />
                削除
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>削除の確認</AlertDialogTitle>
                <AlertDialogDescription>
                  「{credentialType.name}」を削除しますか？この操作は取り消せません。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>キャンセル</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  削除
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 基本情報 */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                基本情報
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">ステータス</span>
                <Badge variant={credentialType.isActive ? "default" : "secondary"}>
                  {credentialType.isActive ? "有効" : "無効"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">バージョン</span>
                <span className="text-sm font-medium">{credentialType.version}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  作成日
                </div>
                <span className="text-sm font-medium">{credentialType.createdAt}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  最終更新
                </div>
                <span className="text-sm font-medium">{credentialType.updatedAt}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Hash className="h-4 w-4" />
                  ID
                </div>
                <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{credentialType.id}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>使用統計</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">発行済み数</span>
                  <span className="text-sm font-medium">
                    {
                      JSON.parse(localStorage.getItem("issuedCredentials") || "[]").filter(
                        (cred: any) => cred.credentialTypeId === credentialType.id,
                      ).length
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">有効な発行数</span>
                  <span className="text-sm font-medium">
                    {
                      JSON.parse(localStorage.getItem("issuedCredentials") || "[]").filter(
                        (cred: any) => cred.credentialTypeId === credentialType.id && cred.status === "active",
                      ).length
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* スキーマ詳細 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>スキーマ定義</CardTitle>
              <CardDescription>このCredential Typeで定義されているプロパティ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(credentialType.schema.properties || {}).map(([key, property]: [string, any]) => (
                  <div key={key} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{property.title || key}</h4>
                        <p className="text-sm text-gray-600">プロパティ名: {key}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">{property.type}</Badge>
                        {property.format && <Badge variant="outline">{property.format}</Badge>}
                        {credentialType.schema.required?.includes(key) && <Badge variant="destructive">必須</Badge>}
                      </div>
                    </div>
                    {property.description && <p className="text-sm text-gray-600 mt-2">{property.description}</p>}
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <h4 className="font-medium mb-2">完全なスキーマ（JSON）</h4>
                <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto max-h-64">
                  {JSON.stringify(credentialType.schema, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
