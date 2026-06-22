/**
 * Mock story page for UI development.
 * Navigate to /stories/mock to preview the story reader without Firestore.
 * Remove this file before deploying to production.
 */

import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import BackToTopButton from '@/components/stories/BackToTopButton'
import GridStoryCard from '@/components/stories/GridStoryCard'
import { SITE_NAME, SITE_TAGLINE } from '@/lib/site'
import type { Story } from '@/types/story'

// ─── Mock data ────────────────────────────────────────────────────────────────

const COVER_FOREST =
  'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=1400&q=85'

const MOCK_STORY: Story = {
  id:               'mock-1',
  slug:             'mock',
  title:            'Tiếng thì thầm của rừng già: Nghệ thuật của sự chậm lại',
  excerpt:          'Có những buổi sáng, khi thành phố vẫn còn chìm trong giấc ngủ và làn sương mỏng còn vương trên những mái nhà, tôi thường tìm đến rừng.',
  category:         'Thiên nhiên',
  coverImage:       COVER_FOREST,
  readTimeMinutes:  6,
  publishedAt:      '2026-06-22T08:00:00.000Z',
  updatedAt:        '2026-06-22T08:00:00.000Z',
  published:        true,
  content: `
<p>Có những buổi sáng, khi thành phố vẫn còn chìm trong giấc ngủ và làn sương mỏng còn vương trên những mái nhà, tôi thường tìm đến rừng. Không phải để chạy trốn, mà để nhớ lại cảm giác — cảm giác chân chạm trên thảm lá mục, cảm giác hơi thở của đất ẩm sau cơn mưa đêm, cảm giác của một tâm trí cuối cùng cũng được im lặng.</p>

<p>Chúng ta đang sống trong một kỷ nguyên của sự vội vã. Chúng ta tối ưu hóa từng giây phút, biến cuộc đời thành một bảng tính Excel với những đầu mục công việc không bao giờ kết thúc. Chúng ta đo lường giá trị bản thân bằng số lượng email đã trả lời, số cuộc họp đã tham dự, số dặm đã chạy trên chiếc máy tập mỗi sáng. Nhưng liệu chúng ta có thực sự "sống"? Hay chúng ta chỉ đang chạy đua với một cái đích vô hình — mà khi đến nơi, chúng ta lại thấy mình cần chạy tiếp?</p>

<blockquote>"Sự sáng tạo không nảy mầm trong sự ồn ào. Nó cần những khoảng lặng, những kẽ hở của thời gian để hít thở và triển khai."</blockquote>

<h2>Lắng nghe sự im lặng</h2>

<p>Trong rừng, sự im lặng không có nghĩa là không có âm thanh. Đó là sự vắng bóng của những tiếng ồn hỗn tạp của con người — tiếng còi xe, tiếng thông báo điện thoại, tiếng cuộc trò chuyện không đầu không cuối. Thay vào đó, bạn sẽ nghe thấy bản giao hưởng của tự nhiên: tiếng gió len qua tán thông, tiếng một chú chim lạ gọi đàn ở đâu đó rất xa, hay tiếng rơi nhẹ bẫng của một chiếc lá đã hoàn thành sứ mệnh của mình.</p>

<p>Việc dành thời gian để quan sát một giọt sương đọng trên lá — cách nó thu nhỏ cả khu rừng vào trong mình như một quả cầu thuỷ tinh nhỏ bé — có thể dạy chúng ta nhiều điều về sự tập trung hơn bất kỳ ứng dụng quản lý công việc nào. Khi bạn thực sự hiện diện, tâm trí bạn bắt đầu được chữa lành. Những nút thắt của sự lo âu dần được gỡ bỏ, nhường chỗ cho những ý tưởng mới, tinh khôi và chân thật hơn.</p>

<h2>Nghệ thuật của sự chậm lại</h2>

<p>Người Nhật gọi đó là <em>shinrin-yoku</em> — tắm rừng. Không phải là đi bộ thể thao, không phải là leo núi chinh phục đỉnh cao, mà đơn giản là ngồi xuống, thở, và để rừng chữa lành. Nghiên cứu của họ chỉ ra rằng chỉ cần hai giờ trong rừng có thể làm giảm nồng độ cortisol — hormone stress — đến 12,4%. Cơ thể biết điều mà tâm trí chúng ta cứ cố phủ nhận: chúng ta cần sự chậm lại.</p>

<p>Chỉnh sửa một bài viết hay sáng tạo một tác phẩm nghệ thuật cũng giống như việc đi rừng. Đôi khi bạn cần phải dừng lại, nhìn quanh để biết mình đang ở đâu, thay vì cứ đâm đầu chạy về phía trước. Hãy cho phép mình được sai, được xóa đi và viết lại. Hãy để nhịp điệu của trái tim dẫn lối thay vì áp lực của sự hoàn hảo.</p>

<h2>Kết nối lại với bản thân</h2>

<p>Tôi đã học được điều này từ một buổi sáng trong rừng thông, khi mọi kế hoạch của tôi tan vỡ vì một cơn mưa bất ngờ. Thay vì chạy về, tôi dừng lại. Ngồi dưới một tán thông già. Lắng nghe tiếng mưa rơi trên lá. Và đột nhiên, ý tưởng cho bài viết tôi đang loay hoay suốt hai tuần xuất hiện — không phải từ sự cố gắng, mà từ sự buông thả.</p>

<p>Rừng không dạy chúng ta cách chạy nhanh hơn. Rừng dạy chúng ta biết khi nào nên dừng lại. Và đôi khi, đó là bài học khó học nhất — nhưng lại là bài học cần thiết nhất.</p>
`,
}

