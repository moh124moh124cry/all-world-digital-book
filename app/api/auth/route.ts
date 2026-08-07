import { NextRequest, NextResponse } from 'next/server'
import { verifyInitData, isChannelMember } from '@/lib/telegram'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { initData } = await req.json().catch(() => ({ initData: '' }))

  const user = verifyInitData(initData)
  if (!user) {
    return NextResponse.json(
      { ok: false, reason: 'invalid_init_data' },
      { status: 401 }
    )
  }

  const member = await isChannelMember(user.id)

  return NextResponse.json({
    ok: true,
    member,
    user: {
      id: user.id,
      first_name: user.first_name ?? '',
      language_code: user.language_code ?? 'ar',
    },
  })
}
