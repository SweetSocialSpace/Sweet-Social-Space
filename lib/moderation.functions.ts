'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// Phase 1: Moderation system stubbed. Will wire up in Phase 2.

// ---------------------------------------------------------------
// Types
// ---------------------------------------------------------------

export type ModerationReportDTO = {
  id: string
  content_type: 'post' | 'comment' | 'user' | 'message'
  content_id: string
  reason: string
  description: string | null
  reporter_id: string
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  created_at: string
  reviewed_by: string | null
  reviewed_at: string | null
  action_taken: string | null
}

export type ModerationActionDTO = {
  id: string
  action_type: 'warn' | 'remove_content' | 'ban_user' | 'restrict_user'
  target_type: 'post' | 'comment' | 'user'
  target_id: string
  moderator_id: string
  reason: string
  duration_hours: number | null
  created_at: string
}

// ---------------------------------------------------------------
// Report Functions
// ---------------------------------------------------------------

export async function createReport(input: {
  content_type: 'post' | 'comment' | 'user' | 'message'
  content_id: string
  reason: string
  description?: string | null
}): Promise<{ id: string }> {
  // Phase 1 stub
  return { id: "stubbed-for-phase-1" }
}

export async function listReports(input?: { 
  limit?: number;
  status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
}): Promise<ModerationReportDTO[]> {
  // Phase 1 stub: return empty array
  return []
}

export async function getReport(input: { id: string }): Promise<ModerationReportDTO | null> {
  // Phase 1 stub
  return null
}

export async function updateReportStatus(input: {
  id: string
  status: 'reviewed' | 'resolved' | 'dismissed'
  action_taken?: string | null
}): Promise<{ ok: true }> {
  // Phase 1 stub
  return { ok: true }
}

// ---------------------------------------------------------------
// Moderation Action Functions
// ---------------------------------------------------------------

export async function takeModerationAction(input: {
  action_type: 'warn' | 'remove_content' | 'ban_user' | 'restrict_user'
  target_type: 'post' | 'comment' | 'user'
  target_id: string
  reason: string
  duration_hours?: number | null
}): Promise<{ id: string }> {
  // Phase 1 stub
  return { id: "stubbed-for-phase-1" }
}

export async function listModerationActions(input?: { 
  limit?: number;
  target_type?: 'post' | 'comment' | 'user';
  target_id?: string;
}): Promise<ModerationActionDTO[]> {
  // Phase 1 stub
  return []
}

// ---------------------------------------------------------------
// Content Filtering Functions
// ---------------------------------------------------------------

export async function checkContent(input: { 
  text: string;
  content_type?: 'post' | 'comment' | 'message';
}): Promise<{ flagged: boolean; reasons: string[] }> {
  // Phase 1 stub: never flag anything
  return { flagged: false, reasons: [] }
}

export async function hideContent(input: {
  content_type: 'post' | 'comment'
  content_id: string
  reason: string
}): Promise<{ ok: true }> {
  // Phase 1 stub
  return { ok: true }
}

export async function unhideContent(input: {
  content_type: 'post' | 'comment'
  content_id: string
}): Promise<{ ok: true }> {
  // Phase 1 stub
  return { ok: true }
}
