/**
 * Music system types for Ninja Keyboard.
 *
 * Covers the full 44-track Suno-generated soundtrack.
 * The runtime source of truth is:
 *   public/audio/music/music-manifest.json
 *
 * Categories:
 *   menu       - 6 tracks  (home screen, lessons, battle lobby, games hub, profile, settings)
 *   gameplay   - 5 tracks  (practice easy/medium/hard, speed test, accuracy challenge)
 *   battle     - 10 tracks (pre-battle, rivals, bosses, tournament)
 *   events     - 8 tracks  (stingers / jingles: victory, level-up, unlock, streak, etc.)
 *   characters - 8 tracks  (Ki, Mika, Sensei Zen, Bug, Yuki, Luna, Rex, Glitch)
 *   story      - 2 tracks  (emotional moment, victory celebration)
 *   worlds     - 5 tracks  (Shatil, Nevet, Geza, Anaf, Tzameret)
 */

// ---------------------------------------------------------------------------
// Category
// ---------------------------------------------------------------------------

export type MusicCategory =
  | 'menu'
  | 'gameplay'
  | 'battle'
  | 'events'
  | 'characters'
  | 'story'
  | 'worlds'

// ---------------------------------------------------------------------------
// Track IDs (catalog)
// ---------------------------------------------------------------------------

export type MenuTrackId =
  | 'MENU-001'
  | 'MENU-002'
  | 'MENU-003'
  | 'MENU-004'
  | 'MENU-005'
  | 'MENU-006'

export type GameplayTrackId =
  | 'PLAY-001'
  | 'PLAY-002'
  | 'PLAY-003'
  | 'PLAY-004'
  | 'PLAY-005'

export type BattleTrackId =
  | 'BATTLE-001'
  | 'BATTLE-002'
  | 'BATTLE-003'
  | 'BATTLE-004'
  | 'BATTLE-005'
  | 'BATTLE-006'
  | 'BATTLE-007'
  | 'BATTLE-008'
  | 'BATTLE-009'
  | 'BATTLE-010'

export type EventTrackId =
  | 'EVENT-001'
  | 'EVENT-002'
  | 'EVENT-003'
  | 'EVENT-004'
  | 'EVENT-005'
  | 'EVENT-006'
  | 'EVENT-007'
  | 'EVENT-008'

export type CharacterTrackId =
  | 'CHAR-001'
  | 'CHAR-002'
  | 'CHAR-003'
  | 'CHAR-004'
  | 'CHAR-005'
  | 'CHAR-006'
  | 'CHAR-007'
  | 'CHAR-008'

export type StoryTrackId = 'STORY-001' | 'STORY-002'

export type WorldTrackId =
  | 'WORLD-001'
  | 'WORLD-002'
  | 'WORLD-003'
  | 'WORLD-004'
  | 'WORLD-005'

export type MusicTrackId =
  | MenuTrackId
  | GameplayTrackId
  | BattleTrackId
  | EventTrackId
  | CharacterTrackId
  | StoryTrackId
  | WorldTrackId

// ---------------------------------------------------------------------------
// Source tagging
// ---------------------------------------------------------------------------

/** How the MP3 was generated. */
export type MusicFileSource = 'api' | 'browser-extension'

// ---------------------------------------------------------------------------
// Manifest track entry
// ---------------------------------------------------------------------------

/**
 * One entry in the `generated_tracks` array of music-manifest.json.
 *
 * Each entry maps to a single logical track and lists ALL known variant files
 * (v1, v2, v3, v4, sometimes v5). The first file in the array is the primary
 * version used for gameplay; later variants are alternates for the jukebox.
 */
export interface MusicManifestTrack {
  /** Catalog ID, e.g. "PLAY-001" */
  trackId: MusicTrackId | string
  /** Slug-style name, e.g. "practice-easy" */
  name: string
  /** English display title */
  title: string
  /** Hebrew display title */
  titleHe: string
  /** Short English description (style label included) */
  description: string
  /** Music style label, e.g. "Lo-fi Hip Hop" */
  style: string
  /** Content category */
  category: MusicCategory
  /**
   * Relative paths from `public/audio/music/`.
   * Example: ["gameplay/practice-easy.mp3", "gameplay/practice-easy-v2.mp3", ...]
   */
  files: string[]
  /**
   * Duration in seconds for each file in `files` (same index).
   * null means duration is not yet measured (browser-extension downloads).
   */
  durations: (number | null)[]
  /**
   * Generation source for each file in `files` (same index).
   * "api" = generated via Suno API automation.
   * "browser-extension" = downloaded manually via Suno web + browser extension.
   */
  source?: MusicFileSource[]
  /** Suno song IDs for the API-generated variants (in generation order). */
  sunoSongIds?: string[]
  /** ISO timestamp of API batch generation. Only present for API-generated tracks. */
  generatedAt?: string
  /** Cover image filename (root music dir only, for main-theme / boss-battle). */
  cover?: string
  /** Readiness status of this track. */
  status: 'ready' | 'pending' | 'rejected'
}

