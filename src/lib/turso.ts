const TURSO_URL = import.meta.env.VITE_TURSO_URL ?? ''
const TURSO_TOKEN = import.meta.env.VITE_TURSO_TOKEN ?? ''

export interface ManifestData {
  base_url: string
  title: string
  duration: number
  quality?: string
  segments: Array<{ id: string; name: string; duration: number }>
  _key_hex: string
  _iv_hex: string
}

interface TursoRow {
  manifest_data: string
  encryption_key_hex: string
  encryption_iv_hex: string
}

interface StatementSpec {
  q: string
  params?: Record<string, unknown>
}

export async function tursoQuery<T = Record<string, unknown>>(
  sql: string,
  params?: Record<string, unknown>,
): Promise<T[] | null> {
  if (!TURSO_URL || !TURSO_TOKEN) {
    console.warn('Turso not configured (set VITE_TURSO_URL, VITE_TURSO_TOKEN)')
    return null
  }
  try {
    const body: { statements: StatementSpec[] } = {
      statements: [{ q: sql }],
    }
    if (params && body.statements[0]) {
      body.statements[0].params = params
    }
    const r = await fetch(TURSO_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TURSO_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    if (!r.ok) throw new Error(`Turso HTTP ${r.status}`)
    const data = (await r.json()) as Array<{
      results: { columns: string[]; rows: unknown[][] }
    }>
    const results = data[0]?.results
    if (!results?.rows?.length) return []
    const cols = results.columns
    return results.rows.map((row) => {
      const obj: Record<string, unknown> = {}
      cols.forEach((c, i) => {
        obj[c] = row[i]
      })
      return obj as T
    })
  } catch (e) {
    console.error('Turso query failed:', e)
    return null
  }
}

export async function fetchManifest(videoId: string): Promise<ManifestData | null> {
  const rows = await tursoQuery<TursoRow>(
    `SELECT manifest_data, encryption_key_hex, encryption_iv_hex
     FROM archives
     WHERE random_name = ? AND status = 'active'`,
    { '1': videoId },
  )
  if (!rows || rows.length === 0) return null
  const row = rows[0]
  if (!row) return null
  try {
    const manifest = JSON.parse(row.manifest_data) as ManifestData
    manifest._key_hex = row.encryption_key_hex
    manifest._iv_hex = row.encryption_iv_hex
    return manifest
  } catch {
    return null
  }
}

export interface ArchivedMovie {
  random_name: string
  tmdb_id: number
  media_type: string
  title: string
  original_filename: string
  uploaded_at: string
}

export async function fetchArchivedMovies(): Promise<ArchivedMovie[]> {
  const rows = await tursoQuery<{
    random_name: string
    tmdb_id: number
    media_type: string
    manifest_data: string | null
    original_filename: string
    uploaded_at: string
  }>(
    `SELECT random_name, tmdb_id, media_type, manifest_data, original_filename, uploaded_at
     FROM archives
     WHERE status = 'active'
     ORDER BY uploaded_at DESC`,
  )
  if (!rows) return []
  return rows.map((row) => {
    let title = row.original_filename ?? ''
    try {
      if (row.manifest_data) {
        const m = JSON.parse(row.manifest_data) as { title?: string }
        if (m.title) title = m.title
      }
    } catch {}
    return {
      random_name: row.random_name,
      tmdb_id: row.tmdb_id,
      media_type: row.media_type,
      title,
      original_filename: row.original_filename ?? '',
      uploaded_at: row.uploaded_at ?? '',
    }
  })
}

export async function findVideoId(
  tmdbId: number,
  type: 'movie' | 'episode',
  season?: number,
  episode?: number,
): Promise<string | null> {
  let sql: string
  let params: Record<string, unknown>

  if (type === 'episode' && season !== undefined && episode !== undefined) {
    sql = `SELECT random_name FROM archives
           WHERE tmdb_id = ? AND season_number = ? AND episode_number = ?
           AND media_type = 'series' AND status = 'active'
           ORDER BY uploaded_at DESC LIMIT 1`
    params = { '1': tmdbId, '2': season, '3': episode }
  } else {
    sql = `SELECT random_name FROM archives
           WHERE tmdb_id = ? AND media_type = 'movie' AND status = 'active'
           ORDER BY uploaded_at DESC LIMIT 1`
    params = { '1': tmdbId }
  }

  const rows = await tursoQuery<{ random_name: string }>(sql, params)
  return (rows && rows.length > 0 && rows[0]) ? rows[0].random_name : null
}
