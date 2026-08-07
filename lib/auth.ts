import crypto from 'crypto'
import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.SESSION_SECRET!)

export type TgUser = {
  id: number
  first_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

export function verifyTelegramPayload(data: Record<string, string>) {
  const { hash, ...rest } = data
  const checkString = Object.keys(rest)
    .sort()
    .map((k) => k + '=' + rest[k])
    .join('\n')

  const secretKey = crypto
    .createHash('sha256')
    .update(process.env.TELEGRAM_BOT_TOKEN!)
    .digest()

  const hmac = crypto
    .createHmac('sha256', secretKey)
    .update(checkString)
    .digest('hex')

  if (hmac !== hash) return false
  const age = Math.floor(Date.now() / 1000) - Number(rest.auth_date)
  return age < 86400
}

export async function isChannelMember(userId: number) {
  const url =
    'https://api.telegram.org/bot' +
    process.env.TELEGRAM_BOT_TOKEN +
    '/getChatMember?chat_id=' +
    encodeURIComponent(process.env.TELEGRAM_CHANNEL!) +
    '&user_id=' +
    userId

  const res = await fetch(url, { cache: 'no-store' })
  const json = await res.json()
  if (!json.ok) return false
  const status = json.result?.status
  return ['creator', 'administrator', 'member'].includes(status)
}

export async function createSession(userId: number, name: string) {
  return new SignJWT({ uid: userId, name })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret)
}

export async function readSession(token?: string) {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as { uid: number; name: string }
  } catch {
    return null
  }
                                    }
