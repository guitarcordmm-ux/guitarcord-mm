# GuitarCord MM — SEO Optimization TODO

> Research date: 2026-09-17
> Repository: `guitarcordmm-ux/guitarcord-mm`
> Branch audited: `main`
> Scope: SEO/content strategy only. This document is the only file created by this SEO deliverable.

## Context

- [ ] **SEO-CONTEXT-1.1 [Target Keyword]**:
  - **Primary keyword:** `Myanmar guitar chords`
  - **Core variants:** `Myanmar song chords`, `Myanmar guitar chords and lyrics`, `Burmese guitar chords`, `Myanmar songs chords`, `မြန်မာ သီချင်း ဂစ်တာ chord`, `မြန်မာသီချင်း chord`, `သီချင်းစာသား chord`.
  - **Primary search intent:** informational + utility/navigational. The user usually wants to find a specific Myanmar song, read its lyrics/chords, and play it on guitar.
  - **Funnel:** TOFU for broad “Myanmar guitar chords”; MOFU for song/artist/key searches; BOFU is low priority because the product is primarily a free utility rather than an e-commerce transaction.

- [ ] **SEO-CONTEXT-1.2 [Audience]**:
  - **Persona A — Beginner guitarist:** wants readable chords, chord diagrams, and lyrics without horizontal scrolling.
  - **Persona B — Practicing guitarist/singer:** wants song-specific chords, transpose/key changes, and auto-scroll.
  - **Persona C — Myanmar music searcher:** knows a song title/artist and wants a fast song page.
  - **Persona D — Contributor:** wants to create/submit chord sheets and improve the catalogue.
  - Main decision criteria: song availability, accurate chords, readable mobile layout, transpose/key controls, search speed, and trustworthy attribution.

- [ ] **SEO-CONTEXT-1.3 [Content Type / Target Length]**:
  - Homepage: 500–800 words of useful, non-repetitive supporting copy plus song discovery UI.
  - Song/chord detail pages: 250–500 words of unique metadata/supporting content around the interactive chord sheet; do **not** add filler merely to hit a word count.
  - Chord library: 500–900 words explaining chord families, use cases, and links to song examples.
  - Educational guides: 900–1,500 words when the topic genuinely requires depth.

## 1. Project Context and File Analysis

- [ ] **SEO-AUDIT-1.1 [Current SEO Baseline]**:
  - `index.html` currently uses the legacy product name `ChordStream Pro` in the title/description while the visible app and route metadata use `GuitarCord`; this creates brand inconsistency. fileciteturn43file0L2-L2
  - The root HTML currently has one generic title and description, Open Graph title/description, but no canonical, Twitter/X card, OG image, robots meta, JSON-LD, or language alternates. fileciteturn61file0L2-L2
  - `App.tsx` has `react-helmet-async`, but the only global Helmet currently sets `GuitarCord — Chords · Lyrics · Play` and theme color. Individual song routes do not receive song-specific SEO metadata. fileciteturn44file0L2-L2
  - The app is a React/Vite SPA with client-side routing. Public routes include `/songs`, `/library`, `/chords`, and `/chord/:chordId`. fileciteturn44file0L2-L2
  - Public song data is fetched client-side through `/api/songs`; the endpoint exposes approved song fields including title, artist, lyrics, tags, created/updated dates, etc. fileciteturn59file0L2-L2
  - The `Song` model already contains SEO-useful fields: `songTitle`, `artist`, `composer`, `album`, `genre`, `imageURL`, `tutorialURL`, `lyrics`, `tags`, `createdAt`, and `updatedAt`. fileciteturn53file0L2-L2

- [ ] **SEO-AUDIT-1.2 [Sitemap / Crawlability]**:
  - `robots.txt` allows all crawlers and points to `https://guitarcordmm.com/sitemap.xml`, which is structurally correct. fileciteturn47file0L2-L2
  - `public/sitemap.xml` currently contains only `/` and `/songs`, both with an old `2026-04-28` lastmod. It does not include `/chords` or individual `/chord/:chordId` URLs. fileciteturn46file0L2-L2
  - This is the largest discoverability gap because song-specific pages are the natural long-tail landing pages.

- [ ] **SEO-AUDIT-1.3 [Indexation Architecture]**:
  - The route `/chord/:chordId` is client-rendered and the generic App-level Helmet does not set a unique title/description for each song. fileciteturn44file0L2-L2
  - Prioritize crawlable, indexable song URLs with unique metadata and server/pre-rendered HTML if practical. Do not rely solely on client-side metadata for the most valuable long-tail pages.
  - Avoid indexing private/admin/auth routes: `/admin`, `/admin-panel`, `/admin-import`, `/dashboard`, `/login`, `/create`, and user-specific/private content.

