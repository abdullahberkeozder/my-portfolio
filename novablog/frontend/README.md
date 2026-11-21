# 🍎 NovaBlog Enterprise — Mac OS 9.2.2 Web Desktop & Next.js 16 Showcase

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0.0-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Mac OS 9](https://img.shields.io/badge/Apple_HIG-Mac_OS_9.2.2_Platinum-999999?style=flat-square&logo=apple)](https://en.wikipedia.org/wiki/Mac_OS_9)

A pixel-authentic, high-performance web engineering showcase combining the nostalgic craftsmanship of **Apple's Mac OS 9.2.2 Platinum Human Interface Guidelines** with the enterprise-grade architecture of a **Spring Boot 4 / Java 22 Loom** backend and **Next.js 16 Turbopack** frontend.

---

## 📸 Visual Showcase

### 1. Mac OS 9.2.2 Web Desktop
*Authentic 20px Apple Menu Bar, Power Mac G4 Cube Lucite acrylic watermark, desktop icons, and retractable Control Strip:*

![Mac OS 9.2.2 Clean Desktop](./public/docs/showcase/macos9-desktop-clean.png)

---

### 2. Nova Blog Application Window (Unified Mac OS 9 Platinum Interior)
*Full-featured enterprise engineering portal running inside an authentic Mac OS 9 Platinum window with brushed Platinum application toolbar, segmented scope tabs, 3D beveled cards, and pinstripe sub-titlebars:*

![Nova Blog Portal Window](./public/docs/showcase/macos9-desktop-blog-window.png)

---

### 3. Nova Reader Document Window
*Pixel-authentic Mac OS 9 Platinum document window featuring pinstripe titlebar with classic close box, zoom/collapse controls, brushed Platinum navigation toolbar, dynamic typography sizing, and technical discussions pane:*

![Nova Reader Document Window](./public/docs/showcase/macos9-reader-modal.png)

---

### 4. Technical Article Compose Studio
*Mac OS 9 Platinum publication window featuring double-bordered default action buttons, live Spring AI vector tag suggestions, and Markdown formatting:*

![Compose Studio Window](./public/docs/showcase/macos9-compose-modal.png)

---

### 5. Appearance Control Panel & Night Mode
*Figma 82-812 exact clone featuring CRT monitor preview, curated HD wallpapers, highlight color tokens, and Day/Night mode with wallpaper preservation:*

![Appearance Control Panel and Night Mode](./public/docs/showcase/macos9-desktop-appearance-night.png)

---

### 6. Apple Chess 3D, iTunes Streaming & Audio Note Spectrum Visualizer
*Authentic brushed metal iTunes player streaming The Weeknd — Less Than Zero with the integrated Windows Vista / Mac OS 9 Audio Spectrum & Note Matrix Visualizer, paired with Apple Chess 3D featuring mathematical 1:1 square geometry, Staunton vector pieces, and the Deep Platinum AI engine:*

![Apple Chess 3D and Note Spectrum Visualizer](./public/docs/showcase/macos9-visualizer-chess.png)

*iTunes Oscilloscope & Waveform mode reflecting real-time audio harmonics alongside Apple Chess 3D:*

![iTunes Oscilloscope and Apple Chess 3D](./public/docs/showcase/macos9-visualizer-chess-aligned.png)

*Top Apple Menu Bar Sound pop-up with integrated mini-player, volume stepped controls, and quick iTunes launch:*

![Apple Menu Bar Sound Pop-up](./public/docs/showcase/macos9-sound-itunes.png)

---

## 🌟 Key Architecture & Capabilities

### 🖥️ Mac OS 9.2.2 Web Desktop Environment (`src/components/macos9/`)
- **Pixel-Accurate Platinum Interface:** Designed following the original 1999–2001 Apple Human Interface Guidelines with 20px top menu bar, classic fonts (Charcoal, Chicago, Geneva), and skeuomorphic beveling.
- **Apple Menu Bar & System Profiler:** Fully functional menus (Apple, File, Edit, View, Special, Help) containing About This Computer, Chooser, Control Panels, Scrapbook, Key Caps, and live digital clock.
- **Desktop Icons & Direct Launchers:**
  - `Macintosh HD`: Explores system disks and applications.
  - `Applications`: Windowed Finder suite containing Nova Blog, Internet Explorer, iTunes Radio, Wallpapers, Stickies, and Calculator.
  - `Blog`: Iconic leather-bound engineering journal with fountain pen nib; double-click/double-tap (450ms touch tolerance) immediately launches the blog portal.
  - `News`: Instant access to Sherlock 2 Nova Engineering Dispatches.
  - `Trash`: Functional trash with crinkle audio and empty confirmation.
- **🎵 Mac OS 9 iTunes & YouTube Streaming Engine (`MacItunes.tsx`, `musicSystem.ts`):**
  - Authentic brushed metal & pinstripe iTunes player with LED green display and dancing frequency equalizer bars.
  - Curated retro & modern playlist featuring **The Weeknd — Less Than Zero** (`LKsgDcckur0`, *Dawn FM*), **Blinding Lights**, **Daft Punk — One More Time** (Mac G4 era), **Kavinsky — Nightcall**, **Depeche Mode — Enjoy The Silence**, and **Cupertino 1999 Ambient Chime**.
  - **🌊 Audio Spectrum & Musical Note Matrix Visualizer (`MacAudioVisualizer.tsx`):** Nostalgic Windows Vista & Mac OS 9 audio visualizer engine with 4 real-time modes:
    - *Bars & EQ*: 32-band FFT frequency columns with floating peak hold meters and LED segments.
    - *Vista Aurora*: Flowing fluid aurora light ribbons inspired by Windows Media Player Ambience.
    - *Note Trails*: Floating musical symbols (♪, ♫, ♬, ♩, ♯, ♭) bursting outwards in rhythm with the bass kick.
    - *Oscilloscope*: Glowing phosphor cathode-ray tube waveform.
    - *Real-time Pitch Class Matrix*: 12-tone scale (C through B) illuminating active harmonics as the melody plays.
  - Persistent background YouTube audio streaming via `GlobalMusicPlayer.tsx` allowing continuous playback while browsing, playing visualizer modes, or playing chess.
  - Integrated Sound Menu mini-player in the top 20px Apple Menu Bar with track title, Play/Pause, Next/Previous controls, volume steps, and quick launch to iTunes.
- **♟️ Apple Chess 3D (`MacChess.tsx`):**
  - Authentic Mac OS 9 Apple Chess 3D application with mathematical 1:1 square grid geometry (`w-[45px] h-[45px] aspect-square`), eliminating any vertical square distortion.
  - Razor-sharp Staunton SVG vector chess piece suite with skeuomorphic shading, platinum highlights, and crisp outlines.
  - Built-in "Deep Platinum AI" computer opponent with heuristic piece evaluation (material captures, center control bonuses) and realistic thinking delay.
  - Game modes: Single Player vs Deep Platinum AI (Casual & Grandmaster) or 2-Player Pass & Play.
  - Interactive legal move indicators (green target dots / red capture rings), check warnings, undo move support, and algebraic move history notation.
  - Unclipped player status cards showing captured pieces and material score advantage (`+3`).
- **Appearance Control Panel (`MacAppearancePanel.tsx`):**
  - Live CRT monitor display with aspect ratio simulation.
  - 10+ authentic Apple wallpapers (Sonata Purple, Quantum Foam, Heavy Petal, Bondi Blue, Azul Wave, Obsidian Carbon, Capsules, Dalmatian).
  - Highlight Colors (Azul, Bondi, Lavender, Plum, Teal, Yellow) and Appearance variations.
- **Day & Night Mode with Wallpaper Persistence:** Toggle between Day Horizon and Midnight Deep Space directly from the menu bar without overriding user-selected desktop wallpapers.
- **Retractable Control Strip (`MacOs9ControlStrip.tsx`):** Collapsible bottom bar providing real-time system metrics, volume control, wallpaper quick switcher, and reboot triggers.
- **Synthesized Retro Web Audio (`retroAudioMac9.ts`):** Client-side Web Audio synthesis producing the Happy Mac startup chime, droplet clicks, window open/collapse sounds, and trash empties without external MP3 overhead.

---

### 🏛️ Nova Blog Modern Engineering Portal (`blogContent`)
When opening the **Blog** window, visitors interact with an enterprise publication engine:
- **🧠 Spring AI 128D Semantic Vector Search:**
  - Dense vector embeddings with Cosine Similarity $\cos(\theta) = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|}$.
  - Mode Switcher: **Semantic Vector**, **Hybrid RRF (Reciprocal Rank Fusion)**, and **Exact SQL LIKE**.
