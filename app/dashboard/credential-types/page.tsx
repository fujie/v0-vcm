"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Eye, FileText } from "lucide-react"
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

export default function CredentialTypesPage() {
  const [credentialTypes, setCredentialTypes] = useState<CredentialType[]>([])

  useEffect(() => {
    const stored = localStorage.getItem("credentialTypes")
    if (stored) {
      setCredentialTypes(JSON.parse(stored))
    } else {
      // サンプルデータを初期化
      const sampleData: CredentialType[] = [
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
      localStorage.setItem("credentialTypes", JSON.stringify(sampleData))
      setCredentialTypes(sampleData)
    }
  }, [])

  const handleDelete = (id: string) => {
    const updated = credentialTypes.filter((ct) => ct.id !== id)
    setCredentialTypes(updated)
    localStorage.setItem("credentialTypes", JSON.stringify(updated))

    // Student Login Siteへの変更通知をシミュレート
    console.log("Student Login Siteに削除通知を送信:", id)
  }

  const toggleActive = (id: string) => {
    const updated = credentialTypes.map((ct) => (ct.id === id ? { ...ct, isActive: !ct.isActive } : ct))
    setCredentialTypes(updated)
    localStorage.setItem("credentialTypes", JSON.stringify(updated))

    // Student Login Siteへの変更通知をシミュレート
    console.log("Student Login Siteに状態変更通知を送信:", id)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Credential Types</h1>
          <p className="text-gray-600 mt-2">Verifiable Credentialのスキーマ定義を管理</p>
        </div>
        <Link href="/dashboard/credential-types/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            新規作成
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {credentialTypes.map((credentialType) => (
          <Card key={credentialType.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{credentialType.name}</CardTitle>
                  <CardDescription className="mt-1">{credentialType.description}</CardDescription>
                </div>
                <Badge variant={credentialType.isActive ? "default" : "secondary"}>
                  {credentialType.isActive ? "有効" : "無効"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  <div>バージョン: {credentialType.version}</div>
                  <div>作成日: {credentialType.createdAt}</div>
                  <div>更新日: {credentialType.updatedAt}</div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/dashboard/credential-types/${credentialType.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      詳細
                    </Button>
                  </Link>
                  <Link href={`/dashboard/credential-types/${credentialType.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      編集
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => toggleActive(credentialType.id)}>
                    {credentialType.isActive ? "無効化" : "有効化"}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
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
                        <AlertDialogAction
                          onClick={() => handleDelete(credentialType.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          削除
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {credentialTypes.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Credential Typeが登録されていません</h3>
            <p className="text-gray-600 mb-4">最初のCredential Typeを作成してください</p>
            <Link href="/dashboard/credential-types/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                新規作成
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
