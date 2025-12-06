import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ size: string }> }
) {
  const { size } = await params
  const sizeNum = parseInt(size, 10)

  // Validate size (180 for Apple touch icon, 192/512 for PWA)
  if (![180, 192, 512].includes(sizeNum)) {
    return new Response('Invalid size', { status: 400 })
  }

  const borderRadius = Math.round(sizeNum * 0.1875) // ~19% for app icon look
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
      width: sizeNum,
      height: sizeNum,
    }
  )
}
