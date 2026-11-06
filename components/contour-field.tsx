'use client'

import { useEffect, useRef } from 'react'

const upperY = [265, 245, 225, 205, 185, 165, 145, 125, 105, 85]
const lowerY = [435, 455, 475, 495, 515, 535, 555, 575, 595, 615]
const lineOpacity = [0.44, 0.38, 0.33, 0.28, 0.22, 0.17, 0.13, 0.1, 0.07, 0.05]
const highlighted = new Set([2, 5, 12, 16])
const samples = 120

function smoothNoise(value: number) {
  const left = Math.floor(value)
  const fraction = value - left
  const blend = fraction * fraction * (3 - 2 * fraction)
  const hash = (seed: number) => {
    const result = Math.sin(seed * 127.1 + 19.19) * 43758.5453
    return (result - Math.floor(result)) * 2 - 1
  }
  return hash(left) * (1 - blend) + hash(left + 1) * blend
}

function splinePath(x: Float32Array, y: Float32Array) {
  let path = `M ${x[0]} ${y[0]}`
  for (let i = 0; i < x.length - 1; i++) {
    const before = Math.max(0, i - 1)
    const after = Math.min(x.length - 1, i + 2)
    path += ` C ${x[i] + (x[i + 1] - x[before]) / 6} ${y[i] + (y[i + 1] - y[before]) / 6}, ${x[i + 1] - (x[after] - x[i]) / 6} ${y[i + 1] - (y[after] - y[i]) / 6}, ${x[i + 1]} ${y[i + 1]}`
  }
  return path
}

