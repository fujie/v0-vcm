"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Loader2 } from "lucide-react"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if already authenticated
    try {
      const auth = localStorage.getItem("isAuthenticated")
      if (auth === "true") {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Auth check error:", error)
    } finally {
      setIsCheckingAuth(false)
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate authentication delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // ダミー認証 - 実際のシステムでは適切な認証を実装
      if (username === "admin" && password === "admin") {
        localStorage.setItem("isAuthenticated", "true")
        router.push("/dashboard")
      } else {
        alert("ユーザー名: admin, パスワード: admin でログインしてください")
      }
    } catch (error) {
      console.error("Login error:", error)
      alert("ログイン中にエラーが発生しました")
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">認証状態を確認中...</p>
        </div>
      </div>
    )
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
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ログイン中...
                </>
              ) : (
                "ログイン"
              )}
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
