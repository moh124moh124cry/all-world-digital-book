'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import TelegramLoginButton from '@/components/TelegramLoginButton'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { t, Lang } from '@/lib/i18n'

export default function LoginPage() {
  const [lang, setLang] = useState<Lang>('ar')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const router = useRouter()
  const T = t(lang)

  async function handleAuth(user: Record<string, string>) {
    setPending(true)
    setError('')
    const res = await fetch('/api/telegram/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    })
    setPending(false)
    if (res.ok) router.push('/')
    else setError(T.notMember)
  }

  return (
    <main className="screen login" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="glass card">
        <LanguageSwitcher lang={lang} onChange={setLang} />
        <h1>{T.appName}</h1>
        <p className="muted">{T.tagline}</p>

        <a
          className="btn primary"
          href={process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_URL}
          target="_blank"
          rel="noreferrer"
        >
          {T.joinChannel}
        </a>

        <div className="tg-wrap">
          <TelegramLoginButton onAuth={handleAuth} />
        </div>

        {pending && <p className="muted">{T.loading}</p>}
        {error && <p className="error">{error}</p>}
      </div>
    </main>
  )
}
