'use client'

import { useEffect, useRef } from 'react'

export default function OrbitWorld({ projectSlugs }: { projectSlugs: string[] }) {
  const shell = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let cancelled = false
    let dispose = () => {}

    import('@/lib/orbit-scene').then(({ mountOrbitScene }) => {
      if (!cancelled && shell.current && canvas.current) {
        dispose = mountOrbitScene(canvas.current, shell.current, projectSlugs)
      }
    }).catch(() => undefined)

    return () => {
      cancelled = true
      dispose()
    }
  }, [projectSlugs])

  return (
    <div className="world" ref={shell} aria-hidden="true">
      <div className="world-fallback">
        <div className="world-fallback__eclipse"><span /></div>
      </div>
      <canvas className="world-canvas" ref={canvas} />
    </div>
  )
}
