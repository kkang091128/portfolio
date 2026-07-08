import { BookOpen, Layers, GitCompare, Pencil } from 'lucide-react';
import { navigate } from '../lib/router';

export function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-10 py-16">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#c8553d]/10 text-[#c8553d] text-xs font-medium tracking-wide mb-6">
        <BookOpen className="w-3.5 h-3.5" />
        소개
      </div>
      <h1 className="font-serif-kr text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-6">
        편집·출판 직업훈련반<br />포트폴리오 전시 아카이브
      </h1>
      <div className="prose prose-stone max-w-none text-stone-700 leading-relaxed space-y-4">
        <p>
          이 사이트는 편집 및 출판 직업훈련반 학생들의 작품을 챕터별로 전시하는 포트폴리오 아카이브입니다.
          각 학생은 자신의 학습 과정을 챕터로 구성하고, 챕터마다 작품을 슬라이드 갤러리로 감상할 수 있습니다.
        </p>
        <p>
          같은 챕터 주제를 가진 학생들의 작품을 나란히 비교하며, 서로 다른 접근과 스타일을 살펴볼 수 있습니다.
          작품과 챕터는 언제든지 추가하고 수정할 수 있습니다.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FeatureCard
          icon={<Layers className="w-5 h-5" />}
          title="챕터별 전시"
          desc="학생마다 챕터를 만들고 작품을 슬라이드로 전시"
        />
        <FeatureCard
          icon={<GitCompare className="w-5 h-5" />}
          title="챕터 비교"
          desc="같은 주제의 작품을 나란히 비교"
        />
        <FeatureCard
          icon={<Pencil className="w-5 h-5" />}
          title="수정 가능"
          desc="학생, 챕터, 작품을 자유롭게 추가·수정"
        />
      </div>

      <div className="mt-10">
        <button
          onClick={() => navigate('/')}
          className="px-5 py-3 rounded-xl bg-[#1a1a1a] text-[#faf8f5] font-medium text-sm hover:bg-[#c8553d] transition-smooth"
        >
          전시 보러가기
        </button>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="p-5 rounded-2xl border border-stone-200 bg-white hover-lift">
      <div className="w-10 h-10 rounded-lg bg-[#c8553d]/10 flex items-center justify-center text-[#c8553d] mb-3">
        {icon}
      </div>
      <h3 className="font-serif-kr text-base font-semibold text-[#1a1a1a] mb-1">{title}</h3>
      <p className="text-sm text-stone-500 leading-relaxed">{desc}</p>
    </div>
  );
}
