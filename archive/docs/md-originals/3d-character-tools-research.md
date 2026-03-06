# מחקר: כלים ל-3D Characters ב-Web Game

**פרויקט:** Ninja Keyboard
**תאריך:** מרץ 2026
**מטרה:** מעבר עתידי מדמויות 2D (Brawl Stars / anime chibi) לדמויות 3D

---

## סיכום מנהלים

המעבר ל-3D הוא בר-השגה עם budget של $0–$50/חודש. הנתיב המומלץ:
**VRoid Studio (ייצור דמויות) → Mixamo (animations) → Blender (export to GLB) → React Three Fiber (web)**

---

## 1. המרת 2D → 3D באמצעות AI

### כלים מובילים

#### Meshy AI — ⭐ המלצה ראשונה
- **אתר:** [meshy.ai](https://www.meshy.ai/)
- **מה זה:** שירות AI שיוצר מודל 3D מתמונה או טקסט תוך שניות
- **Free tier:** 200 קרדיטים/חודש (אבל assets בחינם = Creative Commons, לא commercial!)
- **Pro:** $20/חודש → commercial license + יותר קרדיטים
- **פורמטים:** GLB, FBX, OBJ, STL, USDZ — כולם תואמים web
- **יתרון:** יש library מוכנה של [chibi models](https://www.meshy.ai/tags/chibi) להורדה ישירה
- **חיסרון בחינם:** Creative Commons license = לא ניתן לשימוש מסחרי
- **Rigging:** כולל auto-rigging אוטומטי לדמויות
- **מתאים ל-Ninja Keyboard?** כן — לייצר prototype 3D מהאמנות הקיימת. Pro נדרש לשימוש מסחרי.

#### Tripo3D — ⭐ אלטרנטיב חינמי
- **אתר:** [tripo3d.ai](https://www.tripo3d.ai/)
- **מה זה:** AI שממיר תמונה → 3D model תוך שניות
- **Free:** קיים (מוגבל)
- **יתרון:** מהיר מאוד, תומך chibi ו-cartoon style
- **שימוש:** לייבוא תמונות של Ki, Mika, ושאר הדמויות שלנו → 3D prototype

#### Hyper3D Rodin
- **אתר:** [hyper3d.ai](https://hyper3d.ai/)
- **Free tier:** כן
- **יתרון:** איכות גבוהה, מתאים ל-game assets
- **API:** זמין לאינטגרציה בתוך פרויקט

#### Sloyd AI
- **אתר:** [sloyd.ai](https://www.sloyd.ai/image-to-3d)
- **מה:** unlimited image-to-3D, כולל auto-rigging ואנימציה
- **Free tier:** unlimited generations בחינם
- **פורמטים:** GLB, FBX

---

## 2. יצירת דמויות 3D מאפס

### VRoid Studio — ⭐ ממליץ בחום לסגנון chibi/anime

- **אתר:** [vroid.com/en/studio](https://vroid.com/en/studio)
- **עלות:** **חינם לגמרי**
- **מה זה:** Desktop app (Windows/Mac) ליצירת דמויות 3D בסגנון anime/chibi
- **פלט:** VRM format (שהוא בעצם GLTF + extensions)
- **Web Integration:** ספריית [@pixiv/three-vrm](https://github.com/pixiv/three-vrm) ל-Three.js
- **משתמשים:** VTubers, anime games, web apps
- **יתרון:** **ממש chibi**, ממשק ידידותי, ללא ידע ב-3D modeling
- **Workflow:** VRoid Studio → export VRM → convert to GLB → Three.js / React Three Fiber

#### קוד דוגמה — טעינת VRM ב-React Three Fiber:
```typescript
import { VRMLoaderPlugin } from '@pixiv/three-vrm'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

function VRMCharacter({ url }: { url: string }) {
  const gltf = useLoader(GLTFLoader, url, (loader) => {
    loader.register((parser) => new VRMLoaderPlugin(parser))
  })
  const vrm = gltf.userData.vrm
  return <primitive object={vrm.scene} />
}
```

---

### Ready Player Me — לדמויות אנושיות כלליות
- **אתר:** [readyplayer.me](https://readyplayer.me/)
- **עלות:** חינם (SDK בחינם)
- **מה זה:** Avatar creator web-based, מייצא GLB
- **שימוש מומלץ:** פחות מתאים לסגנון chibi, יותר לדמויות מורים/מבוגרים
- **Three.js:** Three.js forum מתעד [שימוש חינמי](https://discourse.threejs.org/t/free-3d-avatar-creator-tool-ready-player-me/30724)

---

## 3. אנימציות חינמיות — Mixamo

- **אתר:** [mixamo.com](https://www.mixamo.com/) (Adobe, חינמי!)
- **עלות:** **חינם לגמרי** (כולל שימוש מסחרי)
- **מה זה:** אלפי אנימציות motion-capture + auto-rigging
- **פורמטים:** FBX → צריך המרה ל-GLTF דרך Blender
- **Workflow מלא:**
  1. יצירת/קבלת מודל (VRoid / Meshy / AI)
  2. העלאה ל-Mixamo → בחירת אנימציות (ריצה, קפיצה, הקלדה!)
  3. Export כ-FBX
  4. ייבוא ל-Blender → export כ-GLB עם embed animations
  5. טעינה ב-React Three Fiber עם `useGLTF` + `useAnimations`

#### Typing Animation?
Mixamo יש אנימציות "typing" ו-"sitting" — מושלם ל-Ninja Keyboard!

---

## 4. React Three Fiber — אינטגרציה ב-Next.js

### ספריות נדרשות

```bash
npm install @react-three/fiber @react-three/drei three
npm install @types/three
```

### Packages מרכזיים

| Package | שימוש |
|---------|-------|
| `@react-three/fiber` | React renderer ל-Three.js |
| `@react-three/drei` | Helpers: `useGLTF`, `useAnimations`, `OrbitControls`, `Environment` |
| `@react-three/postprocessing` | אפקטים ויזואליים |
| `@pixiv/three-vrm` | VRM/VRoid support |
| `three` | Three.js עצמו |

### קוד דוגמה — דמות עם אנימציות

```typescript
import { useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF, useAnimations, OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'

function Character({ url, animation }: { url: string; animation: string }) {
  const group = useRef<THREE.Group>(null)
  const { scene, animations } = useGLTF(url)
  const { actions } = useAnimations(animations, group)

  useEffect(() => {
    actions[animation]?.reset().fadeIn(0.3).play()
    return () => { actions[animation]?.fadeOut(0.3) }
  }, [animation, actions])

  return <primitive ref={group} object={scene} />
}

// Preload לביצועים טובים יותר
useGLTF.preload('/characters/ki.glb')

export function KiCharacter({ isTyping }: { isTyping: boolean }) {
  return (
    <Canvas dpr={[1, 1.5]} performance={{ min: 0.5 }}>
      <Suspense fallback={null}>
        <Character
          url="/characters/ki.glb"
          animation={isTyping ? 'typing' : 'idle'}
        />
        <OrbitControls enablePan={false} />
        <ambientLight intensity={0.8} />
      </Suspense>
    </Canvas>
  )
}
```

### אינטגרציה ב-Next.js (App Router)

```typescript
// app/components/character-3d.tsx
'use client'

import dynamic from 'next/dynamic'

// Dynamic import — כי WebGL לא עובד ב-SSR
const KiCharacter3D = dynamic(
  () => import('./ki-character-3d').then(mod => mod.KiCharacter),
  {
    ssr: false,
    loading: () => <div className="character-placeholder" />
  }
)

export { KiCharacter3D }
```

---

## 5. Spline.design — 3D בדפדפן

- **אתר:** [spline.design](https://spline.design/)
- **עלות:** חינם (עם branding) / $9/חודש להסרת branding
- **מה זה:** עורך 3D scenes ישירות בדפדפן, export לקוד
- **React integration:**
  ```bash
  npm install @splinetool/react-spline
  ```
  ```typescript
  import Spline from '@splinetool/react-spline'
  export default function App() {
    return <Spline scene="https://prod.spline.design/your-scene-url" />
  }
  ```
- **Next.js SSR:** יש תמיכה ב-SSR עם `@splinetool/react-spline/next`
- **מתאים ל-Ninja Keyboard?** כן לsplash screens ו-hero animations, פחות לגיימפליי עצמו
- **חיסרון:** תלוי בשרת Spline לוודינג — לא ideal לפרודקשן

---

## 6. Rive — אנימציה אינטראקטיבית

- **אתר:** [rive.app](https://rive.app/)
- **עלות:** חינם (editor) + hosting בחינם עד גבול מסוים
- **מה זה:** אנימציות 2D/2.5D אינטראקטיביות עם state machine
- **שימוש מושלם:** כפתורים, UI elements, mascot reactions
- **3D?** לא 3D אמיתי — אבל 2.5D workflow עם rigged sprites
- **React:**
  ```bash
  npm install @rive-app/react-canvas
  ```
  ```typescript
  import { useRive, useStateMachineInput } from '@rive-app/react-canvas'

  function KiMascot() {
    const { rive, RiveComponent } = useRive({
      src: '/ki-mascot.riv',
      stateMachines: 'State Machine 1',
      autoplay: true,
    })

    const isTyping = useStateMachineInput(rive, 'State Machine 1', 'isTyping')

    return <RiveComponent onClick={() => isTyping?.fire()} />
  }
  ```
- **מתאים ל-Ninja Keyboard?** **כן מאוד** — לשדרג את Ki mascot ל-Rive עם mood state machine!
- **יתרון:** קבצים קטנים (90% קטן יותר מ-GIF), אינטראקטיבי, cross-platform
- **חיסרון:** 2D בלבד, לא 3D אמיתי

---

## 7. השוואת כלי AI ל-3D Generation

| כלי | Free Tier | איכות Chibi | Commercial | פורמט | מהירות |
|-----|-----------|-------------|------------|--------|--------|
| **Meshy AI** | 200 credits/mo | ⭐⭐⭐⭐ | $20/mo | GLB/FBX | 10-30 שניות |
| **Tripo3D** | מוגבל | ⭐⭐⭐⭐ | נדרש בדיקה | GLB/FBX | שניות |
| **Sloyd AI** | Unlimited | ⭐⭐⭐ | כן | GLB | שניות |
| **Hyper3D Rodin** | כן | ⭐⭐⭐⭐ | נדרש בדיקה | GLB | דקות |
| **Luma Genie** | Generous | ⭐⭐⭐ | כן | GLB | דקות |
| **VRoid Studio** | **חינם מלא** | ⭐⭐⭐⭐⭐ | כן | VRM/GLB | ידני |

---

## 8. ביצועים ותקציב טכני

### Performance Budget למובייל

| מדד | ערך מומלץ |
|-----|-----------|
| Polygon count per character | 5,000–15,000 triangles |
| Texture size | 512×512 או 1024×1024 |
| Animations per character | 5–10 (idle, type, celebrate, error, run) |
| Max draw calls | 50–100 |
| Target FPS | 60fps desktop, 30fps mobile |
| GLB file size | מתחת ל-2MB per character |

### טכניקות אופטימיזציה ב-React Three Fiber

```typescript
// 1. On-demand rendering (חוסך battery)
<Canvas frameloop="demand">

// 2. DPR limit (חשוב למובייל)
<Canvas dpr={[1, 1.5]}>

// 3. LOD — Level of Detail
import { Detailed } from '@react-three/drei'
<Detailed distances={[0, 10, 30]}>
  <HighPolyModel />
  <MedPolyModel />
  <LowPolyModel />
</Detailed>

// 4. Instancing לדמויות זהות (opponents)
import { Instances, Instance } from '@react-three/drei'
<Instances geometry={characterGeometry}>
  <Instance position={[0, 0, 0]} />
  <Instance position={[2, 0, 0]} />
</Instances>

// 5. Suspend + Preload
useGLTF.preload('/ki.glb')
useGLTF.preload('/sensei.glb')
```

---

## 9. נתיב מומלץ — מ-2D ל-3D ב-Ninja Keyboard

### שלב 1: Prototype (שבוע 1–2) — **חינם**
```
1. הורד VRoid Studio
2. צור גרסת 3D של Ki (chibi boy) — בסביבות שעתיים
3. Export ל-VRM
4. Convert ל-GLB (ב-Blender חינמי)
5. הוסף אנימציית typing מ-Mixamo
6. טמיעה ב-Next.js עם React Three Fiber
```

### שלב 2: AI Conversion (שבוע 3) — **חינם / $20**
```
1. בא ל-Meshy AI עם תמונות הדמויות הקיימות
2. Generate 3D מהאמנות שכבר יש לנו (Ki, Mika, Sensei וכו')
3. Free tier לtesting, Pro אם רוצים commercial
4. Compare איכות בין VRoid ל-Meshy
```

### שלב 3: Rive Upgrade (שבוע 4) — **חינם**
```
1. המר את Ki mascot ל-Rive animation
2. State machine: idle → typing → celebrate → error → sleepy
3. React integration עם useRive
4. החלפת Framer Motion wrapper בRive component
```

### שלב 4: Full 3D Game (עתידי) — **$0–$50/mo**
```
1. כל הדמויות ב-GLB עם animations
2. Battle screen עם 2 characters מולם
3. Environment backgrounds כ-3D scenes ב-Spline
4. React Three Fiber עם performance budget
```

---

## 10. Stack מומלץ לפרויקט

```bash
# Core 3D
npm install @react-three/fiber @react-three/drei three

# VRoid/VRM support
npm install @pixiv/three-vrm

# Interactive animations (Ki mascot upgrade)
npm install @rive-app/react-canvas

# 3D effects (אופציונלי)
npm install @react-three/postprocessing

# Types
npm install --save-dev @types/three
```

### קובץ דוגמה — `src/components/characters/character-3d-viewer.tsx`

```typescript
'use client'

import { Suspense, useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF, useAnimations, Environment, ContactShadows } from '@react-three/drei'
import type { Group } from 'three'

interface Character3DProps {
  characterId: 'ki' | 'sensei' | 'yuki' | 'mika'
  mood: 'idle' | 'typing' | 'celebrate' | 'error'
  className?: string
}

function CharacterModel({ characterId, mood }: Character3DProps) {
  const group = useRef<Group>(null)
  const { scene, animations } = useGLTF(`/characters/3d/${characterId}.glb`)
  const { actions } = useAnimations(animations, group)

  useEffect(() => {
    const action = actions[mood]
    if (action) {
      action.reset().fadeIn(0.3).play()
      return () => { action.fadeOut(0.3) }
    }
  }, [mood, actions])

  return <primitive ref={group} object={scene} scale={1.5} position={[0, -1, 0]} />
}

export function Character3DViewer({ characterId, mood, className }: Character3DProps) {
  return (
    <div className={className} style={{ height: 300 }}>
      <Canvas
        dpr={[1, 1.5]}
        frameloop="demand"
        camera={{ position: [0, 0.5, 3], fov: 45 }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[2, 4, 2]} intensity={1} />
          <CharacterModel characterId={characterId} mood={mood} />
          <Environment preset="city" />
          <ContactShadows position={[0, -1, 0]} opacity={0.3} scale={3} blur={2} />
        </Suspense>
      </Canvas>
    </div>
  )
}

// Preload at module level
;['ki', 'sensei', 'yuki', 'mika'].forEach(id => {
  useGLTF.preload(`/characters/3d/${id}.glb`)
})
```

---

## 11. מקורות

### כלי AI
- [Meshy AI](https://www.meshy.ai/) — AI 3D generator, free tier + chibi library
- [Tripo3D](https://www.tripo3d.ai/) — 2D to 3D conversion
- [Sloyd AI](https://www.sloyd.ai/image-to-3d) — Unlimited free image-to-3D
- [Hyper3D Rodin](https://hyper3d.ai/) — High quality AI 3D

### כלי יצירה
- [VRoid Studio](https://vroid.com/en/studio) — חינם, chibi/anime 3D creator
- [Mixamo (Adobe)](https://www.mixamo.com/) — אנימציות חינמיות
- [Ready Player Me](https://readyplayer.me/) — Avatar creator

### Web 3D
- [React Three Fiber Docs](https://r3f.docs.pmnd.rs/) — R3F documentation
- [React Three Fiber Performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance) — Performance guide
- [Drei (pmndrs)](https://github.com/pmndrs/drei) — R3F helpers
- [Rive App](https://rive.app/) — Interactive animations
- [Spline Design](https://spline.design/) — 3D in browser

### Workflows
- [VRoid + Three.js Tutorial](https://wawasensei.dev/tuto/vrm-avatar-with-threejs-react-three-fiber-and-mediapipe)
- [Mixamo + Blender + GLTF](https://www.donmccurdy.com/2017/11/06/creating-animated-gltf-characters-with-mixamo-and-blender/)
- [Crossy Road clone with R3F](https://www.freecodecamp.org/news/how-to-code-a-crossy-road-game-clone-with-react-three-fiber/)
- [Codrops — Stylized effects R3F 2025](https://tympanus.net/codrops/2025/03/04/creating-stylized-water-effects-with-react-three-fiber/)

### השוואת מחירים
- [3D AI Pricing Comparison 2026](https://www.sloyd.ai/blog/3d-ai-price-comparison)
- [Best AI 3D Tools 2026](https://www.3daistudio.com/3d-generator-ai-comparison-alternatives-guide/best-3d-generation-tools-2026/12-essential-ai-3d-creation-tools-2026)
