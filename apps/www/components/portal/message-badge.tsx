"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MessageSquare } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface MessageBadgeProps {
  role: "recruiter" | "candidate" | "school"
  userId: string
}

export function MessageBadge({ userId }: MessageBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchUnreadCount = async () => {
      const supabase = createClient()

      // Get all conversation IDs where user is a participant
      const { data: participations } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", userId)

      if (!participations || participations.length === 0) {
        setUnreadCount(0)
        return
      }

      const conversationIds = participations.map((p) => p.conversation_id)

      // Count unread messages
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .in("conversation_id", conversationIds)
        .neq("sender_id", userId)
        .is("read_at", null)

      setUnreadCount(count || 0)
    }

    // Fetch initially
    fetchUnreadCount()

    // Poll every 10 seconds
    const interval = setInterval(fetchUnreadCount, 10000)

    return () => clearInterval(interval)
  }, [userId])

  return (
    <Link
      href="/messages"
      className="relative text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
    >
      <span className="flex items-center gap-1.5">
        <MessageSquare className="h-4 w-4" />
        Messages
      </span>
      {unreadCount > 0 && (
        <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  )
}
