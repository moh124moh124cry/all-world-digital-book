export type BookPage = { type: 'image' | 'html'; content: string }

export async function loadPdf(file: File, scale = 1.6): Promise<BookPage[]> {
  const pdfjs = await import('pdfjs-dist')
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

  const buf = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: buf }).promise
  const pages: BookPage[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const ctx = canvas.getContext('2d')!
    await page.render({ canvasContext: ctx, viewport }).promise
    pages.push({ type: 'image', content: canvas.toDataURL('image/jpeg', 0.85) })
  }
  return pages
}

export async function loadDocx(file: File): Promise<BookPage[]> {
  const mammoth = await import('mammoth')
  const buf = await file.arrayBuffer()
  const { value } = await mammoth.convertToHtml({ arrayBuffer: buf })
  return paginateHtml(value)
}

export async function loadTxt(file: File): Promise<BookPage[]> {
  const text = await file.text()
  const html = text
    .split(/\n{2,}/)
    .map((p) => '<p>' + p.replace(/\n/g, '<br/>') + '</p>')
    .join('')
  return paginateHtml(html)
}

export async function loadEpub(file: File): Promise<BookPage[]> {
  const ePub = (await import('epubjs')).default
  const book = ePub(await file.arrayBuffer())
  await book.ready
  const out: BookPage[] = []
  // @ts-ignore
  for (const item of book.spine.spineItems) {
    const doc = await item.load(book.load.bind(book))
    out.push(...paginateHtml((doc as any).body?.innerHTML || ''))
    item.unload()
  }
  return out
}

export async function loadImage(file: File): Promise<BookPage[]> {
  const url = URL.createObjectURL(file)
  return [{ type: 'image', content: url }]
}

function paginateHtml(html: string, charsPerPage = 1400): BookPage[] {
  const div = document.createElement('div')
  div.innerHTML = html
  const blocks = Array.from(div.children).map((el) => el.outerHTML)

  const pages: BookPage[] = []
  let buffer = ''
  for (const block of blocks) {
    if ((buffer + block).length > charsPerPage && buffer) {
      pages.push({ type: 'html', content: buffer })
      buffer = ''
    }
    buffer += block
  }
  if (buffer) pages.push({ type: 'html', content: buffer })
  return pages.length ? pages : [{ type: 'html', content: html }]
}

export async function loadAny(file: File): Promise<BookPage[]> {
  const name = file.name.toLowerCase()
  if (name.endsWith('.pdf')) return loadPdf(file)
  if (name.endsWith('.docx')) return loadDocx(file)
  if (name.endsWith('.epub')) return loadEpub(file)
  if (name.match(/\.(txt|md|csv)$/)) return loadTxt(file)
  if (name.match(/\.(png|jpe?g|webp|gif|bmp)$/)) return loadImage(file)
  throw new Error('unsupported_format')
    }
