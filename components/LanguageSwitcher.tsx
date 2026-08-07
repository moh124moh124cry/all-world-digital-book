'use client'
import { Lang, LANGS } from '@/lib/i18n'

export default function LanguageSwitcher({
  lang,
  onChange,
}: {
  lang: Lang
  onChange: (l: Lang) => void
}) {
  return (
    <div className="lang-switcher">
      {LANGS.map((l) => (
        <button
          key={l.code}
          className={lang === l.code ? 'active' : ''}
          onClick={() => onChange(l.code)}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
