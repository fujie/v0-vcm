import { NextResponse } from "next/server"

// Student Login Site向けのAPI エンドポイント
export async function GET() {
  try {
    // ローカルストレージの代わりにサーバーサイドでデータを管理
    // 実際の実装では、データベースから取得
    const credentialTypes = [
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
        isActive: true,
      },
    ]

    return NextResponse.json({
      success: true,
      data: credentialTypes,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch credential types" }, { status: 500 })
  }
}
