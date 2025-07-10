import { headers } from "next/headers";

import { auth } from "@/lib/auth";

export async function getUserRoleServer() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user?.role ?? "user";
}