- [ ] **SEO-AUDIT-1.4 [Keyword Usage / Content Gaps]**:
  - Existing public copy contains broad terms such as chords, lyrics, guitar, song library, and search, but the repository's visible copy does not consistently target the high-value Myanmar-specific phrase family. fileciteturn45file0L2-L2
  - The onboarding page claims “Thousands of Songs” even though the currently inspected repository does not expose evidence for that exact catalogue size. Replace unverifiable scale claims with a dynamic count or neutral wording. fileciteturn54file0L2-L2
  - Content gaps: Myanmar-specific landing copy, artist/topic pages, key-filter pages, chord-learning guides, song-specific metadata, FAQ content, and unique explanatory copy around the interactive chord sheet.

- [ ] **SEO-AUDIT-1.5 [Cannibalization]**:
  - Current route duplication risk exists between `/app` and `/songs`, because both render the same home component. fileciteturn44file0L2-L2
  - Decide on one canonical discovery URL. Recommended canonical information architecture: `/songs` for the public song index and `/` as the branded homepage; either redirect `/app` to `/songs` for logged-out/public SEO or mark `/app` canonical appropriately.
  - Avoid creating multiple pages targeting exactly `Myanmar guitar chords` without a distinct intent.

- [ ] **SEO-AUDIT-1.6 [Technical Consistency]**:
  - `README.md` still describes an older Firebase/Firestore architecture and `ChordStream Pro`, while the active application uses Supabase and GuitarCord naming. Update documentation as a trust/maintenance task, but do not expose private admin information in public documentation. fileciteturn51file0L2-L2
  - `metadata.json` also still uses `ChordStream Pro`. fileciteturn50file0L2-L2

## 2. Search Intent and Audience Analysis

- [ ] **SEO-INTENT-2.1 [Broad Query]**:
  - Query cluster: `Myanmar guitar chords`, `Myanmar song chords`, `Burmese guitar chords`.
  - Intent: informational/utility.
  - Funnel: TOFU → MOFU.
  - Best format: searchable song directory + short explanatory intro + chord library links + popular/latest songs.

- [ ] **SEO-INTENT-2.2 [Song Query]**:
  - Query pattern: `[song title] chords`, `[song title] guitar chords`, `[song title] lyrics chords`, `[song title] key`, `[artist] chords`.
  - Intent: navigational + informational/utility.
  - Funnel: MOFU/decision-to-use.
  - Best format: dedicated song page with title, artist, key, chord sheet, transpose, mobile reading, related songs, artist link, and concise FAQ.

- [ ] **SEO-INTENT-2.3 [Learning Query]**:
  - Query cluster: `Myanmar guitar chords for beginners`, `how to play Myanmar songs on guitar`, `easy Myanmar guitar songs`, `basic guitar chords Myanmar songs`.
  - Intent: informational.
  - Funnel: TOFU.
  - Best format: guide/tutorial with chord examples, song examples, and links into the library.

- [ ] **SEO-INTENT-2.4 [Chord Query]**:
  - Query cluster: `C guitar chord`, `G guitar chord`, `Am guitar chord`, `Myanmar guitar chord library`, `guitar chord diagrams`.
  - Intent: informational/utility.
  - Funnel: TOFU/MOFU.
  - Best format: chord library pages with diagrams and links to songs that use each chord.

## 3. Keyword Research and Semantic Clustering

- [ ] **SEO-PLAN-3.1 [Core Keyword Cluster]**:
  - **Primary:** `Myanmar guitar chords`.
  - **Secondary:** `Myanmar song chords`, `Myanmar guitar chords and lyrics`, `Burmese guitar chords`, `Myanmar songs chords`, `guitar chords Myanmar songs`, `Myanmar chord library`.
  - **Long-tail:** `[song] guitar chords`, `[song] chords and lyrics`, `[song] guitar chords Myanmar`, `[artist] guitar chords`, `[song] key chords`, `[song] transpose chords`.
  - **Semantic/LSI:** guitar chord, chord chart, chord sheet, lyrics, song lyrics, transpose, key, guitar tuner, chord diagrams, finger positions, auto-scroll, beginner guitar, Burmese songs, Myanmar music, artist, album, genre.

- [ ] **SEO-PLAN-3.2 [Myanmar-Language Cluster]**:
  - **Primary Burmese variants:** `မြန်မာ သီချင်း ဂစ်တာ chord`, `မြန်မာသီချင်း chord`, `သီချင်းစာသား chord`, `ဂစ်တာ chord`, `ဂစ်တာသီချင်း`, `သီချင်း chord ပြောင်း`, `ဂစ်တာ chord စာကြည့်တိုက်`.
  - Use natural Burmese phrasing in page copy and headings; keep common English music terms such as `Chord`, `Key`, and `Transpose` where that matches user behavior.

