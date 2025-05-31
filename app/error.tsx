"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error)
  }, [error])

  // Check if the error is a redirect error
  const isRedirectError = error.message.includes("Redirect") || error.message.includes("redirect")

  // If it's a redirect error, we can provide more specific guidance
  if (isRedirectError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">ページの読み込み中...</CardTitle>
            <CardDescription>ページへのリダイレクト中にエラーが発生しました。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Link href="/login" className="flex-1">
                <Button className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  ログインページへ
                </Button>
              </Link>
              <Button onClick={reset} variant="outline" className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                再試行
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // For other errors, show the standard error UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
          <CardTitle className="text-2xl">エラーが発生しました</CardTitle>
          <CardDescription>申し訳ございませんが、予期しないエラーが発生しました。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600 bg-gray-100 p-3 rounded">
            <strong>エラー詳細:</strong>
            <br />
            {error.message || "Unknown error occurred"}
          </div>
          <div className="flex gap-2">
            <Button onClick={reset} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              再試行
            </Button>
            <Link href="/login" className="flex-1">
              <Button variant="outline" className="w-full">
                ログインページへ
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
