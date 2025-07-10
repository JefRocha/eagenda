import { useQuery } from "@tanstack/react-query";

async function fetchUserRole() {
  const res = await fetch("/api/user-role");
  if (!res.ok) throw new Error("Failed to fetch user role");
  const data = await res.json();
  return data.role;
}

export function useUserRole() {
  const { data: userRole } = useQuery({
    queryKey: ["userRole"],
    queryFn: fetchUserRole,
  });
  return userRole ?? "user";
}
