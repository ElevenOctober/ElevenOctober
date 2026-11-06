'use client'

import { useEffect, useRef } from 'react'

const contourIndices = Array.from({ length: 22 }, (_, index) => index - 11)
const highlightIndices = new Set([-1, 0, 1])
const fieldWidth = 1600
const fieldHeight = 700
const samples = 144

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

function gaussian(value: number, center: number, width: number) {
  const distance = (value - center) / width
  return Math.exp(-0.5 * distance * distance)
}

function splinePath(x: Float32Array, y: Float32Array) {
  let path = `M ${x[0]} ${y[0]}`
  for (let index = 0; index < x.length - 1; index++) {
    const before = Math.max(0, index - 1)
    const after = Math.min(x.length - 1, index + 2)
    path += ` C ${x[index] + (x[index + 1] - x[before]) / 6} ${y[index] + (y[index + 1] - y[before]) / 6}, ${x[index + 1] - (x[after] - x[index]) / 6} ${y[index + 1] - (y[after] - y[index]) / 6}, ${x[index + 1]} ${y[index + 1]}`
  }
  return path
}

export default function ContourField() {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = svgRef.current
    const root = svg?.parentElement
    if (!svg || !root) return

    const lines = contourIndices.map((contourIndex, index) => {
      const start = 42 + (index * 31) % 82
      const end = 1476 + (index * 29) % 68
      const normalized = contourIndex / 11
      return {
        normalized,
        phase: normalized * 0.7,
        opacity: 0.06 + (1 - Math.abs(normalized)) * 0.24,
        x: Float32Array.from({ length: samples }, (_, point) => start + (end - start) * point / (samples - 1)),
        y: new Float32Array(samples),
        path: svg.querySelector<SVGPathElement>(`[data-contour="${contourIndex}"]`),
      }
    }).filter((line) => line.path)
    const highlightStops = [...svg.querySelectorAll<SVGStopElement>('#contour-highlight stop')]
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

    const render = (now: number) => {
      elapsed += Math.min((now - previous) / 1000, 0.05)
      previous = now
      const primaryCenter = 0.43 + Math.sin(elapsed * 0.19) * 0.05
      const secondaryCenter = 0.7 + Math.sin(elapsed * 0.15 + 2.1) * 0.04
      const highlightCenter = 0.5 + Math.sin(elapsed * 0.05 + 0.8) * 0.22
      pointer.x += (pointer.targetX - pointer.x) * 0.06
      pointer.y += (pointer.targetY - pointer.y) * 0.06
      const pointerFade = pointer.active ? 1 : Math.max(0, 1 - (now - pointer.leftAt) / 1200)

      for (const line of lines) {
        for (let point = 0; point < samples; point++) {
          const x = line.x[point]
          const nx = x / fieldWidth
          const centerY = fieldHeight * 0.5
            + 24 * Math.sin(nx * Math.PI * 1.55 + elapsed * 0.08)
            - 16 * Math.sin(nx * Math.PI * 3.2 - elapsed * 0.045)
          const spread = 15
            + 115 * gaussian(nx, primaryCenter, 0.2)
            + 55 * gaussian(nx, secondaryCenter, 0.16)
            + 30 * gaussian(nx, 0.19, 0.11)
          const asymmetry = line.normalized > 0 ? 1.34 : 1.38
          const compression = 0.82 + 0.18 * Math.abs(line.normalized)
          const twist = line.normalized * 18 * Math.sin(nx * Math.PI * 1.8 - elapsed * 0.07)
          const detail = 4.5 * Math.sin(nx * Math.PI * 4 + line.phase + elapsed * 0.06)
          const baseY = centerY + line.normalized * spread * asymmetry * compression + twist + detail
          const distanceX = x - pointer.x
          const distanceY = baseY - pointer.y
          const force = pointerFade * Math.exp(-(distanceX * distanceX + distanceY * distanceY) / (2 * 210 * 210))
          const displacement = clamp((pointer.y - baseY) * 0.12, -24, 24) * force
          line.y[point] = baseY + displacement
        }
        line.path?.setAttribute('d', splinePath(line.x, line.y))
        line.path?.setAttribute('opacity', String(line.opacity))
      }

      if (highlightStops.length) {
        const offsets = [0, 0.08, 0.16, highlightCenter - 0.11, highlightCenter - 0.025, highlightCenter, highlightCenter + 0.025, highlightCenter + 0.11, 0.84, 0.92, 1]
        highlightStops.forEach((stop, index) => stop.setAttribute('offset', String(offsets[index])))
      }
      if (!reducedMotion && !document.hidden) frame = requestAnimationFrame(render)
    }

    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame)
        frame = 0
      } else if (!reducedMotion && !frame) {
        previous = performance.now()
        frame = requestAnimationFrame(render)
      }
    }

    if (!reducedMotion) {
      root.addEventListener('pointermove', onPointerMove)
      root.addEventListener('pointerleave', onPointerLeave)
      document.addEventListener('visibilitychange', onVisibilityChange)
    }
    render(previous)

    return () => {
      cancelAnimationFrame(frame)
      root.removeEventListener('pointermove', onPointerMove)
      root.removeEventListener('pointerleave', onPointerLeave)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  return (
    <svg ref={svgRef} className="contour-field" viewBox="0 0 1600 700" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="contour-edge-fade" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
          <stop offset="0" stopColor="#C6B79F" stopOpacity="0" />
          <stop offset="0.08" stopColor="#C6B79F" stopOpacity="0.72" />
          <stop offset="0.16" stopColor="#C6B79F" />
          <stop offset="0.84" stopColor="#C6B79F" />
          <stop offset="0.92" stopColor="#C6B79F" stopOpacity="0.72" />
          <stop offset="1" stopColor="#C6B79F" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="contour-highlight" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
          {[0, 0.08, 0.16, 0.39, 0.475, 0.5, 0.525, 0.61, 0.84, 0.92, 1].map((offset, index) => (
            <stop key={index} offset={offset} stopColor={index >= 4 && index <= 6 ? '#D8C4A4' : '#C6B79F'} stopOpacity={[0, 0.72, 1, 1, 0.82, 1, 0.82, 1, 1, 0.72, 0][index]} />
          ))}
        </linearGradient>
      </defs>
      {contourIndices.map((contourIndex) => {
        const normalized = contourIndex / 11
        return (
          <path
            key={contourIndex}
            data-contour={contourIndex}
            d=""
            fill="none"
            stroke={highlightIndices.has(contourIndex) ? 'url(#contour-highlight)' : 'url(#contour-edge-fade)'}
            strokeWidth={0.62 + (1 - Math.abs(normalized)) * 0.14}
            strokeLinecap="round"
          />
        )
      })}
    </svg>
  )
}
