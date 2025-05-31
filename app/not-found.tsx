"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-6xl font-bold text-gray-400 mb-4">404</CardTitle>
          <CardTitle className="text-2xl">ページが見つかりません</CardTitle>
          <CardDescription>お探しのページは存在しないか、移動された可能性があります。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Link href="/dashboard">
              <Button className="w-full">
                <Home className="h-4 w-4 mr-2" />
                ダッシュボードへ
              </Button>
            </Link>
            <Button variant="outline" onClick={() => window.history.back()} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              前のページに戻る
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