- [ ] **SEO-PLAN-3.3 [Intent/Funnel Map]**:
  | Cluster | Intent | Funnel | Target page |
  |---|---|---|---|
  | Myanmar guitar chords | Informational/utility | TOFU | `/songs` |
  | Myanmar song chords | Informational/utility | TOFU/MOFU | `/songs` |
  | [song] guitar chords | Navigational/utility | MOFU | `/chord/:chordId` |
  | [artist] guitar chords | Navigational/utility | MOFU | `/artists/:artistSlug` (proposed) |
  | guitar chord library | Informational/utility | TOFU | `/chords` |
  | easy Myanmar guitar songs | Informational | TOFU | guide + curated collection |
  | [song] key / transpose | Utility | MOFU | song page |

- [ ] **SEO-PLAN-3.4 [Volume / Competition Assessment]**:
  - Exact monthly search volume and keyword difficulty were **not directly available from the available research tools**, so no numeric volume/KD values are invented here.
  - Qualitative assessment: broad `Myanmar guitar chords` is likely more competitive than song-title long tails; song-title + artist + chords queries should be treated as the scalable long-tail acquisition layer.
  - Use Google Search Console query data after launch to replace assumptions with first-party query/CTR evidence.

- [ ] **SEO-PLAN-3.5 [PAA / Related Question Set]**:
  - Validate these question variants in Google Search Console/Keyword Planner and use the ones that actually appear for the site:
    1. `How do I find Myanmar guitar chords?`
    2. `How do I change the key of a guitar chord song?`
    3. `What are the easiest Myanmar songs to play on guitar?`
    4. `Where can I find Myanmar song chords and lyrics?`
    5. `How do I read guitar chords above lyrics?`
    6. `How do I transpose a song to a different key?`
    7. `What guitar chords should a beginner learn first?`
    8. `Can I play Myanmar songs with basic guitar chords?`
  - Treat these as PAA-style content targets, not as verified current Google PAA results.

## 4. Competitor / SERP Audit

- [ ] **SEO-COMP-4.1 [SERP Landscape]**:
  - Current search results show several Myanmar-focused chord/lyrics products competing for the same user need: ChordMM, MusiBurma, Pro Chord, Thanzin, and GChord. citeturn0search0turn0search2turn0search7turn0search1turn0search8
  - The market emphasizes song libraries, clear chord/lyrics layouts, transpose, chord diagrams, search/filtering, and mobile usability. citeturn0search2turn0search3turn0search5

- [ ] **SEO-COMP-4.2 [Content Gap]**:
  - Competitor pages already cover broad catalogue discovery, artists/albums, trending/popular songs, transpose, chord diagrams, tuner, and playlists. citeturn0search0turn0search2turn0search3turn0search1
  - GuitarCord should differentiate through: excellent mobile chord/lyrics readability, fast song-specific pages, Myanmar-language SEO copy, transparent song metadata, fast cached public access, lightweight UX, and useful educational content that links directly to playable songs.

- [ ] **SEO-COMP-4.3 [SERP Content Structure]**:
  - Build song pages around the actual task: title → artist → key → readable chords/lyrics → transpose → related songs → artist → concise FAQ.
  - Add a short unique introduction for important songs instead of keyword-heavy paragraphs.
  - Add “Songs in this key”, “More songs by this artist”, and “Related chords” links where data supports them.

- [ ] **SEO-COMP-4.4 [Cannibalization Guard]**:
  - Do not create separate pages for every synonym such as `Myanmar guitar chords`, `Myanmar song chords`, and `Burmese guitar chords` unless each page has a clearly different search intent and substantial unique value.
  - Consolidate synonyms into the main `/songs` topic page and use song/artist/chord pages for long-tail coverage.

## 5. SEO Optimization Items

- [ ] **SEO-ITEM-5.1 [Title Tag]**:
  - **Element:** Homepage title.
  - **Current State:** `ChordStream Pro - Guitar Chords & Lyrics`. fileciteturn43file0L2-L2
  - **Recommended Change:** `Myanmar Guitar Chords & Lyrics | GuitarCord`
  - **Length:** 39 characters approximately; under 60.
  - **Rationale:** Uses the core search phrase and the actual brand while describing the product clearly.

- [ ] **SEO-ITEM-5.2 [Meta Description]**:
  - **Recommended:** `Find Myanmar guitar chords, song lyrics, chord diagrams, transpose tools and easy-to-read song sheets on GuitarCord.`
  - **Length:** approximately 122 characters; under 160.
  - **CTA:** `Find` is a soft utility CTA.

