import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { User } from "@supabase/supabase-js"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getUserDisplayName(user: User | null): string {
  if (!user) return ""
  return (user.user_metadata?.display_name as string) || user.email?.split("@")[0] || ""
}
