import * as chardet from 'chardet'
import Epub from 'epub'
import * as fs from 'fs-extra'
import * as iconv from 'iconv-lite'
import { isEpubFilePath, isOfficeFilePath } from '../shared/file-extensions'
import { getLogger } from './util'

const log = getLogger('file-parser')

// Helper function to decode HTML entities
function decodeHtmlEntities(text: string): string {
  // Handle hexadecimal entities like &#x6b64;
  text = text.replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => {
    try {
      return String.fromCharCode(parseInt(hex, 16))
    } catch (_e) {
      return match // Return original if conversion fails
    }
  })

  // Handle decimal entities like &#123;
  text = text.replace(/&#(\d+);/g, (match, dec) => {
    try {
      return String.fromCharCode(parseInt(dec, 10))
    } catch (_e) {
      return match // Return original if conversion fails
    }
  })

  // Handle named entities
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
}

// Simple concurrent map implementation using native Promise.allSettled
async function concurrentMap<T, R>(
  items: T[],
  mapper: (item: T, index: number) => Promise<R>,
  concurrency: number = 8
): Promise<R[]> {
  const results: R[] = []

  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency)
    const batchNumber = Math.floor(i / concurrency) + 1
    const totalBatches = Math.ceil(items.length / concurrency)

    log.debug(`Processing batch ${batchNumber}/${totalBatches} with ${batch.length} items`)

    const batchResults = await Promise.allSettled(batch.map((item, batchIndex) => mapper(item, i + batchIndex)))

    // Extract successful results
    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value)
      }
    }
  }

  return results
}

export async function parseFile(filePath: string) {
  if (isOfficeFilePath(filePath)) {
    try {
      const { parseOffice } = await import('officeparser')
      const ast = await parseOffice(filePath)
      return ast.toText()
    } catch (error) {
      log.error(error)
      throw error
    }
  }

  if (isEpubFilePath(filePath)) {
    try {
      const data = await parseEpub(filePath)
      return data
    } catch (error) {
      log.error(error)
      throw error
    }
  }

  // Read first 4KB for encoding detection to avoid memory issues with large files
  const stats = await fs.stat(filePath)
  const sampleSize = Math.min(4096, stats.size)

  // Read sample using createReadStream for partial file reading
  const sampleBuffer = new Uint8Array(sampleSize)
  const fd = await fs.promises.open(filePath, 'r')
  await fd.read(sampleBuffer, 0, sampleSize, 0)
  await fd.close()

  // Detect encoding from sample
  const detectedEncoding = chardet.detect(sampleBuffer)
  const encoding = detectedEncoding || 'utf8'

  log.debug(`Detected encoding for ${filePath}: ${encoding}`)

  // Read full file as buffer and convert with detected encoding
  const fileBuffer = await fs.readFile(filePath)
  const data = iconv.decode(fileBuffer, encoding)
  return data
}

export async function parseEpub(filePath: string): Promise<string> {
  const epub = new Epub(filePath)
  try {
    await epub.parse()
  } catch (error) {
    log.error('EPUB parsing error:', error)
    throw error
  }

  const metadata = epub.metadata as { title?: string; creator?: string; language?: string }
  log.info('EPUB metadata:', {
    title: metadata.title,
    creator: metadata.creator,
    language: metadata.language,
    chapters: epub.flow.length,
  })

  const processChapter = async (chapter: { id: string }): Promise<string | null> => {
    try {
      const chapterText = await epub.getChapter(chapter.id)
      let plainText = chapterText.replace(/<[^>]*>/g, '')
      plainText = decodeHtmlEntities(plainText).replace(/\s+/g, ' ').trim()
      return plainText || null
    } catch (chapterError) {
      log.warn(`Failed to read chapter ${chapter.id}, skipping:`, chapterError)
      return null
    }
  }

  log.info(`Starting concurrent processing of ${epub.flow.length} chapters with concurrency: 8`)
  const chapterResults = await concurrentMap(epub.flow as { id: string }[], processChapter, 8)
  const chapterTexts = chapterResults.filter((text: string | null) => text !== null) as string[]
  log.info(`Successfully processed ${chapterTexts.length}/${epub.flow.length} chapters`)

  const fullText = chapterTexts.join('\n\n')
  if (!fullText) {
    throw new Error('No readable text content found in EPUB file')
  }
  log.info(`Successfully extracted ${fullText.length} characters from ${chapterTexts.length} chapters`)
  return fullText
}