- [ ] **SEO-ITEM-5.3 [URL Slugs]**:
  - `/songs` → retain as the canonical public song directory.
  - `/chords` → retain as the canonical chord library.
  - `/chord/:chordId` → migrate toward human-readable `/song/:artistSlug/:songSlug` if IDs cannot remain descriptive; preserve old IDs with permanent redirects.
  - Proposed examples: `/song/htoo-eain-thin/a-htee-kyan` and `/artist/htoo-eain-thin`.

- [ ] **SEO-ITEM-5.4 [Heading Hierarchy]**:
  - Homepage `/`: one H1 such as `Myanmar Guitar Chords & Lyrics`.
  - `/songs`: one H1 `Myanmar Song Chords & Lyrics`; H2 sections `Popular Songs`, `Latest Songs`, `Artists`, `Browse by Key`.
  - `/chords`: one H1 `Guitar Chord Library`; H2 groups for Major, Minor, 7th, Suspended, etc.
  - Song page: one H1 `[Song Title] Chords & Lyrics`; H2 sections `Chords & Lyrics`, `Song Details`, `Related Songs`, `FAQ`.
  - Do not use headings only for visual styling; preserve semantic hierarchy.

- [ ] **SEO-ITEM-5.5 [Song Page Metadata]**:
  - Generate per-song title: `[Song Title] Guitar Chords & Lyrics | GuitarCord`.
  - Generate description from title + artist + key + utility features, e.g. `[Song Title] by [Artist] — guitar chords and lyrics with key/transpose controls on GuitarCord.`
  - Add canonical URL for the exact song page.
  - Add Open Graph and Twitter/X metadata with song image when available.

- [ ] **SEO-ITEM-5.6 [Image Alt Text]**:
  - Replace empty song image alt text with descriptive values such as `[Song Title] by [Artist]` when the image is meaningful. Current song rows use `alt=""`. fileciteturn45file0L2-L2
  - Decorative guitar/logo images should remain empty-alt if they are genuinely decorative.

- [ ] **SEO-ITEM-5.7 [Canonical / Robots]**:
  - Add `<link rel="canonical" href="...">` to every indexable page.
  - Keep private/auth/admin routes out of the sitemap and consider `noindex, nofollow` for those routes.
  - Keep `robots.txt` accessible as currently configured. fileciteturn47file0L2-L2

- [ ] **SEO-ITEM-5.8 [Sitemap]**:
  - Generate sitemap entries for all approved public song URLs plus `/`, `/songs`, and `/chords`.
  - Use actual `updatedAt` dates for song URLs rather than a fixed stale date.
  - Do not put private, pending, rejected, deleted, admin, or user dashboard URLs into the sitemap.
  - Current sitemap only has two URLs and uses `2026-04-28` for both, so it needs regeneration. fileciteturn46file0L2-L2

- [ ] **SEO-ITEM-5.9 [Structured Data]**:
  - Homepage: `WebSite` + `Organization`.
  - Song pages: `WebPage` + `BreadcrumbList`; optionally a factual `MusicComposition`/music-related entity representation only when the database has reliable composer/artist data.
  - Guides: `Article` or `HowTo` only when the page actually matches that content type.
  - FAQ sections: `FAQPage` only where visible Q&A content exists; do not add hidden FAQ text. Rich-result eligibility should be treated separately from valid structured data.
  - Validate JSON-LD using Google's Rich Results Test before deployment.

- [ ] **SEO-ITEM-5.10 [Internal Linking]**:
  - `/songs` → every important song page using anchor `[Song Title] guitar chords` or natural `[Song Title] chords`.
  - Song page → artist page using `[Artist] guitar chords`.
  - Song page → related songs using natural title anchors.
  - `/chords` → selected songs that use the chord.
  - Guides → relevant song pages and chord pages.
  - Homepage → `/songs`, `/chords`, and selected popular songs.
  - Avoid repeating exact-match anchor text mechanically; vary anchors naturally.

- [ ] **SEO-ITEM-5.11 [External Links]**:
  - Link to authoritative guitar-learning references only when they genuinely improve the user experience.
  - For artist/song attribution, link to official artist/label/channel sources when a verified official source is available.
  - Avoid linking to copyright-infringing lyric/music-download sources.

## 6. Proposed Content Architecture

- [ ] **SEO-CONTENT-6.1 [Pillar Page]**:
  - `/songs` — `Myanmar Guitar Chords & Lyrics`.
  - Intro: 100–150 words explaining the searchable library and core features.
  - Sections: popular songs, latest songs, artists, browse by key, beginner picks, FAQ.

