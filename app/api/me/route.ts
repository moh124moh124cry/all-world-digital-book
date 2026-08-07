import { NextRequest, NextResponse } from 'next/server'
import { readSession, isChannelMember } from '@/lib/auth'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const session = await readSession(req.cookies.get('awdb_session')?.value)
  if (!session) return NextResponse.json({ ok: false }, { status: 401 })

  // إعادة التحقق من بقاء الاشتراك
  const still = await isChannelMember(session.uid)
  if (!still) return NextResponse.json({ ok: false, error: 'left_channel' }, { status: 403 })

  return NextResponse.json({ ok: true, user: session })
}
