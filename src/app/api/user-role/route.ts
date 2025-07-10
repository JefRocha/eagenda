import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth.api.getSession({ headers: headers() });

  const role = session?.user?.role ?? "user";
  return NextResponse.json({ role });
}
