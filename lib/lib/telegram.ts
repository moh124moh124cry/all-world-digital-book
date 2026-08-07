import crypto from 'crypto'

export type TgUser = {
  id: number
  first_name?: string
  username?: string
  language_code?: string
}

/**
 * التحقق من initData وفق خوارزمية تليغرام الرسمية.
 * ملاحظة حرجة: مفتاح WebAppData يختلف عن مفتاح Login Widget.
 */
export function verifyInitData(initData: string): TgUser | null {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token || !initData) return null

  const params = new URLSearchParams(initData)
  const hash = params.get('hash')
  if (!hash) return null
  params.delete('hash')

  const dataCheckString = [...params.entries()]
    .map(([k, v]) => `\( {k}= \){v}`)
    .sort()
    .join('\n')

  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(token)
    .digest()

  const computed = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex')

  if (computed !== hash) return null

  // رفض البيانات الأقدم من 24 ساعة
  const authDate = Number(params.get('auth_date') || 0)
  if (Date.now() / 1000 - authDate > 86400) return null

  const rawUser = params.get('user')
  if (!rawUser) return null

  try {
    return JSON.parse(rawUser) as TgUser
  } catch {
    return null
  }
}

/** هل المستخدم مشترك في القناة؟ */
export async function isChannelMember(userId: number): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const channel = process.env.TELEGRAM_CHANNEL // @Allworlddigital
  if (!token || !channel) return false

  const url =
    `https://api.telegram.org/bot${token}/getChatMember` +
    `?chat_id=\( {encodeURIComponent(channel)}&user_id= \){userId}`

  try {
    const res = await fetch(url, { cache: 'no-store' })
    const json = await res.json()
    if (!json.ok) return false
    const status = json.result?.status
    return ['creator', 'administrator', 'member'].includes(status)
  } catch {
    return false
  }
}
