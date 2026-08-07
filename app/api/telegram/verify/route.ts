import { NextRequest, NextResponse } from 'next/server'
import { verifyTelegramPayload, isChannelMember, createSession } from '@/lib/auth'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const body = await req.json()

  if (!verifyTelegramPayload(body)) {
    return NextResponse.json({ ok: false, error: 'bad_signature' }, { status: 401 })
  }

  const member = await isChannelMember(Number(body.id))
  if (!member) {
    return NextResponse.json({ ok: false, error: 'not_member' }, { status: 403 })
  }

  const token = await createSession(
    Number(body.id),
    body.first_name || body.username || 'reader'
  )

  const res = NextResponse.json({ ok: true })
  res.cookies.set('awdb_session', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  return res
}
