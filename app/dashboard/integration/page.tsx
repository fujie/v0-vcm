"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, RefreshCw, LinkIcon, Save, Play, ExternalLink, Activity } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// IntegrationSettings インターフェースに healthApiKey と healthRequireAuth を追加
interface IntegrationSettings {
  enabled: boolean
  studentLoginUrl: string
  apiKey: string
  webhookSecret: string
  autoSync: boolean
  lastSyncTime: string | null
  connectionStatus: "connected" | "disconnected" | "error"
  errorMessage?: string
  healthApiKey?: string
  healthRequireAuth?: boolean
}

export default function IntegrationPage() {
  const { toast } = useToast()
  // useState の初期値に healthApiKey と healthRequireAuth を追加
  const [settings, setSettings] = useState<IntegrationSettings>({
    enabled: false,
    studentLoginUrl: "https://v0-student-login-site.vercel.app",
    apiKey: "sl_" + Math.random().toString(36).substring(2, 15),
    webhookSecret: "whsec_" + Math.random().toString(36).substring(2, 15),
    autoSync: true,
    lastSyncTime: null,
    connectionStatus: "disconnected",
    healthApiKey: "",
    healthRequireAuth: false,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [testMode, setTestMode] = useState(false)
  const [healthStatus, setHealthStatus] = useState<any>(null)

  useEffect(() => {
    // 保存された設定を読み込む
    const savedSettings = localStorage.getItem("integrationSettings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }

    // 自身のヘルスチェックを実行
    checkOwnHealth()
  }, [])

  const checkOwnHealth = async () => {
    try {
      const response = await fetch("/api/health")
      if (response.ok) {
        const health = await response.json()
        setHealthStatus(health)
      } else {
        console.error("Health check failed with status:", response.status)
        setHealthStatus({
          status: "unhealthy",
          service: "Verifiable Credential Manager",
          timestamp: new Date().toISOString(),
          error: `HTTP ${response.status}`,
        })
      }
    } catch (error) {
      console.error("Own health check failed:", error)
      setHealthStatus({
        status: "unhealthy",
        service: "Verifiable Credential Manager",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  const saveSettings = () => {
    setIsLoading(true)

    // 設定を保存
    const updatedSettings = {
      ...settings,
      lastSyncTime: new Date().toISOString(),
    }

    localStorage.setItem("integrationSettings", JSON.stringify(updatedSettings))

    // 他のページに変更を通知するためのカスタムイベントを発火
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "integrationSettings",
        newValue: JSON.stringify(updatedSettings),
        storageArea: localStorage,
      }),
    )

    setTimeout(() => {
      setIsLoading(false)
      setSettings({
        ...updatedSettings,
        connectionStatus: settings.enabled ? "connected" : "disconnected",
      })

      // 再度保存して接続状態を更新
      const finalSettings = {
        ...updatedSettings,
        connectionStatus: settings.enabled ? "connected" : "disconnected",
      }
      localStorage.setItem("integrationSettings", JSON.stringify(finalSettings))

      // 再度変更通知
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "integrationSettings",
          newValue: JSON.stringify(finalSettings),
          storageArea: localStorage,
        }),
      )

      toast({
        title: "設定を保存しました",
        description: settings.enabled
          ? "Student Login Siteとの連携が有効化されました"
          : "設定が保存されました。連携は無効化されています",
      })
    }, 1500)
  }

  const testConnection = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/test-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentLoginUrl: settings.studentLoginUrl,
          apiKey: settings.apiKey,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSettings({
          ...settings,
          connectionStatus: "connected",
          errorMessage: undefined,
        })

        toast({
          title: "接続テスト成功",
          description: `Student Login Siteとの接続が確認できました (HTTP ${result.data.httpStatus})`,
        })
      } else {
        setSettings({
          ...settings,
          connectionStatus: "error",
          errorMessage: result.details || "接続に失敗しました",
        })

        toast({
          title: "接続テスト失敗",
          description: result.details || "接続に失敗しました。URLを確認してください",
          variant: "destructive",
        })
      }
    } catch (error) {
      setSettings({
        ...settings,
        connectionStatus: "error",
        errorMessage: "ネットワークエラーが発生しました",
      })

      toast({
        title: "接続テスト失敗",
        description: "ネットワークエラーが発生しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const syncCredentialTypes = async () => {
    setIsLoading(true)

    try {
      const credentialTypes = JSON.parse(localStorage.getItem("credentialTypes") || "[]")

      const response = await fetch("/api/sync/credential-types", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credentialTypes: credentialTypes.filter((ct: any) => ct.isActive),
          apiKey: settings.apiKey,
        }),
      })

      const result = await response.json()

      if (result.success) {
        const updatedSettings = {
          ...settings,
          lastSyncTime: new Date().toISOString(),
        }
        setSettings(updatedSettings)
        localStorage.setItem("integrationSettings", JSON.stringify(updatedSettings))

        const message = result.data.note
          ? `${result.data.syncedCount}個のクレデンシャルタイプを同期しました (${result.data.note})`
          : `${result.data.syncedCount}個のクレデンシャルタイプをStudent Login Siteと同期しました`

        toast({
          title: "同期完了",
          description: message,
        })
      } else {
        toast({
          title: "同期失敗",
          description: result.error || "同期に失敗しました",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "同期エラー",
        description: "同期中にエラーが発生しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleTestMode = () => {
    setTestMode(!testMode)
    toast({
      title: !testMode ? "テストモードを有効化" : "テストモードを無効化",
      description: !testMode ? "Student Login Siteのシミュレーションが利用可能になりました" : "通常モードに戻りました",
    })
  }

  // generateHealthApiKey 関数を追加
  const generateHealthApiKey = async () => {
    try {
      const response = await fetch("/api/health-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer admin_token", // 実際の実装では適切な認証トークンを使用
        },
        body: JSON.stringify({
          action: "generate_key",
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSettings({ ...settings, healthApiKey: result.data.apiKey })
        toast({
          title: "新しいヘルスチェックAPI Keyを生成しました",
          description: "このキーを安全に保管してください。Student Login Siteの設定で使用します。",
        })
      } else {
        toast({
          title: "API Key生成に失敗しました",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "API Key生成エラー",
        description: "API Key生成中にエラーが発生しました",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Student Login Site 連携</h1>
        <p className="text-gray-600 mt-2">Student Login Siteとの連携設定を管理します</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={settings.connectionStatus === "connected" ? "default" : "destructive"} className="px-3 py-1">
            {settings.connectionStatus === "connected" ? (
              <CheckCircle className="h-4 w-4 mr-1" />
            ) : (
              <XCircle className="h-4 w-4 mr-1" />
            )}
            {settings.connectionStatus === "connected" ? "接続済み" : "未接続"}
          </Badge>
          {healthStatus && (
            <Badge variant="outline" className="px-3 py-1">
              <Activity className="h-4 w-4 mr-1" />
              システム: {healthStatus.status}
            </Badge>
          )}
          {settings.lastSyncTime && (
            <span className="text-sm text-gray-500">
              最終同期: {new Date(settings.lastSyncTime).toLocaleString("ja-JP")}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={toggleTestMode}>
            {testMode ? "テストモード: ON" : "テストモード: OFF"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.open(settings.studentLoginUrl, "_blank")}>
            <ExternalLink className="h-4 w-4 mr-1" />
            Student Login Site
          </Button>
        </div>
      </div>

      {settings.connectionStatus === "error" && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>接続エラー</AlertTitle>
          <AlertDescription>{settings.errorMessage || "Student Login Siteとの接続に問題があります"}</AlertDescription>
        </Alert>
      )}

      {healthStatus && (
        <Card>
          <CardHeader>
            <CardTitle>システムヘルス</CardTitle>
            <CardDescription>Verifiable Credential Managerの現在の状態</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>サービス状態</Label>
                <Badge variant={healthStatus.status === "healthy" ? "default" : "destructive"}>
                  {healthStatus.status}
                </Badge>
              </div>
              <div className="space-y-2">
                <Label>稼働時間</Label>
                <span className="text-sm">{Math.floor(healthStatus.uptime / 60)} 分</span>
              </div>
              <div className="space-y-2">
                <Label>環境</Label>
                <span className="text-sm">{healthStatus.environment}</span>
              </div>
            </div>
            <div className="mt-4">
              <Label>利用可能なエンドポイント</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                {Object.entries(healthStatus.endpoints || {}).map(([key, endpoint]) => (
                  <div key={key} className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                    {endpoint as string}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="settings">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings">連携設定</TabsTrigger>
          <TabsTrigger value="credentials">クレデンシャル同期</TabsTrigger>
          <TabsTrigger value="simulator">シミュレーター</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>基本設定</CardTitle>
              <CardDescription>Student Login Siteとの連携に必要な設定</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="integration-enabled"
                  checked={settings.enabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
                />
                <Label htmlFor="integration-enabled">連携を有効化</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="student-login-url">Student Login Site URL</Label>
                <Input
                  id="student-login-url"
                  value={settings.studentLoginUrl}
                  onChange={(e) => setSettings({ ...settings, studentLoginUrl: e.target.value })}
                  placeholder="https://v0-student-login-site.vercel.app"
                />
                <p className="text-xs text-gray-500">
                  実際のStudent Login SiteのURL: https://v0-student-login-site.vercel.app
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-key">API キー</Label>
                <div className="flex gap-2">
                  <Input
                    id="api-key"
                    value={settings.apiKey}
                    onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                    placeholder="sl_xxxxxxxxxxxxx"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newKey = "sl_" + Math.random().toString(36).substring(2, 15)
                      setSettings({ ...settings, apiKey: newKey })
                      toast({
                        title: "新しいAPIキーを生成しました",
                        description: "変更を保存するには「設定を保存」ボタンをクリックしてください",
                      })
                    }}
                  >
                    再生成
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook-secret">Webhook シークレット</Label>
                <div className="flex gap-2">
                  <Input
                    id="webhook-secret"
                    value={settings.webhookSecret}
                    onChange={(e) => setSettings({ ...settings, webhookSecret: e.target.value })}
                    placeholder="whsec_xxxxxxxxxxxxx"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newSecret = "whsec_" + Math.random().toString(36).substring(2, 15)
                      setSettings({ ...settings, webhookSecret: newSecret })
                      toast({
                        title: "新しいWebhookシークレットを生成しました",
                        description: "変更を保存するには「設定を保存」ボタンをクリックしてください",
                      })
                    }}
                  >
                    再生成
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-sync"
                  checked={settings.autoSync}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoSync: checked })}
                />
                <Label htmlFor="auto-sync">変更を自動的に同期する</Label>
              </div>

              {/* 基本設定カードの中に、ヘルスチェック認証設定を追加
              既存の autoSync の Switch の後に以下を追加： */}
              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-medium mb-3">ヘルスチェック認証設定</h4>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="health-require-auth"
                      checked={settings.healthRequireAuth || false}
                      onCheckedChange={(checked) => setSettings({ ...settings, healthRequireAuth: checked })}
                    />
                    <Label htmlFor="health-require-auth">ヘルスチェックにAPI Key認証を要求</Label>
                  </div>

                  {settings.healthRequireAuth && (
                    <div className="space-y-2">
                      <Label htmlFor="health-api-key">ヘルスチェック用 API Key</Label>
                      <div className="flex gap-2">
                        <Input
                          id="health-api-key"
                          value={settings.healthApiKey || ""}
                          onChange={(e) => setSettings({ ...settings, healthApiKey: e.target.value })}
                          placeholder="health_xxxxxxxxxxxxx"
                          type="password"
                        />
                        <Button variant="outline" onClick={generateHealthApiKey}>
                          生成
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Student Login Siteがヘルスチェックエンドポイントにアクセスする際に使用するAPI Keyです。
                      </p>
                    </div>
                  )}

                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h5 className="text-sm font-medium text-blue-900 mb-2">使用方法</h5>
                    <div className="text-xs text-blue-800 space-y-1">
                      <p>
                        <strong>Authorization ヘッダー:</strong> Bearer {settings.healthApiKey || "your_api_key"}
                      </p>
                      <p>
                        <strong>X-API-Key ヘッダー:</strong> {settings.healthApiKey || "your_api_key"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={saveSettings} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  設定を保存
                </Button>
                <Button variant="outline" onClick={testConnection} disabled={isLoading}>
                  <LinkIcon className="h-4 w-4 mr-2" />
                  接続テスト
                </Button>
                <Button variant="outline" onClick={checkOwnHealth} disabled={isLoading}>
                  <Activity className="h-4 w-4 mr-2" />
                  ヘルスチェック
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Webhook エンドポイント</CardTitle>
              <CardDescription>Student Login Siteからのリクエストを受け取るエンドポイント</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>ヘルスチェック API</Label>
                <div className="flex items-center gap-2">
                  <Input readOnly value={`${window.location.origin}/api/health`} />
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/api/health`)
                      toast({
                        title: "URLをコピーしました",
                        description: "Student Login Siteの設定画面に貼り付けてください",
                      })
                    }}
                  >
                    コピー
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>クレデンシャル発行通知 Webhook</Label>
                <div className="flex items-center gap-2">
                  <Input readOnly value={`${window.location.origin}/api/webhooks/credential-issued`} />
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/api/webhooks/credential-issued`)
                      toast({
                        title: "URLをコピーしました",
                        description: "Student Login Siteの設定画面に貼り付けてください",
                      })
                    }}
                  >
                    コピー
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>クレデンシャル無効化通知 Webhook</Label>
                <div className="flex items-center gap-2">
                  <Input readOnly value={`${window.location.origin}/api/webhooks/credential-revoked`} />
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/api/webhooks/credential-revoked`)
                      toast({
                        title: "URLをコピーしました",
                        description: "Student Login Siteの設定画面に貼り付けてください",
                      })
                    }}
                  >
                    コピー
                  </Button>
                </div>
              </div>
              {/* Webhook エンドポイントカードの中に、ヘルスチェックエンドポイントの情報を追加
              既存の "クレデンシャル無効化通知 Webhook" の後に以下を追加： */}

              <div className="space-y-2">
                <Label>ヘルスチェック API</Label>
                <div className="flex items-center gap-2">
                  <Input readOnly value={`${window.location.origin}/api/health`} />
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/api/health`)
                      toast({
                        title: "URLをコピーしました",
                        description: "Student Login Siteの設定画面に貼り付けてください",
                      })
                    }}
                  >
                    コピー
                  </Button>
                </div>
                {settings.healthRequireAuth && settings.healthApiKey && (
                  <div className="mt-2 p-2 bg-yellow-50 rounded border">
                    <p className="text-xs text-yellow-800">
                      <strong>認証が必要:</strong> このエンドポイントにアクセスする際は、以下のいずれかの方法でAPI
                      Keyを送信してください：
                    </p>
                    <div className="mt-1 text-xs font-mono text-yellow-900">
                      <p>Authorization: Bearer {settings.healthApiKey}</p>
                      <p>X-API-Key: {settings.healthApiKey}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>システムステータス API</Label>
                <div className="flex items-center gap-2">
                  <Input readOnly value={`${window.location.origin}/api/status`} />
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/api/status`)
                      toast({
                        title: "URLをコピーしました",
                        description: "詳細なシステム情報を取得するAPIエンドポイントです",
                      })
                    }}
                  >
                    コピー
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Ping API</Label>
                <div className="flex items-center gap-2">
                  <Input readOnly value={`${window.location.origin}/api/ping`} />
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/api/ping`)
                      toast({
                        title: "URLをコピーしました",
                        description: "シンプルな接続確認用のAPIエンドポイントです",
                      })
                    }}
                  >
                    コピー
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credentials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>クレデンシャルタイプ同期</CardTitle>
              <CardDescription>定義したクレデンシャルタイプをStudent Login Siteと同期します</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">同期状態</h3>
                  <p className="text-sm text-gray-600">
                    {settings.lastSyncTime
                      ? `最終同期: ${new Date(settings.lastSyncTime).toLocaleString("ja-JP")}`
                      : "まだ同期が実行されていません"}
                  </p>
                </div>
                <Button onClick={syncCredentialTypes} disabled={isLoading || !settings.enabled}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  今すぐ同期
                </Button>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">同期されるクレデンシャルタイプ</h4>
                <div className="space-y-2">
                  {JSON.parse(localStorage.getItem("credentialTypes") || "[]").map((ct: any) => (
                    <div key={ct.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{ct.name}</p>
                        <p className="text-sm text-gray-600">バージョン: {ct.version}</p>
                      </div>
                      <Badge variant={ct.isActive ? "default" : "secondary"}>{ct.isActive ? "有効" : "無効"}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API エンドポイント</CardTitle>
              <CardDescription>Student Login Siteが利用可能なAPIエンドポイント</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>クレデンシャルタイプ取得 API</Label>
                <div className="flex items-center gap-2">
                  <Input readOnly value={`${window.location.origin}/api/credential-types`} />
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/api/credential-types`)
                      toast({
                        title: "URLをコピーしました",
                        description: "Student Login Siteの設定画面に貼り付けてください",
                      })
                    }}
                  >
                    コピー
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>クレデンシャル発行 API</Label>
                <div className="flex items-center gap-2">
                  <Input readOnly value={`${window.location.origin}/api/credentials/issue`} />
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/api/credentials/issue`)
                      toast({
                        title: "URLをコピーしました",
                        description: "Student Login Siteの設定画面に貼り付けてください",
                      })
                    }}
                  >
                    コピー
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>クレデンシャル無効化 API</Label>
                <div className="flex items-center gap-2">
                  <Input readOnly value={`${window.location.origin}/api/credentials/revoke`} />
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/api/credentials/revoke`)
                      toast({
                        title: "URLをコピーしました",
                        description: "Student Login Siteの設定画面に貼り付けてください",
                      })
                    }}
                  >
                    コピー
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simulator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Login Site シミュレーター</CardTitle>
              <CardDescription>Student Login Siteからのリクエストをシミュレートします</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!testMode ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">シミュレーターを使用するには、テストモードを有効にしてください</p>
                  <Button onClick={toggleTestMode}>テストモードを有効化</Button>
                </div>
              ) : (
                <StudentLoginSimulator />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StudentLoginSimulator() {
  const { toast } = useToast()
  const [credentialTypes, setCredentialTypes] = useState<any[]>([])
  const [selectedType, setSelectedType] = useState<string>("")
  const [recipientId, setRecipientId] = useState<string>("student-" + Math.floor(1000 + Math.random() * 9000))
  const [recipientName, setRecipientName] = useState<string>("テスト学生")
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [issuedCredentials, setIssuedCredentials] = useState<any[]>([])

  useEffect(() => {
    // クレデンシャルタイプを読み込む
    const types = JSON.parse(localStorage.getItem("credentialTypes") || "[]")
    setCredentialTypes(types.filter((ct: any) => ct.isActive))

    // 発行済みクレデンシャルを読み込む
    const issued = JSON.parse(localStorage.getItem("issuedCredentials") || "[]")
    setIssuedCredentials(issued)
  }, [])

  useEffect(() => {
    if (selectedType) {
      const selectedCredType = credentialTypes.find((ct) => ct.id === selectedType)
      if (selectedCredType && selectedCredType.schema && selectedCredType.schema.properties) {
        const initialData: Record<string, any> = {}
        Object.entries(selectedCredType.schema.properties).forEach(([key, prop]: [string, any]) => {
          // プロパティタイプに基づいて初期値を設定
          if (prop.type === "string") {
            if (key.toLowerCase().includes("name")) {
              initialData[key] = recipientName
            } else if (key.toLowerCase().includes("id")) {
              initialData[key] = "ID" + Math.floor(10000 + Math.random() * 90000)
            } else if (prop.format === "date") {
              initialData[key] = new Date().toISOString().split("T")[0]
            } else {
              initialData[key] = ""
            }
          } else if (prop.type === "number") {
            initialData[key] = 0
          } else if (prop.type === "boolean") {
            initialData[key] = false
          } else {
            initialData[key] = null
          }
        })
        setFormData(initialData)
      }
    }
  }, [selectedType, recipientName])

  const handleIssueCredential = async () => {
    if (!selectedType) {
      toast({
        title: "エラー",
        description: "クレデンシャルタイプを選択してください",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    const selectedCredType = credentialTypes.find((ct) => ct.id === selectedType)

    // 新しいクレデンシャルを作成
    const newCredential = {
      id: `cred-${Date.now()}`,
      credentialTypeId: selectedType,
      credentialTypeName: selectedCredType?.name || "Unknown",
      recipientId,
      recipientName,
      issuedAt: new Date().toISOString().split("T")[0],
      status: "active",
      data: formData,
    }

    // 発行済みクレデンシャルに追加
    const updatedCredentials = [...issuedCredentials, newCredential]
    localStorage.setItem("issuedCredentials", JSON.stringify(updatedCredentials))
    setIssuedCredentials(updatedCredentials)

    // 発行処理をシミュレート
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "クレデンシャルを発行しました",
        description: `${recipientName}に${selectedCredType?.name}を発行しました`,
      })

      // フォームをリセット
      setRecipientId("student-" + Math.floor(1000 + Math.random() * 9000))
      setFormData({})
    }, 1500)
  }

  const handleRevokeCredential = (credentialId: string) => {
    setIsLoading(true)

    // クレデンシャルを無効化
    const updatedCredentials = issuedCredentials.map((cred) =>
      cred.id === credentialId ? { ...cred, status: "revoked" } : cred,
    )

    localStorage.setItem("issuedCredentials", JSON.stringify(updatedCredentials))

    // 無効化処理をシミュレート
    setTimeout(() => {
      setIssuedCredentials(updatedCredentials)
      setIsLoading(false)
      toast({
        title: "クレデンシャルを無効化しました",
        description: `クレデンシャルID: ${credentialId}を無効化しました`,
      })
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4">クレデンシャル発行シミュレーション</h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>クレデンシャルタイプ</Label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">選択してください</option>
              {credentialTypes.map((ct) => (
                <option key={ct.id} value={ct.id}>
                  {ct.name} (v{ct.version})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>受信者ID</Label>
              <Input value={recipientId} onChange={(e) => setRecipientId(e.target.value)} placeholder="student-1234" />
            </div>
            <div className="space-y-2">
              <Label>受信者名</Label>
              <Input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="山田太郎" />
            </div>
          </div>

          {selectedType && (
            <>
              <h4 className="font-medium mt-4">クレデンシャルデータ</h4>
              <div className="space-y-4 border rounded-lg p-4">
                {Object.entries(formData).map(([key, value]) => {
                  const selectedCredType = credentialTypes.find((ct) => ct.id === selectedType)
                  const propType = selectedCredType?.schema?.properties[key]?.type || "string"

                  return (
                    <div key={key} className="space-y-2">
                      <Label>{selectedCredType?.schema?.properties[key]?.title || key}</Label>
                      {propType === "boolean" ? (
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={!!value}
                            onCheckedChange={(checked) => setFormData({ ...formData, [key]: checked })}
                          />
                          <Label>{value ? "はい" : "いいえ"}</Label>
                        </div>
                      ) : propType === "number" ? (
                        <Input
                          type="number"
                          value={value}
                          onChange={(e) => setFormData({ ...formData, [key]: Number(e.target.value) })}
                        />
                      ) : (
                        <Input value={value} onChange={(e) => setFormData({ ...formData, [key]: e.target.value })} />
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}

          <Button onClick={handleIssueCredential} disabled={isLoading || !selectedType} className="w-full">
            <Play className="h-4 w-4 mr-2" />
            クレデンシャルを発行
          </Button>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4">最近発行したクレデンシャル</h3>

        {issuedCredentials.length > 0 ? (
          <div className="space-y-3">
            {issuedCredentials
              .slice(-5)
              .reverse()
              .map((cred) => (
                <div key={cred.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{cred.credentialTypeName}</p>
                    <p className="text-sm text-gray-600">
                      受信者: {cred.recipientName} ({cred.recipientId})
                    </p>
                    <p className="text-xs text-gray-500">
                      発行日: {cred.issuedAt} | ステータス: {cred.status === "active" ? "有効" : "無効"}
                    </p>
                  </div>
                  {cred.status === "active" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevokeCredential(cred.id)}
                      disabled={isLoading}
                    >
                      無効化
                    </Button>
                  )}
                </div>
              ))}
          </div>
        ) : (
          <p className="text-center text-gray-600 py-4">発行済みクレデンシャルはありません</p>
        )}
      </div>
    </div>
  )
}
