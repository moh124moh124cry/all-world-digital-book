'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import HTMLFlipBook from 'react-pageflip'
import { BookPage } from '@/lib/loaders'
import { t, Lang } from '@/lib/i18n'

export default function BookReader({
  pages,
  lang,
}: {
  pages: BookPage[]
  lang: Lang
}) {
  const T = t(lang)
  const bookRef = useRef<any>(null)
  const [current, setCurrent] = useState(0)
  const [soundOn, setSoundOn] = useState(true)
  const audioCtx = useRef<AudioContext | null>(null)
  const buffer = useRef<AudioBuffer | null>(null)

  useEffect(() => {
    let cancelled = false
    async function init() {
      const Ctx = (window.AudioContext || (window as any).webkitAudioContext)
      const ctx = new Ctx()
      const res = await fetch('/sounds/page-flip.mp3')
      const arr = await res.arrayBuffer()
      const buf = await ctx.decodeAudioData(arr)
      if (cancelled) return
      audioCtx.current = ctx
      buffer.current = buf
    }
    init()
    return () => { cancelled = true }
  }, [])

  function playFlip() {
    if (!soundOn || !audioCtx.current || !buffer.current) return
    if (audioCtx.current.state === 'suspended') audioCtx.current.resume()
    const src = audioCtx.current.createBufferSource()
    const gain = audioCtx.current.createGain()
    gain.gain.value = 0.55
    src.buffer = buffer.current
    src.playbackRate.value = 0.92 + Math.random() * 0.16
    src.connect(gain).connect(audioCtx.current.destination)
    src.start(0)
  }

  const size = useMemo(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1024
    const isPhone = w < 768
    return {
      width: isPhone ? Math.min(w - 32, 420) : 520,
      height: isPhone ? Math.min(w * 1.35, 620) : 720,
    }
  }, [])

  return (
    <div className="reader">
      <HTMLFlipBook
        ref={bookRef}
        width={size.width}
        height={size.height}
        size="stretch"
        minWidth={280}
        maxWidth={900}
        minHeight={400}
        maxHeight={1200}
        maxShadowOpacity={0.6}
        showCover={true}
        mobileScrollSupport={true}
        drawShadow={true}
        flippingTime={750}
        usePortrait={true}
        startZIndex={10}
        autoSize={true}
        clickEventForward={true}
        useMouseEvents={true}
        swipeDistance={30}
        showPageCorners={true}
        disableFlipByClick={false}
        className="flipbook"
        style={{}}
        startPage={0}
        onFlip={(e: any) => {
          setCurrent(e.data)
          playFlip()
        }}
      >
        {pages.map((p, i) => (
          <div className="page" key={i}>
            <div className="page-inner">
              {p.type === 'image' ? (
                <img src={p.content} alt={'page ' + (i + 1)} />
              ) : (
                <div
                  className="page-text"
                  dir={lang === 'ar' ? 'rtl' : 'ltr'}
                  dangerouslySetInnerHTML={{ __html: p.content }}
                />
              )}
            </div>
            <span className="page-num">{i + 1}</span>
          </div>
        ))}
      </HTMLFlipBook>

      <div className="toolbar glass">
        <button onClick={() => bookRef.current?.pageFlip().flipPrev()}>‹ {T.prev}</button>
        <span>
          {T.page} {current + 1} {T.of} {pages.length}
        </span>
        <button onClick={() => bookRef.current?.pageFlip().flipNext()}>{T.next} ›</button>
        <label className="switch">
          <input
            type="checkbox"
            checked={soundOn}
            onChange={(e) => setSoundOn(e.target.checked)}
          />
          {T.sound}
        </label>
      </div>
    </div>
  )
}