- [ ] **SEO-CONTENT-6.2 [Song Pages]**:
  - `/song/[artist]/[song]` — `[Song] Guitar Chords & Lyrics`.
  - Include unique song metadata, key, readable chord sheet, transpose control, related songs, artist navigation, and FAQ.
  - Avoid duplicating the complete same boilerplate on every song page.

- [ ] **SEO-CONTENT-6.3 [Artist Cluster]**:
  - Proposed `/artists/[artistSlug]` pages with artist name, song list, key distribution, and links to songs.
  - Add only artists with enough public catalogue depth to provide real value.

- [ ] **SEO-CONTENT-6.4 [Educational Cluster]**:
  - `Myanmar Guitar Chords for Beginners`
  - `How to Read Guitar Chords Above Lyrics`
  - `How to Transpose Myanmar Songs to Any Key`
  - `Easy Myanmar Songs for Beginner Guitarists`
  - `Common Guitar Chords for Myanmar Songs`
  - Each guide must link to relevant live songs/chords and avoid generic filler.

## 7. Proposed Code Changes

### [ ] SEO-CODE-7.1 — `index.html` metadata baseline

```diff
-<html lang="en">
+<html lang="my">
@@
-<title>ChordStream Pro - Guitar Chords & Lyrics</title>
-<meta name="description" content="A minimalist, dark-themed professional guitar chord library featuring a premium interface, clean typography, and a professional Lyrics & Chord Creator tool." />
-<meta property="og:title" content="ChordStream Pro - Guitar Chords & Lyrics" />
-<meta property="og:description" content="A minimalist, dark-themed professional guitar chord library featuring a premium interface, clean typography, and a professional Lyrics & Chord Creator tool." />
+<title>Myanmar Guitar Chords & Lyrics | GuitarCord</title>
+<meta name="description" content="Find Myanmar guitar chords, song lyrics, chord diagrams, transpose tools and easy-to-read song sheets on GuitarCord." />
+<link rel="canonical" href="https://guitarcordmm.com/" />
+<meta property="og:type" content="website" />
+<meta property="og:site_name" content="GuitarCord" />
+<meta property="og:title" content="Myanmar Guitar Chords & Lyrics | GuitarCord" />
+<meta property="og:description" content="Find Myanmar guitar chords, song lyrics, chord diagrams, transpose tools and easy-to-read song sheets on GuitarCord." />
+<meta property="og:url" content="https://guitarcordmm.com/" />
+<meta name="twitter:card" content="summary_large_image" />
+<meta name="twitter:title" content="Myanmar Guitar Chords & Lyrics | GuitarCord" />
+<meta name="twitter:description" content="Find Myanmar guitar chords, song lyrics, chord diagrams, transpose tools and easy-to-read song sheets on GuitarCord." />
```

- [ ] **SEO-CODE-7.2 — Dynamic song SEO in `App.tsx`**:
  - Replace the single global title with route-specific Helmet metadata.
  - For `Player`, render title/description/canonical/OG/Twitter tags using `song.songTitle`, `song.artist`, `song.imageURL`, and route URL.
  - Add a `BreadcrumbList` JSON-LD object for `Home → Songs → Song`.

```tsx
<Helmet>
  <title>{song.songTitle} Guitar Chords & Lyrics | GuitarCord</title>
  <meta
    name="description"
    content={`${song.songTitle} by ${song.artist} — guitar chords and lyrics with key and transpose controls on GuitarCord.`}
  />
  <link rel="canonical" href={`https://guitarcordmm.com/song/${slug}`} />
  <meta property="og:type" content="music.song" />
  <meta property="og:title" content={`${song.songTitle} Guitar Chords & Lyrics | GuitarCord`} />
  <meta property="og:description" content={`${song.songTitle} by ${song.artist} — guitar chords and lyrics on GuitarCord.`} />
  <meta property="og:url" content={`https://guitarcordmm.com/song/${slug}`} />
  {song.imageURL && <meta property="og:image" content={song.imageURL} />}
  <meta name="twitter:card" content="summary_large_image" />
</Helmet>
```

- [ ] **SEO-CODE-7.3 — `src/components/GuitarCordPlayer.tsx` semantic structure**:
  - Change the song title from a generic `div` to a single H1.
  - Add a visible, concise song metadata block: artist, key, genre/album when available.
  - Add H2 sections for the chord sheet and related content.
  - Keep the interactive chord sheet readable and do not inject hidden keyword text.

```diff
-<div className="text-lg font-semibold">{song.songTitle}</div>
+<h1 className="text-lg font-semibold">{song.songTitle} Guitar Chords & Lyrics</h1>
 <div className="text-xs text-white/45">{song.artist}</div>
