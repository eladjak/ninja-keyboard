'use client'

import { useRef, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import {
  useGLTF,
  useAnimations,
  OrbitControls,
  Environment,
  ContactShadows,
  Html,
} from '@react-three/drei'
import type { Group } from 'three'
import { Suspense } from 'react'

const KI_MODEL_PATH = '/characters/3d/ki.glb'

type KiMood = 'idle' | 'typing' | 'celebrate' | 'error'

interface KiModelInnerProps {
  mood: KiMood
  autoRotate: boolean
}

function KiModelInner({ mood, autoRotate }: KiModelInnerProps) {
  const group = useRef<Group>(null)
  const { scene, animations } = useGLTF(KI_MODEL_PATH)
  const { actions, names } = useAnimations(animations, group)

  useEffect(() => {
    // Try to play the mood animation, fall back to first available
    const animationName = names.find(
      (n) => n.toLowerCase().includes(mood) || n.toLowerCase().includes('idle')
    )
    const fallback = names[0]
    const target = animationName ?? fallback

    if (target && actions[target]) {
      actions[target]?.reset().fadeIn(0.3).play()
      return () => {
        actions[target]?.fadeOut(0.3)
      }
    }
  }, [mood, actions, names])

  return (
    <group ref={group}>
      <primitive
        object={scene}
        scale={1.5}
        position={[0, -1, 0]}
        rotation={[0, autoRotate ? 0 : Math.PI * 0.1, 0]}
      />
    </group>
  )
}

function LoadingFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 text-center font-heebo">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">טוען מודל 3D...</p>
      </div>
    </Html>
  )
}

function ModelNotFound() {
  return (
    <Html center>
      <div className="max-w-[280px] rounded-xl border border-dashed border-primary/30 bg-background/80 p-6 text-center font-heebo backdrop-blur-sm">
        <div className="mb-3 text-4xl">🥷</div>
        <h3 className="mb-2 text-lg font-bold text-primary">מודל 3D עדיין לא קיים</h3>
        <p className="text-sm text-muted-foreground">
          צריך ליצור את קי (Ki) כמודל 3D.
          <br />
          ראה את המדריך למטה.
        </p>
      </div>
    </Html>
  )
}

interface Ki3DViewerProps {
  mood?: KiMood
  autoRotate?: boolean
  enableZoom?: boolean
  enablePan?: boolean
  height?: number
  className?: string
  showControls?: boolean
}

export function Ki3DViewer({
  mood = 'idle',
  autoRotate = true,
  enableZoom = false,
  enablePan = false,
  height = 400,
  className,
  showControls = true,
}: Ki3DViewerProps) {
  const [modelExists, setModelExists] = useState<boolean | null>(null)

  useEffect(() => {
    fetch(KI_MODEL_PATH, { method: 'HEAD' })
      .then((res) => setModelExists(res.ok))
      .catch(() => setModelExists(false))
  }, [])

  return (
    <div className={className} style={{ height }}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.5, 3], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[2, 4, 2]} intensity={1} castShadow />
          <directionalLight position={[-2, 2, -1]} intensity={0.3} />

          {modelExists === false && <ModelNotFound />}

          {modelExists === true && (
            <>
              <KiModelInner mood={mood} autoRotate={autoRotate} />
              <ContactShadows
                position={[0, -1, 0]}
                opacity={0.4}
                scale={4}
                blur={2.5}
                far={2}
              />
              <Environment preset="city" />
            </>
          )}

          {showControls && (
            <OrbitControls
              autoRotate={autoRotate}
              autoRotateSpeed={2}
              enableZoom={enableZoom}
              enablePan={enablePan}
              minPolarAngle={Math.PI / 4}
              maxPolarAngle={Math.PI / 1.8}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  )
}
