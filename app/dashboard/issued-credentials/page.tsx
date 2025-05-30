"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Eye, Ban, CheckCircle, XCircle } from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface IssuedCredential {
  id: string
  credentialTypeId: string
  credentialTypeName: string
  recipientId: string
  recipientName: string
  issuedAt: string
  expiresAt?: string
  status: "active" | "revoked" | "expired"
  data: any
}

export default function IssuedCredentialsPage() {
  const [credentials, setCredentials] = useState<IssuedCredential[]>([])
  const [filteredCredentials, setFilteredCredentials] = useState<IssuedCredential[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    const stored = localStorage.getItem("issuedCredentials")
    if (stored) {
      setCredentials(JSON.parse(stored))
      setFilteredCredentials(JSON.parse(stored))
    } else {
      // サンプルデータを初期化
      const sampleData: IssuedCredential[] = [
        {
          id: "cred-001",
          credentialTypeId: "1",
          credentialTypeName: "学生証",
          recipientId: "student-001",
          recipientName: "田中太郎",
          issuedAt: "2024-01-15",
          expiresAt: "2025-03-31",
          status: "active",
          data: {
            studentId: "S2024001",
            name: "田中太郎",
            department: "情報工学部",
            year: 2,
            enrollmentDate: "2023-04-01",
          },
        },
        {
          id: "cred-002",
          credentialTypeId: "1",
          credentialTypeName: "学生証",
          recipientId: "student-002",
          recipientName: "佐藤花子",
          issuedAt: "2024-01-16",
          expiresAt: "2025-03-31",
          status: "active",
          data: {
            studentId: "S2024002",
            name: "佐藤花子",
            department: "経済学部",
            year: 1,
            enrollmentDate: "2024-04-01",
          },
        },
        {
          id: "cred-003",
          credentialTypeId: "2",
          credentialTypeName: "卒業証明書",
          recipientId: "student-003",
          recipientName: "鈴木一郎",
          issuedAt: "2024-03-20",
          status: "revoked",
          data: {
            studentId: "S2020001",
            name: "鈴木一郎",
            department: "情報工学部",
            graduationDate: "2024-03-20",
            degree: "学士（工学）",
          },
        },
      ]
      localStorage.setItem("issuedCredentials", JSON.stringify(sampleData))
      setCredentials(sampleData)
      setFilteredCredentials(sampleData)
    }
  }, [])

  useEffect(() => {
    let filtered = credentials

    // 検索フィルター
    if (searchTerm) {
      filtered = filtered.filter(
        (cred) =>
          cred.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cred.credentialTypeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cred.recipientId.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // ステータスフィルター
    if (statusFilter !== "all") {
      filtered = filtered.filter((cred) => cred.status === statusFilter)
    }

    setFilteredCredentials(filtered)
  }, [credentials, searchTerm, statusFilter])

  const handleRevoke = (credentialId: string) => {
    const updated = credentials.map((cred) =>
      cred.id === credentialId ? { ...cred, status: "revoked" as const } : cred,
    )
    setCredentials(updated)
    localStorage.setItem("issuedCredentials", JSON.stringify(updated))

    // Student Login Siteへの無効化通知をシミュレート
    console.log("Student Login Siteにクレデンシャル無効化通知を送信:", credentialId)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">有効</Badge>
      case "revoked":
        return <Badge className="bg-red-100 text-red-800">無効</Badge>
      case "expired":
        return <Badge className="bg-gray-100 text-gray-800">期限切れ</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "revoked":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "expired":
        return <XCircle className="h-4 w-4 text-gray-600" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">発行済みクレデンシャル</h1>
        <p className="text-gray-600 mt-2">発行されたVerifiable Credentialの管理と状態確認</p>
      </div>

      {/* フィルターとサーチ */}
      <Card>
        <CardHeader>
          <CardTitle>フィルター</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">検索</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="受信者名、クレデンシャルタイプ、IDで検索"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">ステータス</Label>
              <select
                id="status"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">すべて</option>
                <option value="active">有効</option>
                <option value="revoked">無効</option>
                <option value="expired">期限切れ</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* クレデンシャル一覧 */}
      <div className="space-y-4">
        {filteredCredentials.map((credential) => (
          <Card key={credential.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getStatusIcon(credential.status)}
                  <div>
                    <h3 className="font-semibold text-lg">{credential.credentialTypeName}</h3>
                    <p className="text-gray-600">
                      受信者: {credential.recipientName} ({credential.recipientId})
                    </p>
                    <p className="text-sm text-gray-500">
                      発行日: {credential.issuedAt}
                      {credential.expiresAt && ` | 有効期限: ${credential.expiresAt}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(credential.status)}

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        詳細
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{credential.credentialTypeName} - 詳細情報</DialogTitle>
                        <DialogDescription>クレデンシャルID: {credential.id}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>受信者</Label>
                            <p className="font-medium">{credential.recipientName}</p>
                          </div>
                          <div>
                            <Label>受信者ID</Label>
                            <p className="font-medium">{credential.recipientId}</p>
                          </div>
                          <div>
                            <Label>発行日</Label>
                            <p className="font-medium">{credential.issuedAt}</p>
                          </div>
                          <div>
                            <Label>ステータス</Label>
                            <div className="mt-1">{getStatusBadge(credential.status)}</div>
                          </div>
                        </div>

                        <div>
                          <Label>クレデンシャルデータ</Label>
                          <pre className="mt-2 p-4 bg-gray-50 rounded-lg text-sm overflow-auto">
                            {JSON.stringify(credential.data, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {credential.status === "active" && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Ban className="h-4 w-4 mr-1" />
                          無効化
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>クレデンシャルの無効化</AlertDialogTitle>
                          <AlertDialogDescription>
                            {credential.recipientName}の{credential.credentialTypeName}を無効化しますか？
                            この操作は取り消せません。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>キャンセル</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRevoke(credential.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            無効化
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCredentials.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">該当するクレデンシャルが見つかりません</h3>
            <p className="text-gray-600">検索条件を変更してください</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