```

- [ ] **SEO-CODE-7.4 — `GuitarCordUI.tsx` image alt text**:

```diff
-<img src={song.imageURL} alt="" className="w-full h-full object-cover" />
+<img
+  src={song.imageURL}
+  alt={`${song.songTitle} by ${song.artist}`}
+  className="w-full h-full object-cover"
+  loading="lazy"
+  decoding="async"
+/>
```

- [ ] **SEO-CODE-7.5 — Public route architecture**:
  - Add human-readable song slugs derived from `artist + songTitle`.
  - Maintain the current `/chord/:chordId` route temporarily for backward compatibility.
  - Add permanent redirects once the new canonical URL is live.
  - Never expose database UUIDs as the only public SEO identifier.

- [ ] **SEO-CODE-7.6 — Sitemap generation**:
  - Add a build-time or server-side sitemap generator that queries only approved songs.
  - Include `lastmod` from `updatedAt`.
  - Emit `/`, `/songs`, `/chords`, artist pages, and all approved song pages.
  - Ensure sitemap generation does not expose private/user-only records.

- [ ] **SEO-CODE-7.7 — SPA indexability / pre-rendering**:
  - Prefer pre-rendered/static HTML for public song pages if Cloudflare deployment architecture permits it.
  - If full SSR is not introduced, generate public route HTML at build/deploy time from the approved song catalogue.
  - Acceptance test: request an individual song URL with JavaScript disabled and confirm that title, description, H1, artist, and meaningful song metadata remain available in initial HTML.

- [ ] **SEO-CODE-7.8 — Structured data helper**:
  - Create a reusable JSON-LD helper inside the application source (implementation may be in an existing SEO utility file or a new source file during execution).
  - Do not create files as part of this TODO deliverable; this section only specifies the implementation.

Example shape:

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "SONG TITLE Guitar Chords & Lyrics | GuitarCord",
  "url": "https://guitarcordmm.com/song/ARTIST/SONG",
  "isPartOf": {
    "@type": "WebSite",
    "name": "GuitarCord",
    "url": "https://guitarcordmm.com/"
  },
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      {"@type":"ListItem","position":1,"name":"Home","item":"https://guitarcordmm.com/"},
      {"@type":"ListItem","position":2,"name":"Songs","item":"https://guitarcordmm.com/songs"},
      {"@type":"ListItem","position":3,"name":"SONG TITLE"}
    ]
  }
}
```

## 8. Content Creation Requirements

- [ ] **SEO-CONTENT-8.1 [Homepage Copy]**:
  - H1: `Myanmar Guitar Chords & Lyrics`.
  - First 100 words must naturally include `Myanmar guitar chords` and explain what the user can do: search songs, read lyrics/chords, transpose, and practice.
  - Add links to `/songs` and `/chords`.

- [ ] **SEO-CONTENT-8.2 [Song Page Copy]**:
  - First 100 words should naturally contain the song title and artist plus `guitar chords` or `chords and lyrics`.
  - Do not repeat the exact keyword unnaturally.
  - Use song facts from the database only; do not invent release dates, composers, genres, or keys.

- [ ] **SEO-CONTENT-8.3 [FAQ]**:
  - Add visible FAQ to `/songs` and/or educational guides, and a small song-page FAQ only when useful.
  - Candidate questions: how transpose works, whether an account is needed to browse, how to read chord sheets, how to request/correct a song, and how to find songs by artist/key.
  - FAQ answers must be concise and factual.

## 9. Off-Page Authority Strategy

- [ ] **SEO-OFFPAGE-9.1 [Linkable Assets]**:
  - Build a free `Myanmar Guitar Chord Library` landing page.
  - Publish a data-backed annual/quarterly `Myanmar Guitar Song Trends` report using only first-party aggregate data.
  - Create a `Beginner Guitar Chord Cheat Sheet` as a genuinely useful downloadable/reference asset.
  - Create an interactive `Myanmar Song Key Finder` or `Chord Finder` that can earn natural citations.

- [ ] **SEO-OFFPAGE-9.2 [Outreach Targets]**:
  - Myanmar guitar teachers and music schools.
  - Myanmar music education blogs and community sites.
  - YouTube creators who publish Myanmar song/chord tutorials; one relevant search result is the Gita Wartana Shin channel, which publishes Myanmar song/chord-related videos. Outreach should be personalized and should request a useful reference rather than a paid/manipulative link. citeturn0youtube23
  - Relevant developer/music communities for the open-source/tooling side if a public technical asset is released.

