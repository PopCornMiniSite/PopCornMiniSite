import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { server } from '@/mocks/node'
import { apiRequest, ApiRequestError } from '@/lib/api'

const mockFetch = vi.fn()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
globalThis.fetch = mockFetch as any

beforeEach(() => {
  server.close()
  mockFetch.mockReset()
})

afterEach(() => {
  server.listen({ onUnhandledRequest: 'bypass' })
})

describe('apiRequest', () => {
  it('sends request with correct headers', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: 'test' }),
    })

    await apiRequest('/test')

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    )
  })

  it('includes auth header when initDataRaw provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: 'test' }),
    })

    await apiRequest('/test', {}, 'my-init-data')

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'tma my-init-data',
        }),
      })
    )
  })

  it('throws ApiRequestError on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({
        ok: false,
        error: { code: 'NOT_FOUND', message: 'Resource not found' },
      }),
    })

    await expect(apiRequest('/not-found')).rejects.toThrow(ApiRequestError)
  })

  it('throws with correct error code', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({
        ok: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid auth' },
      }),
    })

    try {
      await apiRequest('/auth')
      expect.fail('Should have thrown')
    } catch (e) {
      expect(e).toBeInstanceOf(ApiRequestError)
      expect((e as ApiRequestError).code).toBe('UNAUTHORIZED')
      expect((e as ApiRequestError).status).toBe(401)
    }
  })

  it('returns parsed JSON on success', async () => {
    const mockData = { user: { id: 1 } }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    const result = await apiRequest('/user')
    expect(result).toEqual(mockData)
  })
})