- **🤖 Spring AI NLP & Moderation Laboratory:**
  - Real-time extractive TL;DR summaries with compression ratio indicators.
  - Automated taxonomy and tag classification.
  - Content moderation and sentiment analysis (Positive, Neutral, Toxic).
- **⚡ Spring Batch ETL & Admin Studio:**
  - Chunk-based soft-deleted blog cleanup scheduler.
  - Author analytics and engagement aggregation pipeline.
  - Re-indexing triggers for vector embeddings.
- **📊 Real-Time Activity Monitor & System Telemetry (`SystemTelemetryModal.tsx`):**
  - Java 22 Loom virtual thread saturation gauge.
  - HikariCP connection pool utilization meter.
  - Redis Write-Behind buffer flusher with atomic `HINCRBY` counter batching.
- **🌐 Dual-Engine Resilience (Live / Mock Fallback):**
  - Connects to Spring Boot backend (`http://localhost:5555`) when running.
  - Gracefully falls back to mock datasets (6 in-depth architectural whitepapers, 20 technical dispatches) ensuring zero downtime for evaluators.

---

### 🌐 100% Native English Localization
Every UI element, technical specification, dispatch bulletin, modal dialog, and mock dataset is authored in authentic Apple HIG English.

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js**: v20.0.0 or higher
- **npm**: v10.0.0 or higher

