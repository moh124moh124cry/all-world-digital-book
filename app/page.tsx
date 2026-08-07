'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BookReader from '@/components/BookReader'
import FileLoader from '@/components/FileLoader'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { BookPage } from '@/lib/loaders'
import { t, Lang } from '@/lib/i18n'

export default function Home() {
  const [pages, setPages] = useState<BookPage[]>([])
  const [title, setTitle] = useState('')
  const [lang, setLang] = useState<Lang>('ar')
  const [auth, setAuth] = useState(false)
  const router = useRouter()
  const T = t(lang)

  useEffect(() => {
    fetch('/api/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setAuth(true)
        else router.push('/login')
      })
      .catch(() => router.push('/login'))
  }, [router])

  if (!auth) return <div className="screen glass">{T.loading}</div>

  return (
    <main className="screen" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="glass">
        <h1>{title || T.appName}</h1>
        <div className="actions">
          <LanguageSwitcher lang={lang} onChange={setLang} />
          <button
            className="btn"
            style={{ marginLeft: 10, marginRight: 10 }}
            onClick={() => {
              document.cookie = 'awdb_session=; Max-Age=0; path=/'
              window.location.reload()
            }}
          >
            {T.logout}
          </button>
        </div>
      </header>

      {pages.length > 0 ? (
        <BookReader pages={pages} lang={lang} />
      ) : (
        <FileLoader lang={lang} onLoaded={(p, t) => { setPages(p); setTitle(t); }} />
      )}
    </main>
  )
}
