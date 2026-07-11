'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// Phase 1: Notifications system stubbed. Will wire up in Phase 2.

export type NotificationDTO = {
  id: string
  user_id: string
  type: 'like' | 'comment' | 'follow' | 'mention' | 'message' | 'event' | 'system'
  title: string
  body: string | null
  link_url: string | null
  actor_id: string | null
  actor_name: string | null
  actor_avatar: string | null
  entity_type: string | null
  entity_id: string | null
  is_read: boolean
  created_at: string
}

export async function listNotifications(input?: { 
  limit?: number;
  unread_only?: boolean;
  type?: 'like' | 'comment' | 'follow' | 'mention' | 'message' | 'event' | 'system';
}): Promise<NotificationDTO[]> {
  // Phase 1 stub: return empty array
  return []
}

export async function getNotification(input: { id: string }): Promise<NotificationDTO | null> {
  // Phase 1 stub
  return null
}

export async function createNotification(input: {
  user_id: string
  type: 'like' | 'comment' | 'follow' | 'mention' | 'message' | 'event' | 'system'
  title: string
  body?: string | null
  link_url?: string | null
  actor_id?: string | null
  entity_type?: string | null
  entity_id?: string | null
}): Promise<{ id: string }> {
  // Phase 1 stub
  return { id: "stubbed-for-phase-1" }
}

export async function markNotificationRead(input: { id: string }): Promise<{ ok: true }> {
  // Phase 1 stub
  return { ok: true }
}

export async function markAllNotificationsRead(): Promise<{ ok: true }> {
  // Phase 1 stub
  return { ok: true }
}

export async function deleteNotification(input: { id: string }): Promise<{ ok: true }> {
  // Phase 1 stub
  return { ok: true }
}

export async function getUnreadCount(): Promise<{ count: number }> {
  // Phase 1 stub
  return { count: 0 }
}