- [ ] **SEO-OFFPAGE-9.3 [Digital PR Angles]**:
  - “Making Myanmar guitar chords easier to read on mobile.”
  - “Open catalogue of Myanmar songs, chords, and key changes.”
  - “Myanmar guitar chord trends by artist/key” based on first-party aggregate data.
  - “Free mobile-first chord practice tool for Myanmar songs.”

- [ ] **SEO-OFFPAGE-9.4 [Anchor Strategy]**:
  - 40–60% branded/navigational: `GuitarCord`, `GuitarCord MM`.
  - 20–30% natural topical: `Myanmar guitar chord library`, `Myanmar song chords`.
  - Remaining anchors: naked URL, song/artist names, generic `website`, `chord library`.
  - Do not request exact-match anchors at scale.

## 10. Analytics, KPIs, and Testing

- [ ] **SEO-KPI-10.1 [Search Console]**:
  - Track impressions, clicks, CTR, average position, indexed pages, and query growth.
  - Segment by: homepage, song pages, artist pages, chord pages, and guides.

- [ ] **SEO-KPI-10.2 [GA4 / Product Analytics]**:
  - Track `song_view`, `search`, `song_open`, `transpose_change`, `auto_scroll_start`, `favorite`, and outbound/CTA events where applicable.
  - Track mobile vs desktop separately.

- [ ] **SEO-KPI-10.3 [Technical SEO]**:
  - Monitor Core Web Vitals, especially LCP, INP, and CLS.
  - Measure initial HTML availability for song pages.
  - Monitor 404s, redirect chains, canonical conflicts, and sitemap errors.

- [ ] **SEO-KPI-10.4 [CTR Testing]**:
  - A/B test title/meta variants through controlled, time-bounded Search Console observations rather than changing many variables simultaneously.
  - Test variants emphasizing `Myanmar Guitar Chords`, `Chords & Lyrics`, and `Transpose`.

- [ ] **SEO-KPI-10.5 [Refresh Cadence]**:
  - Monthly: inspect Search Console queries and indexing issues.
  - Quarterly: refresh major guides and internal links using actual query data.
  - On song update: update sitemap `lastmod` and page metadata.
  - Annually: review the keyword cluster and competitor SERP landscape.

## 11. Commands

- [ ] **SEO-CMD-11.1 [Local Validation]**:

```bash
npm install
npm run lint
npm run build
npm run preview
```

- [ ] **SEO-CMD-11.2 [Production Crawl Checks]**:

```bash
curl -I https://guitarcordmm.com/
curl -I https://guitarcordmm.com/songs
curl -I https://guitarcordmm.com/chords
curl -I https://guitarcordmm.com/sitemap.xml
curl -I https://guitarcordmm.com/robots.txt
```

- [ ] **SEO-CMD-11.3 [HTML Metadata Checks]**:

```bash
curl -s https://guitarcordmm.com/ | grep -Ei '<title>|description|canonical|og:title|og:description|twitter:card'
curl -s https://guitarcordmm.com/sitemap.xml
```

- [ ] **SEO-CMD-11.4 [CI]**:
  - Run `npm run lint` and `npm run build` on every production deployment.
  - Add a CI check that fails if `index.html` loses a title or meta description.
  - Add a sitemap validation step that fails if a public approved song has no sitemap URL.

## 12. SEO Verification Checklist

- [ ] **SEO-VERIFY-12.1 [Keyword and Intent]**: Primary keyword appears naturally in title, H1, first 100 words, and meta description on the main `/songs` landing page.
- [ ] **SEO-VERIFY-12.2 [Keyword Distribution]**: Secondary/semantic terms appear naturally; no keyword stuffing.
- [ ] **SEO-VERIFY-12.3 [Search Intent]**: `/songs` satisfies broad discovery intent; song pages satisfy song-specific utility intent; guides satisfy learning intent.
- [ ] **SEO-VERIFY-12.4 [Title]**: All title tags are ≤60 characters where practical and unique.
- [ ] **SEO-VERIFY-12.5 [Meta Description]**: All indexable pages have unique descriptions ≤160 characters where practical.
- [ ] **SEO-VERIFY-12.6 [Canonical]**: Every indexable URL has one canonical URL and no conflicting duplicate canonicals.
- [ ] **SEO-VERIFY-12.7 [Headings]**: One H1 per indexable page with logical H2/H3 structure.
- [ ] **SEO-VERIFY-12.8 [Images]**: Meaningful images have descriptive alt text; decorative images remain empty-alt.
- [ ] **SEO-VERIFY-12.9 [Schema]**: JSON-LD validates with Google's Rich Results Test and matches visible content.
- [ ] **SEO-VERIFY-12.10 [Internal Links]**: No important public song page is orphaned; every song has links from `/songs` and related content where relevant.
- [ ] **SEO-VERIFY-12.11 [Sitemap]**: Sitemap includes all eligible public pages and excludes private/admin routes.
- [ ] **SEO-VERIFY-12.12 [Mobile UX]**: Song pages remain readable without horizontal scrolling and preserve fast interaction; the recent mobile lyrics wrapping work should be retained. fileciteturn64file0L2-L2
- [ ] **SEO-VERIFY-12.13 [No Cannibalization]**: `/`, `/songs`, `/chords`, artist pages, and song pages each target distinct intent.
- [ ] **SEO-VERIFY-12.14 [Content Quality]**: No generic filler; every guide contains concrete steps/examples and links to useful live resources.