### Local Development
```bash
# Navigate to the frontend directory
cd novablog/frontend

# Install dependencies
npm install

# Start the Turbopack development server
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Production Build
```bash
# Compile optimized Next.js 16 production build
npm run build

# Start production server
npm run start
```

### Docker Deployment
```bash
docker build -t novablog-frontend:latest .
docker run -d -p 3000:3000 --name novablog-ui novablog-frontend:latest
```

---

## 📂 Project Structure

```
novablog/frontend/
├── public/
│   ├── docs/showcase/          # High-resolution showcase screenshots
│   ├── retro/                  # Happy Mac and vintage icons
│   └── wallpapers/             # Mac OS 9 & OS X wallpapers
├── src/
│   ├── app/                    # Next.js 16 App Router (layout, page, dynamic routes)
│   ├── components/
│   │   ├── macos9/             # Mac OS 9.2.2 Web Desktop Suite
│   │   │   ├── apps/           # Applications Folder, Calculator, Radio, Browser
│   │   │   ├── DesktopIcon.tsx # Skeuomorphic 32x32 desktop icons
│   │   │   ├── MacAppearancePanel.tsx # Control Panel & wallpaper manager
│   │   │   ├── MacOs9ControlStrip.tsx # Collapsible bottom telemetry strip
│   │   │   ├── MacOs9Desktop.tsx      # Desktop window orchestration
│   │   │   ├── MacOs9MenuBar.tsx      # 20px top Apple menu bar
│   │   │   ├── MacOs9Window.tsx       # Platinum window chrome with WindowShade
│   │   │   └── NovaEmblemWatermark.tsx# G4 Cube Lucite acrylic badge
│   │   ├── Navbar.tsx          # Acrylic global navigation bar
│   │   ├── HeroSection.tsx     # Publication headline & lead CTA
│   │   ├── BlogCard.tsx        # Skeuomorphic article card
│   │   └── SystemTelemetryModal.tsx # Activity Monitor & VU meters
│   ├── hooks/                  # React state & audio hooks
│   ├── lib/
│   │   ├── api.ts              # Resilient REST API client & mock router
│   │   ├── mockData.ts         # Whitepapers, dispatches, and vector benchmarks
│   │   └── retroAudioMac9.ts   # Web Audio API sound synthesizer
│   └── styles/
│       └── macos9.css          # Pinstripes, bevels, and Platinum CSS tokens
└── README.md
```

---

## 👨‍💻 Author

**Abdullah Berke Özder**
- GitHub: [@abdullahberkeozder](https://github.com/abdullahberkeozder)
- Repository: [my-portfolio](https://github.com/abdullahberkeozder/my-portfolio)
