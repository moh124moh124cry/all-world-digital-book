'use client'
import { useEffect, useRef } from 'react'

export default function TelegramLoginButton({
  onAuth,
}: {
  onAuth: (user: Record<string, string>) => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ;(window as any).onTelegramAuth = onAuth

    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.async = true
    script.setAttribute(
      'data-telegram-login',
      process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME as string
    )
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-radius', '12')
    script.setAttribute('data-userpic', 'true')
    script.setAttribute('data-onauth', 'onTelegramAuth(user)')
    script.setAttribute('data-request-access', 'write')
    ref.current?.appendChild(script)
  }, [onAuth])

  return <div ref={ref} />
}
