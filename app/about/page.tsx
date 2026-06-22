import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { SITE_NAME, SITE_TAGLINE } from '@/lib/site'

export const metadata: Metadata = { title: 'Giới thiệu' }

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="flex-1 max-w-180 mx-auto px-6 py-24">
        <h1 className="font-serif text-5xl font-medium text-primary mb-6">{SITE_NAME}</h1>
        <p className="font-sans text-lg text-on-surface-variant italic mb-10">{SITE_TAGLINE}</p>
        <div className="prose-story">
          <p>
            Đây là nơi những câu chuyện được kể chậm rãi — không vội vàng, không ồn ào.
            Mỗi bài viết là một khoảnh khắc dừng lại, một lát nhìn vào thiên nhiên, vào cuộc sống,
            và vào chính mình.
          </p>
          <p>
            Chúng tôi tin rằng những điều đẹp nhất thường ẩn mình trong những chi tiết nhỏ nhất —
            một chiếc lá rơi, tiếng mưa trên mái nhà, hay mùi cà phê buổi sáng.
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