// ---------------------------------------------------------------------------
// Quality-rejected entry
// ---------------------------------------------------------------------------

export interface MusicQualityRejected {
  trackId: MusicTrackId | string
  file: string
  issues: string[]
  rejectedAt: string
}

// ---------------------------------------------------------------------------
// Manifest metadata
// ---------------------------------------------------------------------------

export interface MusicManifestMetadata {
  updatedAt: string
  totalTracks: number
  totalMp3Files: number
  categoryCounts: Record<MusicCategory, number>
  variantCounts: {
    v1_v2_only: number
    v1_to_v4: number
    v1_to_v5: number
  }
  sourceBreakdown: {
    api_generated: number
    browser_extension: number
  }
}

// ---------------------------------------------------------------------------
// Full manifest shape (public/audio/music/music-manifest.json)
// ---------------------------------------------------------------------------

export interface MusicManifest {
  generated_tracks: MusicManifestTrack[]
  pending_tracks: MusicManifestTrack[]
  not_generated: { name: string; reason: string; prompt: string }[]
  quality_rejected: MusicQualityRejected[]
  metadata: MusicManifestMetadata
}

// ---------------------------------------------------------------------------
// Runtime track descriptor (used by MusicManager / stores)
// ---------------------------------------------------------------------------

/**
 * Lightweight runtime descriptor for a single playable track variant.
 * Derived from MusicManifestTrack by selecting a specific file index.
 */
export interface MusicTrackVariant {
  /** Parent catalog ID */
  trackId: MusicTrackId | string
  /** Variant index within the parent track's files array (0 = primary) */
  variantIndex: number
  /** Hebrew display name */
  titleHe: string
  /** English display title */
  title: string
  /** Content category */
  category: MusicCategory
  /** Absolute public path, e.g. "/audio/music/gameplay/practice-easy-v3.mp3" */
  publicPath: string
  /** Duration hint in seconds, or null if unknown */
  duration: number | null
  /** How this file was generated */
  source: MusicFileSource
  /** Whether this is the primary (recommended) variant */
  isPrimary: boolean
}

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/**
 * Convert a manifest-relative file path to an absolute public URL path.
 * Input:  "gameplay/practice-easy-v3.mp3"
 * Output: "/audio/music/gameplay/practice-easy-v3.mp3"
 */
export function manifestFileToPublicPath(file: string): string {
  return `/audio/music/${file}`
}

/**
 * Get all playable variants for a track entry.
 */
export function getTrackVariants(track: MusicManifestTrack): MusicTrackVariant[] {
  return track.files.map((file, idx) => ({
    trackId: track.trackId,
    variantIndex: idx,
    titleHe: track.titleHe,
    title: track.title,
    category: track.category,
    publicPath: manifestFileToPublicPath(file),
    duration: track.durations[idx] ?? null,
    source: track.source?.[idx] ?? 'api',
    isPrimary: idx === 0,
  }))
}

/**
 * Get the primary (v1) variant for a track entry.
 */
export function getPrimaryVariant(track: MusicManifestTrack): MusicTrackVariant {
  return getTrackVariants(track)[0]
}

/**
 * Get all tracks for a specific category from the manifest.
 */
export function getTracksByCategory(
  manifest: MusicManifest,
  category: MusicCategory,
): MusicManifestTrack[] {
  return manifest.generated_tracks.filter(t => t.category === category)
}

/**
 * Find a track by its catalog ID.
 */
export function getTrackById(
  manifest: MusicManifest,
  trackId: MusicTrackId | string,
): MusicManifestTrack | undefined {
  return manifest.generated_tracks.find(t => t.trackId === trackId)
}

/**
 * Count how many v3/v4+ variants are present for a track.
 * Files at index 2+ (0-based) are considered "extra" variants.
 */
export function countExtraVariants(track: MusicManifestTrack): number {
  return Math.max(0, track.files.length - 2)
}

/**
 * Check whether a track has any browser-extension-sourced files.
 */
export function hasBrowserExtensionVariants(track: MusicManifestTrack): boolean {
  return track.source?.some(s => s === 'browser-extension') ?? false
}
