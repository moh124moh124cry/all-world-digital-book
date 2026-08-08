'use client'

import { useEffect, useState } from 'react'
import { LANGS, t, type Lang } from '@/lib/i18n'
import FileLoader from '@/components/FileLoader'
import BookReader from '@/components/BookReader'
import type { BookPage } from '@/lib/loaders'

type State = 'loading' | 'not_member' | 'ready' | 'not_telegram'

export default function Home() {
  const [state, setState] = useState<State>('loading')
  const [lang, setLang] = useState<Lang>('ar')
  const [name, setName] = useState('')
  const [pages, setPages] = useState<BookPage[] | null>(null)

  const channelUrl = 'https://t.me/Allworlddigital'

  async function authenticate() {
    const tg = (window as any).Telegram?.WebApp

    if (!tg || !tg.initData) {
      setState('not_telegram')
      return
    }

    tg.ready()
    tg.expand()

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData: tg.initData }),
    })

    if (!res.ok) {
      setState('not_telegram')
      return
    }

    const data = await res.json()
    setName(data.user?.first_name || '')

    const code = (data.user?.language_code || 'ar').slice(0, 2)
    if (['ar', 'en', 'fr', 'es'].includes(code)) setLang(code as any)



    setState(data.member ? 'ready' : 'not_member')
  }

  useEffect(() => {
    authenticate()
  }, [])

  const d = t(lang)
  const rtl = lang === 'ar'

  if (state === 'loading') {
    return (
      <main className="gate" dir={rtl ? 'rtl' : 'ltr'}>
        <div className="card">
          <div className="spinner" />
          <p>{d.loading}</p>
        </div>
      </main>
    )
  }

  if (state === 'not_telegram') {
    return (
      <main className="gate" dir={rtl ? 'rtl' : 'ltr'}>
        <div className="card">
          <h1>All World Digital Book</h1>
          <p>افتح هذا التطبيق من داخل تليغرام فقط.</p>
          <a className="btn" href="https://t.me/AllWorldBookBot/read">
            افتح في تليغرام
          </a>
        </div>
      </main>
    )
  }

  if (state === 'not_member') {
    return (
      <main className="gate" dir={rtl ? 'rtl' : 'ltr'}>
        <div className="card">
          <h1>All World Digital Book</h1>
          <p>{d.tagline}</p>
          <p className="warn">{d.notMember}</p>
          <a
            className="btn"
            href={channelUrl}
            target="_blank"
            rel="noreferrer"
          >
            {d.joinChannel}
          </a>
          <button className="btn ghost" onClick={() => { setState('loading'); authenticate() }}>
            {d.verify}
          </button>
        </div>
      </main>
    )
  }

  return (
    <main dir={rtl ? 'rtl' : 'ltr'}>
      <header className="topbar">
        <strong>{d.appName}</strong>
        <span className="who">{name}</span>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as Lang)}
        >
          <option value="ar">العربية</option>
          <option value="en">English</option>
          <option value="fr">Français</option>
          <option value="es">Español</option>
        </select>
      </header>

      {pages ? (
        <BookReader pages={pages} lang={lang} onClose={() => setPages(null)} />
      ) : (
        <FileLoader lang={lang} onLoaded={setPages} />
      )}
    </main>
  )
}
