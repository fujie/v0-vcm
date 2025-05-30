"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Users, CheckCircle, XCircle, LinkIcon, RefreshCw, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getApiLogs } from "@/lib/api-logs"

interface DashboardStats {
  totalCredentialTypes: number
  totalIssuedCredentials: number
  activeCredentials: number
  revokedCredentials: number
  integrationStatus: "connected" | "disconnected" | "error"
  lastSyncTime: string | null
  integrationEnabled: boolean
  totalApiLogs: number
  successfulApiLogs: number
  failedApiLogs: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCredentialTypes: 0,
    totalIssuedCredentials: 0,
    activeCredentials: 0,
    revokedCredentials: 0,
    integrationStatus: "disconnected",
    lastSyncTime: null,
    integrationEnabled: false,
    totalApiLogs: 0,
    successfulApiLogs: 0,
    failedApiLogs: 0,
  })

  const [lastUpdate, setLastUpdate] = useState<number>(Date.now())

  const loadStats = useCallback(() => {
    try {
      // ローカルストレージからデータを取得して統計を計算
      const credentialTypes = JSON.parse(localStorage.getItem("credentialTypes") || "[]")
      const issuedCredentials = JSON.parse(localStorage.getItem("issuedCredentials") || "[]")
      const integrationSettings = JSON.parse(localStorage.getItem("integrationSettings") || "{}")
      const apiLogs = getApiLogs()

      const activeCredentials = issuedCredentials.filter((cred: any) => cred.status === "active").length
      const revokedCredentials = issuedCredentials.filter((cred: any) => cred.status === "revoked").length

      // 連携設定の状態を正しく取得
      const integrationEnabled = integrationSettings.enabled || false
      let connectionStatus = "disconnected"

      if (integrationEnabled) {
        connectionStatus = integrationSettings.connectionStatus || "disconnected"
      }

      // APIログの統計
      const successfulApiLogs = apiLogs.filter((log) => log.success).length
      const failedApiLogs = apiLogs.filter((log) => !log.success).length

      setStats({
        totalCredentialTypes: credentialTypes.length,
        totalIssuedCredentials: issuedCredentials.length,
        activeCredentials,
        revokedCredentials,
        integrationStatus: connectionStatus as "connected" | "disconnected" | "error",
        lastSyncTime: integrationSettings.lastSyncTime || null,
        integrationEnabled,
        totalApiLogs: apiLogs.length,
        successfulApiLogs,
        failedApiLogs,
      })

      setLastUpdate(Date.now())
    } catch (error) {
      console.error("統計情報の読み込みに失敗しました:", error)
    }
  }, [])

  useEffect(() => {
    // 初回読み込み
    loadStats()

    // ページにフォーカスが戻った時に再読み込み
    const handleFocus = () => {
      loadStats()
    }

    // ローカルストレージの変更を監視
    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === "credentialTypes" ||
        e.key === "issuedCredentials" ||
        e.key === "integrationSettings" ||
        e.key === "apiLogs"
      ) {
        loadStats()
      }
    }

    // 定期的な更新（30秒ごと）
    const interval = setInterval(loadStats, 30000)

    window.addEventListener("focus", handleFocus)
    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("focus", handleFocus)
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }, [loadStats])

  const statCards = [
    {
      title: "Credential Types",
      value: stats.totalCredentialTypes,
      description: "定義済みのクレデンシャルタイプ数",
      icon: FileText,
      color: "text-blue-600",
      href: "/dashboard/credential-types",
    },
    {
      title: "発行済みクレデンシャル",
      value: stats.totalIssuedCredentials,
      description: "総発行数",
      icon: Users,
      color: "text-green-600",
      href: "/dashboard/issued-credentials",
    },
    {
      title: "有効なクレデンシャル",
      value: stats.activeCredentials,
      description: "現在有効なクレデンシャル数",
      icon: CheckCircle,
      color: "text-emerald-600",
      href: "/dashboard/issued-credentials",
    },
    {
      title: "無効化されたクレデンシャル",
      value: stats.revokedCredentials,
      description: "無効化されたクレデンシャル数",
      icon: XCircle,
      color: "text-red-600",
      href: "/dashboard/issued-credentials",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="text-gray-600 mt-2">Verifiable Credential管理システムの概要</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">最終更新: {new Date(lastUpdate).toLocaleTimeString("ja-JP")}</span>
          <Button variant="outline" size="sm" onClick={loadStats}>
            <RefreshCw className="h-3 w-3 mr-1" />
            更新
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-600 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Student Login Site 連携状態</CardTitle>
            <CardDescription>連携システムとの接続状況</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    !stats.integrationEnabled
                      ? "bg-gray-400"
                      : stats.integrationStatus === "connected"
                        ? "bg-green-500"
                        : stats.integrationStatus === "error"
                          ? "bg-red-500"
                          : "bg-yellow-500"
                  }`}
                ></div>
                <span className="text-sm">
                  {!stats.integrationEnabled
                    ? "連携無効"
                    : stats.integrationStatus === "connected"
                      ? "接続済み"
                      : stats.integrationStatus === "error"
                        ? "接続エラー"
                        : "未接続"}
                </span>
              </div>

              {stats.integrationEnabled && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">連携機能: 有効</span>
                </div>
              )}

              {stats.lastSyncTime && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">最終同期: {new Date(stats.lastSyncTime).toLocaleString("ja-JP")}</span>
                </div>
              )}

              <div className="pt-2">
                <Link href="/dashboard/integration">
                  <Button variant="outline" size="sm">
                    <LinkIcon className="h-4 w-4 mr-2" />
                    連携設定を管理
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>APIログ統計</CardTitle>
            <CardDescription>Student Login Siteとの通信ログ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">総ログ数</span>
                <span className="text-sm font-medium">{stats.totalApiLogs}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">成功リクエスト</span>
                <span className="text-sm font-medium text-green-600">{stats.successfulApiLogs}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">失敗リクエスト</span>
                <span className="text-sm font-medium text-red-600">{stats.failedApiLogs}</span>
              </div>
              <div className="pt-2">
                <Link href="/dashboard/logs">
                  <Button variant="outline" size="sm">
                    <List className="h-4 w-4 mr-2" />
                    ログを表示
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {stats.totalCredentialTypes === 0 && (
        <Card className="border-dashed">
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">まだCredential Typeが作成されていません</h3>
            <p className="text-gray-600 mb-4">最初のCredential Typeを作成して、クレデンシャル管理を開始しましょう</p>
            <Link href="/dashboard/credential-types/new">
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                Credential Typeを作成
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
