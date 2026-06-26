import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/node'
import { apiRequest } from '@/lib/api'

describe('Stream API', () => {
  it('fetches movie stream URL', async () => {
    const result = await apiRequest<{
      url: string
      fallback_used: boolean
      expires_at: string
    }>('/api/v1/stream/movie/550988')

    expect(result.url).toContain('.m3u8')
    expect(result.fallback_used).toBe(false)
    expect(result.expires_at).toBeDefined()
  })

  it('fetches episode stream URL with params', async () => {
    const result = await apiRequest<{
      url: string
      fallback_used: boolean
      expires_at: string
    }>('/api/v1/stream/episode/101?season=1&episode=1')

    expect(result.url).toContain('.m3u8')
    expect(result.fallback_used).toBe(false)
  })

  it('reports progress', async () => {
    const result = await apiRequest<{ ok: boolean }>('/api/v1/stream/progress', {
      method: 'POST',
      body: JSON.stringify({
        content_type: 'movie',
        content_id: 550988,
        position: 120,
        duration: 7200,
        completed: false,
      }),
    })

    expect(result.ok).toBe(true)
  })

  it('fetches movie credits', async () => {
    const result = await apiRequest<{
      cast: Array<{ id: number; name: string; character: string }>
      crew: Array<{ id: number; name: string; job: string }>
    }>('/api/v1/movies/550988/credits')

    expect(result.cast.length).toBeGreaterThan(0)
    expect(result.cast[0]?.name).toBeDefined()
    expect(result.crew.length).toBeGreaterThan(0)
  })

  it('fetches similar movies', async () => {
    const result = await apiRequest<{
      items: Array<{ tmdb_id: number; title: string }>
      total: number
    }>('/api/v1/movies/550988/similar')

    expect(result.items.length).toBeGreaterThan(0)
    expect(result.items.every((m) => m.tmdb_id !== 550988)).toBe(true)
  })

  it('fetches series detail', async () => {
    const result = await apiRequest<{
      data: { tmdb_id: number; name: string; seasons: Array<{ season_number: number }> }
    }>('/api/v1/series/1396')

    expect(result.data.tmdb_id).toBe(1396)
    expect(result.data.seasons.length).toBeGreaterThan(0)
  })

  it('fetches season detail', async () => {
    const result = await apiRequest<{
      data: { season_number: number; episodes: Array<{ episode_number: number }> }
    }>('/api/v1/series/1396/season/1')

    expect(result.data.season_number).toBe(1)
    expect(result.data.episodes.length).toBeGreaterThan(0)
  })

  it('returns 404 for non-existent movie credits', async () => {
    server.use(
      http.get('/api/v1/movies/:id/credits', () => {
        return HttpResponse.json(
          { ok: false, error: { code: 'NOT_FOUND', message: 'Movie not found' } },
          { status: 404 },
        )
      }),
    )

    await expect(
      apiRequest('/api/v1/movies/99999/credits'),
    ).rejects.toThrow()
  })
})
