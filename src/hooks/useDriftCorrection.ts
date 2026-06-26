export interface SyncPayload {
  is_playing: boolean
  position: number
  timestamp: number
  playback_rate: number
}

export interface DriftCorrectionResult {
  should_correct: boolean
  current_position: number
  expected_position: number
  drift: number
  correction: number
}

export function calculateDriftCorrection(
  sync: SyncPayload,
  receivedAt: number,
  localPosition: number,
  lastLatency: number,
): DriftCorrectionResult {
  const oneWayLatency = lastLatency / 1000

  const elapsedSinceSync = receivedAt - sync.timestamp
  const leaderCurrentPosition = sync.position + elapsedSinceSync * sync.playback_rate

  const expectedPosition = sync.is_playing
    ? leaderCurrentPosition - oneWayLatency * sync.playback_rate
    : sync.position

  const drift = localPosition - expectedPosition
  const threshold = 0.5

  if (Math.abs(drift) <= threshold) {
    return {
      should_correct: false,
      current_position: localPosition,
      expected_position: expectedPosition,
      drift,
      correction: localPosition,
    }
  }

  const correction = localPosition - drift * 0.8

  return {
    should_correct: true,
    current_position: localPosition,
    expected_position: expectedPosition,
    drift,
    correction,
  }
}

export function measureLatency(
  clientTimestamp: number,
  serverPongTimestamp: number,
): number {
  const rtt = serverPongTimestamp - clientTimestamp
  return Math.max(0, rtt)
}