export default function ContourField() {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = svgRef.current
    const root = svg?.parentElement
    if (!root || !svg) return

    const lines = [...upperY, ...lowerY].map((baseline, index) => {
      const localIndex = index % 10
      const upper = index < 10
      const start = 140 + (index * 37) % 120
      const end = 1400 + (index * 29) % 75
      const x = Float32Array.from({ length: samples }, (_, point) => start + (end - start) * point / (samples - 1))
      const y = new Float32Array(samples)
      const path = svg.querySelector<SVGPathElement>(`[data-contour="${index}"]`)
      const stops = highlighted.has(index)
        ? [...svg.querySelectorAll<SVGStopElement>(`#contour-highlight-${index} stop`)]
        : []
      return {
        baseline,
        upper,
        phase: index * 0.12,
        amplitude: 1 + (localIndex - 4.5) * 0.008,
        alpha: lineOpacity[localIndex],
        x,
        y,
        path,
        stops,
      }
    }).filter((line) => line.path)

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const pointer = { x: 800, y: 350, targetX: 800, targetY: 350, active: false, leftAt: 0 }
    let frame = 0
    let elapsed = 0
    let previous = performance.now()

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      const matrix = svg.getScreenCTM()
      if (!matrix) return
      const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse())
      pointer.targetX = point.x
      pointer.targetY = point.y
      pointer.active = true
    }
    const onPointerLeave = () => {
      pointer.active = false
      pointer.leftAt = performance.now()
    }

    if (!reducedMotion) {
      root.addEventListener('pointermove', onPointerMove)
      root.addEventListener('pointerleave', onPointerLeave)
    }

    const render = (now: number) => {
      const delta = Math.min((now - previous) / 1000, 0.05)
      previous = now
      elapsed += delta
      const upperCenter = 930 + Math.sin(elapsed * 0.09) * 100
      const lowerCenter = 690 + Math.sin(elapsed * 0.065 + 1.7) * 80
      const upperAmplitude = 110 + Math.sin(elapsed * 0.11) * 15
      const lowerAmplitude = 95 + Math.sin(elapsed * 0.08 + 2) * 12
      pointer.x += (pointer.targetX - pointer.x) * 0.06
      pointer.y += (pointer.targetY - pointer.y) * 0.06
      const pointerFade = pointer.active ? 1 : Math.max(0, 1 - (now - pointer.leftAt) / 1200)
      const highlightCenter = 0.5 + Math.sin(elapsed * 0.07) * 0.3

      for (let index = 0; index < lines.length; index++) {
        const line = lines[index]
        const center = line.upper ? upperCenter : lowerCenter
        const amplitude = (line.upper ? upperAmplitude : lowerAmplitude) * line.amplitude
        const width = line.upper ? 470 : 520

        for (let point = 0; point < samples; point++) {
          const x = line.x[point]
          const distance = x - center
          const bulge = amplitude * Math.exp(-(distance * distance) / (2 * width * width))
          const wave = Math.sin(x * 0.003 + elapsed * 0.18 + line.phase) * 10
          const noise = smoothNoise(x * 0.0015 + elapsed * 0.025 + line.phase * 0.08) * 7
          const direction = line.upper ? -1 : 1
          const base = line.baseline + direction * bulge + wave + noise
          const pointerDistance = Math.hypot(x - pointer.x, base - pointer.y)
          const force = pointerFade * Math.exp(-(pointerDistance * pointerDistance) / (2 * 220 * 220))
          const towardPointer = Math.max(-28, Math.min(28, (pointer.y - base) * 0.12))
          line.y[point] = base + towardPointer * force
        }

        line.path?.setAttribute('d', splinePath(line.x, line.y))
        const reveal = reducedMotion ? 1 : Math.max(0, Math.min(1, (elapsed - index * 0.035) / 0.75))
        line.path?.setAttribute('opacity', String(line.alpha * reveal))

        if (line.stops.length) {
          const localCenter = Math.max(0.24, Math.min(0.76, highlightCenter))
          const offsets = [0, 0.08, 0.16, localCenter - 0.08, localCenter - 0.015, localCenter, localCenter + 0.015, localCenter + 0.08, 0.84, 0.92, 1]
          line.stops.forEach((stop, stopIndex) => stop.setAttribute('offset', String(offsets[stopIndex])))
        }
      }

      if (!reducedMotion) frame = requestAnimationFrame(render)
    }

    render(previous)
    return () => {
      cancelAnimationFrame(frame)
      root.removeEventListener('pointermove', onPointerMove)
      root.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [])

  return (
    <svg ref={svgRef} className="contour-field" viewBox="0 -50 1600 800" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="contour-edge-fade" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
            <stop offset="0" stopColor="#C9BDA9" stopOpacity="0" />
            <stop offset="0.08" stopColor="#C9BDA9" stopOpacity="0.55" />
            <stop offset="0.16" stopColor="#C9BDA9" />
            <stop offset="0.84" stopColor="#C9BDA9" />
            <stop offset="0.92" stopColor="#C9BDA9" stopOpacity="0.55" />
            <stop offset="1" stopColor="#C9BDA9" stopOpacity="0" />
          </linearGradient>
          {Array.from(highlighted).map((index) => (
            <linearGradient key={index} id={`contour-highlight-${index}`} x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
              {[0, 0.08, 0.16, 0.42, 0.485, 0.5, 0.515, 0.58, 0.84, 0.92, 1].map((offset, stop) => (
                <stop key={stop} offset={offset} stopColor="#D2C2A5" stopOpacity={[0, 0.55, 1, 0.08, 0.14, 0.55, 0.14, 0.08, 1, 0.55, 0][stop]} />
              ))}
            </linearGradient>
          ))}
          <filter id="contour-mask-soften" x="100" y="190" width="1400" height="320" filterUnits="userSpaceOnUse">
            <feGaussianBlur stdDeviation="24" />
          </filter>
          <mask id="contour-text-mask" maskUnits="userSpaceOnUse" x="0" y="-50" width="1600" height="800">
            <rect x="0" y="-50" width="1600" height="800" fill="white" />
            <rect x="190" y="285" width="1220" height="130" fill="black" filter="url(#contour-mask-soften)" />
          </mask>
        </defs>
        <g mask="url(#contour-text-mask)">
          <g className="upper-field">
            {upperY.map((_, index) => (
              <path key={index} data-contour={index} className={highlighted.has(index) ? 'contour-line contour-line--highlight' : 'contour-line'} d="" fill="none" stroke={highlighted.has(index) ? `url(#contour-highlight-${index})` : 'url(#contour-edge-fade)'} strokeWidth="0.78" strokeLinecap="round" />
            ))}
          </g>
          <g className="lower-field">
            {lowerY.map((_, index) => {
              const lineIndex = index + 10
              return <path key={lineIndex} data-contour={lineIndex} className={highlighted.has(lineIndex) ? 'contour-line contour-line--highlight' : 'contour-line'} d="" fill="none" stroke={highlighted.has(lineIndex) ? `url(#contour-highlight-${lineIndex})` : 'url(#contour-edge-fade)'} strokeWidth="0.78" strokeLinecap="round" />
            })}
          </g>
        </g>
    </svg>
  )
}
