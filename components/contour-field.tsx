'use client'

import { useEffect, useRef } from 'react'

const fieldWidth = 1600
const sampleCount = 100
const contourIndices = Array.from({ length: 21 }, (_, index) => index - 10)

function gaussian(x: number, center: number, width: number) {
  const distance = (x - center) / width
  return Math.exp(-0.5 * distance * distance)
}

function splinePath(x: Float32Array, y: Float32Array) {
  const coordinate = (value: number) => Number(value.toFixed(2))
  let path = `M ${x[0]} ${y[0]}`

  for (let index = 0; index < x.length - 1; index++) {
    const before = Math.max(0, index - 1)
    const after = Math.min(x.length - 1, index + 2)
    const x1 = x[index]
    const x2 = x[index + 1]
    const y1 = y[index]
    const y2 = y[index + 1]
    path += ` C ${coordinate(x1 + (x2 - x[before]) / 6)} ${coordinate(y1 + (y2 - y[before]) / 6)}, ${coordinate(x2 - (x[after] - x1) / 6)} ${coordinate(y2 - (y[after] - y1) / 6)}, ${coordinate(x2)} ${coordinate(y2)}`
  }

  return path
}

function createContour(index: number, time = 0, pointer?: { x: number; y: number; strength: number }) {
  const n = index / 10
  const x = Float32Array.from({ length: sampleCount }, (_, point) => fieldWidth * point / (sampleCount - 1))
  const y = new Float32Array(sampleCount)
  const primaryCenter = 0.43 + Math.sin(time * 0.045) * 0.045
  const secondaryCenter = 0.69 + Math.sin(time * 0.032 + 1.8) * 0.035
  const primaryAmplitude = 125 + Math.sin(time * 0.055) * 12

  for (let point = 0; point < sampleCount; point++) {
    const nx = x[point] / fieldWidth
    const centerY = 350
      + 18 * Math.sin(nx * Math.PI * 1.35 + time * 0.035)
      - 10 * Math.sin(nx * Math.PI * 2.7 - time * 0.022)
    const spread = 18
      + primaryAmplitude * gaussian(nx, primaryCenter, 0.19)
      + 58 * gaussian(nx, secondaryCenter, 0.15)
      + 26 * gaussian(nx, 0.19, 0.1)
    const asymmetry = n < 0 ? 0.88 : 1.0
    const twist = n * 16 * Math.sin(nx * Math.PI * 1.6)
    const detail = 3.5 * Math.sin(nx * Math.PI * 3.5 + n * 0.6)
    const baseY = centerY + n * spread * asymmetry + twist + detail
    if (pointer) {
      const dx = (x[point] - pointer.x) / 240
      const dy = (baseY - pointer.y) / 115
      y[point] = baseY + dy * 44 * Math.exp(-0.5 * (dx * dx + dy * dy)) * pointer.strength
    } else {
      y[point] = baseY
    }
  }

  return splinePath(x, y)
}

const contours = contourIndices.map((index) => ({ index, n: index / 10, d: createContour(index) }))

export default function ContourField() {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = svgRef.current
    const interactionArea = svg?.closest<HTMLElement>('.hero')
    if (!svg || !interactionArea || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const paths = contours.map(({ index }) => ({
      index,
      path: svg.querySelector<SVGPathElement>(`[data-contour="${index}"]`),
    }))
    const pointer = { x: 800, y: 350, targetX: 800, targetY: 350, strength: 0, active: false }
    const start = performance.now()
    let frame = 0

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      const matrix = svg.getScreenCTM()
      if (!matrix) return
      const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse())
      if (!pointer.active && pointer.strength < 0.001) {
        pointer.x = point.x
        pointer.y = point.y
      }
      pointer.targetX = point.x
      pointer.targetY = point.y
      pointer.active = true
    }
    const onPointerLeave = () => { pointer.active = false }

    const render = (now: number) => {
      const time = (now - start) / 1000
      pointer.x += (pointer.targetX - pointer.x) * 0.12
      pointer.y += (pointer.targetY - pointer.y) * 0.12
      pointer.strength += ((pointer.active ? 1 : 0) - pointer.strength) * 0.08
      const interaction = pointer.strength > 0.001 ? pointer : undefined
      paths.forEach(({ index, path }) => path?.setAttribute('d', createContour(index, time, interaction)))
      frame = requestAnimationFrame(render)
    }

    interactionArea.addEventListener('pointermove', onPointerMove)
    interactionArea.addEventListener('pointerleave', onPointerLeave)
    frame = requestAnimationFrame(render)
    return () => {
      cancelAnimationFrame(frame)
      interactionArea.removeEventListener('pointermove', onPointerMove)
      interactionArea.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [])

  return (
    <svg ref={svgRef} className="contour-field" viewBox="0 0 1600 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="contour-edge-fade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="black" />
          <stop offset="7%" stopColor="white" />
          <stop offset="93%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </linearGradient>
        <mask id="contour-edge-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1600" height="700">
          <rect width="1600" height="700" fill="url(#contour-edge-fade)" />
        </mask>
      </defs>
      <g mask="url(#contour-edge-mask)">
        {contours.map(({ index, n, d }) => (
          <path
            key={index}
            data-contour={index}
            d={d}
            fill="none"
            stroke="#BCAE98"
            strokeWidth="0.7"
            opacity={0.07 + (1 - Math.abs(n)) * 0.25}
          />
        ))}
      </g>
    </svg>
  )
}
