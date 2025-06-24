import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./useApiCall";

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  role: string;
  plan: "Free" | "Pro" | "Enterprise";
  updatedAt: string;
}

async function fetchMe() {
  const res = await apiFetch("/profiles/me");
  if (res.status === 401) throw new Error("Unauthenticated");
  if (!res.ok) throw new Error("Failed to fetch profile");
  return (await res.json()) as UserProfile;
}

export function useUser() {
  return useQuery<UserProfile, Error>({
    queryKey: ["me"],
    queryFn: fetchMe,
    refetchOnWindowFocus: false,
  });
}

// if you ever need to refresh from outside:
export function useRefreshUser() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["me"] });
}
