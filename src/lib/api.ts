import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        message: "请求数据校验失败",
        issues: error.flatten()
      },
      { status: 400 }
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return NextResponse.json({ message: "记录已存在，请检查唯一字段" }, { status: 409 });
    }

    if (error.code === "P2003") {
      return NextResponse.json({ message: "关联数据不存在或无法删除" }, { status: 409 });
    }

    if (error.code === "P2025") {
      return NextResponse.json({ message: "记录不存在或无权访问" }, { status: 404 });
    }
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        message: process.env.NODE_ENV === "production" ? "服务器处理失败" : error.message
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "未知错误" }, { status: 500 });
}