## 13. Prioritized Execution Order

- [ ] **SEO-PRIORITY-13.1 [P0 — Indexable Song Pages]**: Unique song title/meta/canonical + human-readable URL + crawlable initial HTML.
- [ ] **SEO-PRIORITY-13.2 [P0 — Sitemap]**: Generate all approved song URLs and accurate `lastmod` values.
- [ ] **SEO-PRIORITY-13.3 [P0 — Brand/Metadata Cleanup]**: Replace `ChordStream Pro` metadata with GuitarCord and target `Myanmar guitar chords` naturally.
- [ ] **SEO-PRIORITY-13.4 [P0 — Internal Linking]**: Connect homepage → songs → artists/songs → related songs/chords.
- [ ] **SEO-PRIORITY-13.5 [P1 — Structured Data]**: WebSite/Organization/BreadcrumbList and appropriate page-level structured data.
- [ ] **SEO-PRIORITY-13.6 [P1 — Artist Pages]**: Add artist clusters only where catalogue depth supports useful pages.
- [ ] **SEO-PRIORITY-13.7 [P1 — Guides]**: Publish beginner and transpose guides with real song examples.
- [ ] **SEO-PRIORITY-13.8 [P2 — Authority]**: Launch linkable assets and personalized outreach.
- [ ] **SEO-PRIORITY-13.9 [P2 — Iteration]**: Use Search Console data to expand long-tail clusters and refresh metadata/content.

## 14. Quality Assurance Final Checklist

- [ ] **SEO-QA-14.1** All keyword research is clustered by intent and funnel stage.
- [ ] **SEO-QA-14.2** Title tags, meta descriptions, and URL slugs meet stated limits and include target terms naturally.
- [ ] **SEO-QA-14.3** Content outlines match the dominant intent for each page type.
- [ ] **SEO-QA-14.4** Schema types are appropriate to visible content and validated before release.
- [ ] **SEO-QA-14.5** Internal/external links have documented, natural anchor text.
- [ ] **SEO-QA-14.6** Content is unique, authoritative, practical, and free of generic filler.
- [ ] **SEO-QA-14.7** Off-page strategy contains actionable outreach categories and linkable assets.
- [ ] **SEO-QA-14.8** No content cannibalization is introduced between homepage, song directory, artist pages, chord pages, and guides.

## Research Sources

- [ ] **SEO-SOURCE-15.1** Repository audit: `index.html`, `App.tsx`, `GuitarCordUI.tsx`, `GuitarCordPlayer.tsx`, `types.ts`, `sitemap.xml`, `robots.txt`, `package.json`, and related source files were inspected from the `main` branch. Key current-state evidence is cited inline above. fileciteturn43file0L2-L2 fileciteturn44file0L2-L2 fileciteturn46file0L2-L2
- [ ] **SEO-SOURCE-15.2** ChordMM competitor/result page: current Myanmar guitar chords and lyrics positioning. citeturn0search0
- [ ] **SEO-SOURCE-15.3** MusiBurma competitor/result pages: song, artist, album, key, trending/popular, and chord/lyrics positioning. citeturn0search2turn0search6
- [ ] **SEO-SOURCE-15.4** Pro Chord competitor/result page and App Store listing: Myanmar chords/tabs, tuner, transpose, chord diagrams, favorites, and song-request positioning. citeturn0search7turn0search5
- [ ] **SEO-SOURCE-15.5** Thanzin competitor/result page: mobile-first lyrics/chords, transpose, playlists, and contributor workflow. citeturn0search1
- [ ] **SEO-SOURCE-15.6** GChord current Google Play listing: large Myanmar song/chord catalogue, auto-scroll, transpose, tuner, and chord library positioning. citeturn0search8

---

## Implementation Note

- [ ] **SEO-FINAL-16.1 [Scope Control]**: This deliverable intentionally creates **only `TODO_seo-optimization.md`**. The code blocks above are proposed patches/specifications and are not applied as part of this SEO research task.
