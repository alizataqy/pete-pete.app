import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  return await auth.handler(request);
}

export async function POST(request: NextRequest) {
  return await auth.handler(request);
}
