"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield } from "lucide-react"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // ダミー認証 - 実際のシステムでは適切な認証を実装
    if (username === "admin" && password === "admin") {
      localStorage.setItem("isAuthenticated", "true")
      router.push("/dashboard")
    } else {
      alert("ユーザー名: admin, パスワード: admin でログインしてください")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">VC管理システム</CardTitle>
          <CardDescription>Verifiable Credential管理者ログイン</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">ユーザー名</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="admin"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              ログイン
            </Button>
          </form>
          <div className="mt-4 text-sm text-gray-600 text-center">
            <p>デモ用認証情報:</p>
            <p>ユーザー名: admin / パスワード: admin</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
