"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, RefreshCw, Trash2, Eye, Clock, Server, ArrowDownUp } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type ApiLog, getApiLogs, getApiLogById, clearApiLogs } from "@/lib/api-logs"
import { useToast } from "@/hooks/use-toast"

export default function LogsPage() {
  const { toast } = useToast()
  const [logs, setLogs] = useState<ApiLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<ApiLog[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [endpointFilter, setEndpointFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedLog, setSelectedLog] = useState<ApiLog | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  useEffect(() => {
    loadLogs()
  }, [])

  useEffect(() => {
    filterLogs()
  }, [logs, searchTerm, endpointFilter, statusFilter, sortOrder])

  const loadLogs = () => {
    const apiLogs = getApiLogs()
    setLogs(apiLogs)
  }

  const filterLogs = () => {
    let filtered = [...logs]

    // 検索フィルター
    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.userAgent?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.sourceIp?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // エンドポイントフィルター
    if (endpointFilter !== "all") {
      filtered = filtered.filter((log) => log.endpoint.includes(endpointFilter))
    }

    // ステータスフィルター
    if (statusFilter !== "all") {
      if (statusFilter === "success") {
        filtered = filtered.filter((log) => log.success)
      } else if (statusFilter === "error") {
        filtered = filtered.filter((log) => !log.success)
      }
    }

    // ソート
    filtered.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime()
      const dateB = new Date(b.timestamp).getTime()
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB
    })

    setFilteredLogs(filtered)
  }

  const handleClearLogs = () => {
    clearApiLogs()
    setLogs([])
    toast({
      title: "ログをクリアしました",
      description: "すべてのAPIログが削除されました",
    })
  }

  const handleViewLog = (logId: string) => {
    const log = getApiLogById(logId)
    if (log) {
      setSelectedLog(log)
      setIsDialogOpen(true)
    }
  }

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc")
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString("ja-JP")
    } catch (e) {
      return dateString
    }
  }

  const getStatusBadge = (log: ApiLog) => {
    if (log.success) {
      return <Badge className="bg-green-100 text-green-800">成功</Badge>
    } else {
      return <Badge className="bg-red-100 text-red-800">エラー</Badge>
    }
  }

  const getEndpointBadge = (endpoint: string) => {
    if (endpoint.includes("credential-types")) {
      return (
        <Badge variant="outline" className="bg-blue-50">
          クレデンシャルタイプ
        </Badge>
      )
    } else if (endpoint.includes("sync")) {
      return (
        <Badge variant="outline" className="bg-purple-50">
          同期
        </Badge>
      )
    } else if (endpoint.includes("health")) {
      return (
        <Badge variant="outline" className="bg-green-50">
          ヘルスチェック
        </Badge>
      )
    } else {
      return <Badge variant="outline">その他</Badge>
    }
  }

  const getSourceBadge = (source: string) => {
    if (source === "external") {
      return (
        <Badge variant="outline" className="bg-yellow-50">
          外部
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="bg-blue-50">
          内部
        </Badge>
      )
    }
  }

  const uniqueEndpoints = Array.from(new Set(logs.map((log) => log.endpoint)))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">APIログ</h1>
          <p className="text-gray-600 mt-2">Student Login Siteとの通信ログを表示</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadLogs}>
            <RefreshCw className="h-4 w-4 mr-2" />
            更新
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4 mr-2" />
                クリア
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>ログのクリア</AlertDialogTitle>
                <AlertDialogDescription>すべてのAPIログを削除します。この操作は取り消せません。</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>キャンセル</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearLogs} className="bg-red-600 hover:bg-red-700">
                  削除
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* フィルターとサーチ */}
      <Card>
        <CardHeader>
          <CardTitle>フィルター</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">検索</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="エンドポイント、ソース、IPアドレスで検索"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endpoint">エンドポイント</Label>
              <select
                id="endpoint"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={endpointFilter}
                onChange={(e) => setEndpointFilter(e.target.value)}
              >
                <option value="all">すべて</option>
                <option value="credential-types">クレデンシャルタイプ</option>
                <option value="sync">同期</option>
                <option value="health">ヘルスチェック</option>
              </select>
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
                <option value="success">成功</option>
                <option value="error">エラー</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sort">並び順</Label>
              <Button variant="outline" className="w-full" onClick={toggleSortOrder}>
                <ArrowDownUp className="h-4 w-4 mr-2" />
                {sortOrder === "desc" ? "新しい順" : "古い順"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ログ一覧 */}
      <div className="space-y-4">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <Card key={log.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{log.endpoint}</span>
                        {getEndpointBadge(log.endpoint)}
                        {getSourceBadge(log.source)}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(log.timestamp)}</span>
                        <span>•</span>
                        <span>{log.method}</span>
                        <span>•</span>
                        <span>{log.duration}ms</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(log)}
                    <Button variant="outline" size="sm" onClick={() => handleViewLog(log.id)}>
                      <Eye className="h-4 w-4 mr-1" />
                      詳細
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-600">ログが見つかりません</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ログ詳細ダイアログ */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>APIログ詳細</DialogTitle>
            <DialogDescription>{selectedLog && formatDate(selectedLog.timestamp)}</DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <Tabs defaultValue="overview">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="overview">概要</TabsTrigger>
                <TabsTrigger value="request">リクエスト</TabsTrigger>
                <TabsTrigger value="response">レスポンス</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>エンドポイント</Label>
                    <div className="font-mono text-sm bg-gray-50 p-2 rounded">{selectedLog.endpoint}</div>
                  </div>
                  <div className="space-y-2">
                    <Label>メソッド</Label>
                    <div className="font-mono text-sm bg-gray-50 p-2 rounded">{selectedLog.method}</div>
                  </div>
                  <div className="space-y-2">
                    <Label>ソース</Label>
                    <div className="font-mono text-sm bg-gray-50 p-2 rounded">{selectedLog.source}</div>
                  </div>
                  <div className="space-y-2">
                    <Label>ステータス</Label>
                    <div className="font-mono text-sm bg-gray-50 p-2 rounded">
                      {selectedLog.success ? "成功" : "エラー"} ({selectedLog.responseStatus})
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>タイムスタンプ</Label>
                    <div className="font-mono text-sm bg-gray-50 p-2 rounded">{formatDate(selectedLog.timestamp)}</div>
                  </div>
                  <div className="space-y-2">
                    <Label>処理時間</Label>
                    <div className="font-mono text-sm bg-gray-50 p-2 rounded">{selectedLog.duration}ms</div>
                  </div>
                  <div className="space-y-2">
                    <Label>ソースIP</Label>
                    <div className="font-mono text-sm bg-gray-50 p-2 rounded">{selectedLog.sourceIp || "不明"}</div>
                  </div>
                  <div className="space-y-2">
                    <Label>ユーザーエージェント</Label>
                    <div className="font-mono text-sm bg-gray-50 p-2 rounded overflow-x-auto">
                      {selectedLog.userAgent || "不明"}
                    </div>
                  </div>
                </div>

                {selectedLog.error && (
                  <div className="space-y-2">
                    <Label>エラー</Label>
                    <div className="font-mono text-sm bg-red-50 text-red-800 p-2 rounded">{selectedLog.error}</div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="request" className="space-y-4">
                <div className="space-y-2">
                  <Label>リクエストヘッダー</Label>
                  <pre className="font-mono text-sm bg-gray-50 p-4 rounded overflow-x-auto max-h-60">
                    {JSON.stringify(selectedLog.requestHeaders, null, 2)}
                  </pre>
                </div>

                {selectedLog.requestBody && (
                  <div className="space-y-2">
                    <Label>リクエストボディ</Label>
                    <pre className="font-mono text-sm bg-gray-50 p-4 rounded overflow-x-auto max-h-60">
                      {JSON.stringify(selectedLog.requestBody, null, 2)}
                    </pre>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="response" className="space-y-4">
                <div className="space-y-2">
                  <Label>レスポンスステータス</Label>
                  <div className="font-mono text-sm bg-gray-50 p-2 rounded">{selectedLog.responseStatus}</div>
                </div>

                {selectedLog.responseBody && (
                  <div className="space-y-2">
                    <Label>レスポンスボディ</Label>
                    <pre className="font-mono text-sm bg-gray-50 p-4 rounded overflow-x-auto max-h-60">
                      {JSON.stringify(selectedLog.responseBody, null, 2)}
                    </pre>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
