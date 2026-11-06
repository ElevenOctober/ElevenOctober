'use client'

import { useEffect, useRef } from 'react'

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))
const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount

export default function ContourField() {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvasRef = canvas.current
    if (!canvasRef) return
    const element: HTMLCanvasElement = canvasRef
    const contextRef = element.getContext('2d')
    const wordmarkRef = element.parentElement?.querySelector<HTMLElement>('.hero-wordmark')
    if (!contextRef || !wordmarkRef) return
    const context: CanvasRenderingContext2D = contextRef
    const wordmark: HTMLElement = wordmarkRef

    const mobileQuery = window.matchMedia('(max-width: 700px)')
    const tabletQuery = window.matchMedia('(max-width: 1100px)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let width = 0
    let height = 0
    let ratio = 1
    let lineCount = 20
    let pointerX = -1000
    let pointerY = -1000
    let targetX = -1000
    let targetY = -1000
    let pointerStrength = 0
    let overWordmark = false
    let hover = 0
    let frameId = 0
    const startedAt = performance.now()
    let lastFrameAt = startedAt
    let motionTime = 0

    function resize() {
      const bounds = element.getBoundingClientRect()
      width = bounds.width
      height = bounds.height
      const mobile = mobileQuery.matches
      ratio = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.6)
      lineCount = mobile ? 10 : tabletQuery.matches ? 16 : 20
      element.width = Math.round(width * ratio)
      element.height = Math.round(height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    function onPointerMove(event: PointerEvent) {
      if (event.pointerType === 'touch') return
      const bounds = element.getBoundingClientRect()
      const text = wordmark.getBoundingClientRect()
      targetX = event.clientX - bounds.left
      targetY = event.clientY - bounds.top
      pointerStrength = 1
      overWordmark = event.clientX >= text.left && event.clientX <= text.right && event.clientY >= text.top && event.clientY <= text.bottom
    }

    function onPointerLeave() {
      targetX = -1000
      targetY = -1000
      overWordmark = false
    }

    function draw(now: number) {
      const elapsed = reducedMotion ? 0 : (now - startedAt) / 1000
      const delta = Math.min((now - lastFrameAt) / 1000, 0.05)
      lastFrameAt = now
      hover = lerp(hover, overWordmark ? 1 : 0, 0.045)
      pointerX = lerp(pointerX, targetX, 0.1)
      pointerY = lerp(pointerY, targetY, 0.1)
      pointerStrength *= Math.exp(-delta * 0.85)
      if (!reducedMotion) motionTime += delta * (1 + hover * 0.12)
      context.clearRect(0, 0, width, height)

      const time = motionTime
      const focusX = 0.56 + Math.sin(time * 0.07) * 0.1
      const focusY = height * (0.48 + Math.cos(time * 0.05) * 0.028)
      const step = Math.max(2, width / 320)
      const mobile = mobileQuery.matches
      const radius = mobile ? 92 : 155
      const maxDisplacement = mobile ? 6 : 12

      for (let index = 0; index < lineCount; index += 1) {
        const level = (index / (lineCount - 1)) * 2 - 1
        const magnitude = Math.abs(level)
        const phase = index * 0.37
        const inner = magnitude < 0.16
        const lineFocus = focusX - Math.tanh(level * 1.8) * 0.1
        const reveal = reducedMotion ? 1 : clamp((elapsed - index * 0.055) / 0.72, 0, 1)
        if (reveal <= 0) continue

        context.beginPath()
        for (let x = 0; x <= width; x += step) {
          const u = x / width
          const core = Math.exp(-Math.pow((u - lineFocus) / (0.17 + magnitude * 0.07), 2))
          const shoulder = Math.exp(-Math.pow((u - (lineFocus - 0.22)) / 0.31, 2))
          const wake = Math.exp(-Math.pow((u - (lineFocus + 0.19)) / 0.25, 2))
          const asymmetry = 0.84 + u * 0.34 + Math.sin(time * 0.035 + phase) * 0.045
          const spread = (12 + magnitude * (10 + core * 82 + shoulder * 19 + wake * 10)) * asymmetry * (1 + hover * 0.08)
          const ripple = (Math.sin(u * 5.4 + time * 0.18 + phase) * 3.2 + Math.sin(u * 10.2 - time * 0.09 + phase * 0.7) * 1.3) * (0.25 + core * 0.75)
          const baseY = focusY + level * spread + ripple
          const distanceX = x - pointerX
          const distanceY = baseY - pointerY
          const influence = pointerStrength * Math.exp(-(distanceX * distanceX + distanceY * distanceY) / (2 * radius * radius))
          const displacement = clamp((pointerY - baseY) * 0.09 + Math.sign(level || 1) * 4, -maxDisplacement, maxDisplacement) * influence
          const y = baseY + displacement

          if (x === 0) context.moveTo(x, y)
          else context.lineTo(x, y)
        }

        const opacity = (0.08 + (1 - magnitude) * 0.2 + (inner ? 0.1 : 0)) * (1 + hover * (inner ? 0.12 : 0)) * reveal
        context.strokeStyle = `rgba(217, 197, 161, ${opacity})`
        context.lineWidth = inner ? 0.85 : 0.55
        context.shadowColor = `rgba(217, 197, 161, ${opacity * 0.45})`
        context.shadowBlur = mobile ? (inner ? 2 : 0.4) : (inner ? 4 : 0.8)
        context.stroke()
      }

      context.shadowBlur = 0
      if (!reducedMotion) frameId = window.requestAnimationFrame(draw)
    }

    function onResize() {
      resize()
      if (reducedMotion) draw(performance.now())
    }

    resize()
    window.addEventListener('resize', onResize, { passive: true })
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerleave', onPointerLeave)
    if (reducedMotion) draw(performance.now())
    else frameId = window.requestAnimationFrame(draw)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [])

  return <canvas className="contour-field" ref={canvas} aria-hidden="true" />
}
