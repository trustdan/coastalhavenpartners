import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 180,
  height: 180,
}

export const contentType = 'image/png'

export default function Icon() {
  const sizeNum = 180
  const borderRadius = Math.round(sizeNum * 0.1875)
  const fontSize = Math.round(sizeNum * 0.35)
  const waveHeight = Math.round(sizeNum * 0.3)
  const letterSpacing = Math.round(sizeNum * -0.012)

  return new ImageResponse(
    (
      <div
        style={{
          width: `${sizeNum}px`,
          height: `${sizeNum}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
          borderRadius: `${borderRadius}px`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Wave decoration */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: `${waveHeight}px`,
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '100% 100% 0 0',
          }}
        />
        <span
          style={{
            fontSize: `${fontSize}px`,
            fontWeight: 700,
            color: 'white',
            fontFamily: 'system-ui, sans-serif',
            letterSpacing: `${letterSpacing}px`,
          }}
        >
          CHP
        </span>
      </div>
    ),
    {
      ...size,
    }
  )
}