const MOCK_RELATED: Story[] = [
  {
    ...MOCK_STORY,
    id:           'mock-2',
    slug:         'mua-thu-va-nhung-chiec-la-vang',
    title:        'Mùa thu và những chiếc lá vàng',
    excerpt:      'Mùa thu đến không cần gõ cửa. Nó len lỏi vào buổi sáng bằng hơi lạnh đầu tiên, bằng màu vàng nhuộm nhẹ trên những tán cây bên đường.',
    category:     'Quan sát',
    coverImage:   'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
  },
  {
    ...MOCK_STORY,
    id:           'mock-3',
    slug:         'ca-phe-buoi-sang-va-thoi-quen-viet-lach',
    title:        'Cà phê buổi sáng và thói quen viết lách',
    excerpt:      'Không phải ngẫu nhiên mà hầu hết những người viết đều có một tách cà phê trên bàn. Đó không chỉ là caffeine — đó là một nghi lễ.',
    category:     'Lối sống',
    coverImage:   'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
  },
  {
    ...MOCK_STORY,
    id:           'mock-4',
    slug:         'nhung-khoang-trong-can-thiet',
    title:        'Những khoảng trống cần thiết trong cuộc sống',
    excerpt:      'Trong âm nhạc, những khoảng lặng quan trọng không kém những nốt nhạc. Cuộc sống cũng vậy — những khoảng trống mới là nơi ý nghĩa sinh ra.',
    category:     'Cảm nhận',
    coverImage:   'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MockStoryPage() {
  const story = MOCK_STORY
  const publishedDate = new Date(story.publishedAt).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <>
      <Header />

      <main className="flex flex-col gap-16 pb-32">

        {/* ── Hero ── */}
        <section className="max-w-280 mx-auto w-full px-6 pt-4 flex flex-col gap-4">

          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center gap-2 font-sans text-base text-secondary uppercase tracking-[0.08em] hover:text-primary transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M10 6H2M5 3 2 6l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to stories
            </Link>
          </div>

          <div className="relative h-[459px] rounded-lg overflow-hidden">
            <Image
              src={story.coverImage}
              alt={story.title}
              fill
              className="object-cover"
              priority
              sizes="1072px"
            />
            <div className="absolute inset-0 bg-primary/25" />
          </div>

          <div className="max-w-180 mx-auto w-full pt-4 flex flex-col gap-4">
            <div className="flex justify-center">
              <span className="bg-tertiary-fixed text-on-tertiary-fixed font-sans text-xs uppercase tracking-widest px-4 py-1 rounded-xl">
                {story.category}
              </span>
            </div>

            <h1 className="font-serif text-[4rem] font-medium text-primary text-center leading-[1.1] tracking-[-0.01em]">
              {story.title}
            </h1>

            <div className="flex items-center justify-center gap-4 font-sans text-sm text-secondary pt-2">
              <span>{SITE_NAME}</span>
              <span className="w-1 h-1 rounded-full bg-outline-variant flex-shrink-0" />
              <span>{publishedDate}</span>
              <span className="w-1 h-1 rounded-full bg-outline-variant flex-shrink-0" />
              <span>{story.readTimeMinutes} phút đọc</span>
            </div>
          </div>
        </section>

        {/* ── Article body ── */}
        <section className="max-w-180 mx-auto w-full px-6 flex flex-col gap-16">

          <div
            className="prose-story"
            dangerouslySetInnerHTML={{ __html: story.content }}
          />

          {/* Tags + engagement */}
          <div className="flex flex-col gap-8 pt-8 border-t border-outline-variant/40">
            <div className="flex flex-wrap items-center gap-2">
              {['Thiên nhiên', 'Tản văn', 'Shinrin-yoku', 'Sáng tạo'].map(tag => (
                <span
                  key={tag}
                  className="bg-surface-container-low font-sans text-xs text-secondary px-4 py-1 rounded-xl"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <button className="flex items-center gap-2 font-sans text-sm text-secondary hover:text-primary transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                Thích
              </button>
              <button className="flex items-center gap-2 font-sans text-sm text-secondary hover:text-primary transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" />
                </svg>
                Chia sẻ
              </button>
            </div>
          </div>

          {/* Author card */}
          <div className="bg-surface-container-low rounded-lg p-8 flex items-start gap-6">
            <div className="w-20 h-20 rounded-xl bg-surface-container flex-shrink-0" aria-hidden="true" />
            <div className="flex flex-col gap-1.5 pt-1">
              <h4 className="font-serif text-xl text-primary leading-snug">{SITE_NAME}</h4>
              <p className="font-sans text-sm text-secondary leading-relaxed">{SITE_TAGLINE}</p>
              <Link
                href="/"
                className="font-sans text-xs font-bold text-primary uppercase tracking-widest mt-2 hover:opacity-70 transition-opacity"
              >
                Xem thêm →
              </Link>
            </div>
          </div>
        </section>

        {/* ── Related stories ── */}
        <section className="w-full bg-surface-container-lowest px-20 pt-48 pb-32">
          <div className="max-w-280 mx-auto px-6 flex flex-col gap-16">
            <div className="flex items-end justify-between">
              <div className="flex flex-col gap-1.5">
                <p className="font-sans text-xs text-secondary uppercase tracking-widest">
                  Đề xuất cho bạn
                </p>
                <h2 className="font-serif text-[2rem] font-medium text-primary leading-tight">
                  Có thể bạn thích
                </h2>
              </div>
              <Link
                href="/"
                className="font-sans text-sm text-secondary hover:text-primary transition-colors"
              >
                Xem tất cả →
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-8">
              {MOCK_RELATED.map(s => (
                <GridStoryCard key={s.id} story={s} />
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer />
      <BackToTopButton />
    </>
  )
}
