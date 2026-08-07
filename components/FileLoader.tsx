'use client'
import { useState } from 'react'
import { loadAny, BookPage } from '@/lib/loaders'
import { t, Lang } from '@/lib/i18n'

export default function FileLoader({
  lang,
  onLoaded,
}: {
  lang: Lang
  onLoaded: (pages: BookPage[], title: string) => void
}) {
  const T = t(lang)
  const [busy, setBusy] = useState(false)

  async function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    try {
      const pages = await loadAny(file)
      onLoaded(pages, file.name)
    } catch {
      alert('Format not supported')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="loader glass">
      <label className="btn primary">
        {busy ? T.loading : T.openFile}
        <input
          type="file"
          hidden
          accept=".pdf,.epub,.docx,.txt,.md,.csv,image/*"
          onChange={handle}
        />
      </label>
      <p className="muted">{T.supported}</p>
    </div>
  )
}
