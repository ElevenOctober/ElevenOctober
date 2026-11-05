import { ImageResponse } from 'next/og'

export const alt = '11 October, an open engineering collective'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', background: '#050505', color: '#eae5dc', fontFamily: 'Arial, sans-serif', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', width: 510, height: 510, border: '1px solid rgba(226,216,192,.64)', borderRadius: '50%', left: 710, top: 58 }} />
      <div style={{ position: 'absolute', width: 412, height: 412, background: '#080807', borderRadius: '50%', left: 759, top: 107 }} />
      <div style={{ position: 'absolute', width: 8, height: 8, background: '#eee6d5', borderRadius: '50%', left: 964, top: 50 }} />
      <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 84 }}>
        <div style={{ fontSize: 92, letterSpacing: 9, lineHeight: 1 }}>11 OCTOBER</div>
        <div style={{ fontSize: 21, letterSpacing: 8, marginTop: 28, color: '#b8b2a8' }}>AN OPEN ENGINEERING COLLECTIVE</div>
        <div style={{ fontSize: 24, marginTop: 54 }}>REAL PROBLEMS. OPEN ENGINEERING.</div>
      </div>
    </div>,
    size,
  )
}
