export interface Feature { title: string; description: string }

export interface Project {
  id:          string
  slug:        string
  index:       string
  title:       string
  description: string
  tags:        string[]
  year:        string
  features:    Feature[]
  liveUrl?:    string
  repoUrl?:    string
}

export const PROJECTS: Project[] = [
  {
    id:'novapay', slug:'novapay', index:'01', title:'NovaPay', year:'2024',
    description:'Fintech dashboard with real-time analytics, predictive insights, and multi-account management.',
    tags:['React','Node'],
    features:[
      {title:'Real-time Analytics',description:'Live WebSocket streaming — positions update tick by tick with sub-100ms latency.'},
      {title:'Predictive Insights',description:'ML-based spend forecasting with 30/60/90-day projections using time-series models.'},
      {title:'Multi-account View',description:'Unified dashboard across checking, savings, and investment accounts.'},
      {title:'Secure by Default',description:'AES-256 encryption, biometric auth, and zero-knowledge architecture.'},
    ],
  },
  {
    id:'orbitly', slug:'orbitly', index:'02', title:'Orbitly', year:'2024',
    description:'Immersive 3D solar system explorer built entirely in the browser using Three.js and WebGL.',
    tags:['Three.js','React'],
    features:[
      {title:'3D Rendering',description:'Physically accurate planetary motion with real orbital parameters from NASA ephemeris data.'},
      {title:'Interactive Camera',description:'Orbit, pan, and zoom with smooth exponential damping and boundary clamping.'},
      {title:'Data Overlays',description:'Rich astronomical data for every body — distance, mass, composition, and atmospheric data.'},
      {title:'Performance',description:'Runs at 60fps on mid-range hardware via LOD meshes and frustum culling.'},
    ],
  },
  {
    id:'verdant', slug:'verdant', index:'03', title:'Verdant', year:'2023',
    description:'AI-powered plant care companion with growth modelling, watering reminders, and health diagnostics.',
    tags:['React','AI'],
    features:[
      {title:'Plant Identification',description:'Camera-based recognition of 10,000+ species with 94% top-1 accuracy.'},
      {title:'Growth Modelling',description:'Predictive growth timelines based on species, climate zone, and care history.'},
      {title:'Smart Reminders',description:'Watering and fertilising schedules that adapt to live local weather data.'},
      {title:'Health Diagnostics',description:'Disease and deficiency detection from a single leaf photograph.'},
    ],
  },
  {
    id:'soundscape', slug:'soundscape', index:'04', title:'Soundscape', year:'2023',
    description:'Spatial audio player with generative music visualisation and binaural positioning controls.',
    tags:['Node','React'],
    features:[
      {title:'Spatial Audio',description:'Web Audio API HRTF convolution for accurate binaural 3D sound positioning.'},
      {title:'Visualisation',description:'Real-time FFT-driven generative visuals that react to every frequency band.'},
      {title:'Playlist Engine',description:'Mood-based queue generation using audio feature analysis via Essentia.js.'},
      {title:'Offline Support',description:'Full PWA with IndexedDB caching for uninterrupted offline playback.'},
    ],
  },
  {
    id:'threadline', slug:'threadline', index:'05', title:'Threadline', year:'2023',
    description:'Realtime collaborative project management with CRDT offline sync, kanban boards, and Gantt views.',
    tags:['React','Node'],
    features:[
      {title:'Realtime Sync',description:'Yjs CRDT-based collaborative editing — no conflicts, no lost work, ever.'},
      {title:'Offline First',description:'Full functionality without internet. Syncs automatically on reconnect.'},
      {title:'Timeline View',description:'Gantt-style dependency tracking with critical path highlighting.'},
      {title:'Integrations',description:'GitHub, Figma, Slack, and Notion connected via webhook relay APIs.'},
    ],
  },
  {
    id:'luminary', slug:'luminary', index:'06', title:'Luminary', year:'2022',
    description:'Design system and component library powering rapid product development at scale.',
    tags:['React','Design'],
    features:[
      {title:'120+ Components',description:'Fully accessible, thoroughly tested, and documented React components.'},
      {title:'Theme Engine',description:'Token-based theming with runtime switching, dark mode, and brand overrides.'},
      {title:'Storybook',description:'Interactive playground with Chromatic visual regression testing.'},
      {title:'Figma Sync',description:'Two-way sync between code tokens and Figma variables via the REST API.'},
    ],
  },
]
