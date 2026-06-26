import { describe, it, expect } from 'vitest'
import { formatDuration, formatDate, formatVoteAverage, formatFileSize, truncateText } from '@/lib/format'

describe('formatDuration', () => {
  it('formats minutes only', () => {
    expect(formatDuration(30)).toBe('30m')
  })

  it('formats hours and minutes', () => {
    expect(formatDuration(90)).toBe('1h 30m')
  })

  it('formats exact hours', () => {
    expect(formatDuration(120)).toBe('2h 0m')
  })

  it('handles zero', () => {
    expect(formatDuration(0)).toBe('0m')
  })

  it('handles large values', () => {
    expect(formatDuration(1500)).toBe('25h 0m')
  })
})

describe('formatDate', () => {
  it('formats date in Arabic locale', () => {
    const result = formatDate('2024-01-15', 'ar-EG')
    expect(result).toBeTruthy()
    expect(result.length).toBeGreaterThan(0)
  })

  it('formats date in English locale', () => {
    const result = formatDate('2024-01-15', 'en-US')
    expect(result).toContain('January')
    expect(result).toContain('15')
    expect(result).toContain('2024')
  })
})

describe('formatVoteAverage', () => {
  it('formats with one decimal', () => {
    expect(formatVoteAverage(7.567)).toBe('7.6')
  })

  it('formats integer', () => {
    expect(formatVoteAverage(8)).toBe('8.0')
  })

  it('formats zero', () => {
    expect(formatVoteAverage(0)).toBe('0.0')
  })
})

describe('formatFileSize', () => {
  it('formats bytes', () => {
    expect(formatFileSize(0)).toBe('0 B')
  })

  it('formats kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1 KB')
  })

  it('formats megabytes', () => {
    expect(formatFileSize(1048576)).toBe('1 MB')
  })

  it('formats gigabytes', () => {
    expect(formatFileSize(1073741824)).toBe('1 GB')
  })

  it('formats with decimals', () => {
    expect(formatFileSize(1536)).toBe('1.5 KB')
  })
})

describe('truncateText', () => {
  it('returns original text if shorter than max', () => {
    expect(truncateText('hello', 10)).toBe('hello')
  })

  it('truncates long text', () => {
    expect(truncateText('hello world', 5)).toBe('hello...')
  })

  it('returns original if exactly max length', () => {
    expect(truncateText('hello', 5)).toBe('hello')
  })
})
