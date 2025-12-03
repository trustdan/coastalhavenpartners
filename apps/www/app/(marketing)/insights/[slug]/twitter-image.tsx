import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'
export const alt = 'Coastal Haven Partners'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

function formatCategory(category: string): string {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export default async function TwitterImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // Fetch article data
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: article } = await supabase
    .from('articles')
    .select('title, category, excerpt')
    .eq('slug', slug)
    .single()

  const title = article?.title || 'Insights'
  const category = article?.category ? formatCategory(article.category) : null

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 80px',
          background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #6366f1 100%)',
        }}
      >
        {/* Category badge */}
        {category && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontSize: 24,
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.9)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                padding: '8px 20px',
                borderRadius: '8px',
              }}
            >
              {category}
            </span>
          </div>
        )}

        {/* Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            flex: 1,
            justifyContent: 'center',
            marginTop: category ? '0' : '40px',
          }}
        >
          <h1
            style={{
              fontSize: title.length > 60 ? 48 : title.length > 40 ? 56 : 64,
              fontWeight: 700,
              color: 'white',
              lineHeight: 1.2,
              margin: 0,
              textWrap: 'balance',
            }}
          >
            {title}
          </h1>
        </div>

        {/* Footer with branding */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            paddingTop: '30px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 700,
                color: 'white',
              }}
            >
              CHP
            </div>
            <span
              style={{
                fontSize: 28,
                fontWeight: 600,
                color: 'white',
              }}
            >
              Coastal Haven Partners
            </span>
          </div>
          <span
            style={{
              fontSize: 20,
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            coastalhavenpartners.com
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
