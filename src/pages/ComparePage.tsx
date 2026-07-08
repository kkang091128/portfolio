import { useState, useEffect } from 'react';
import { LayoutGrid, ArrowLeft } from 'lucide-react';
import { fetchAllChaptersByTitle } from '../lib/api';
import { navigate } from '../lib/router';
import type { Student, Chapter, Artwork } from '../lib/supabase';
import { SlideGallery } from '../components/SlideGallery';

type ChapterGroup = {
  student: Student;
  chapter: Chapter;
  artworks: Artwork[];
};

export function ComparePage() {
  const [groups, setGroups] = useState<Map<string, ChapterGroup[]>>(new Map());
  const [titles, setTitles] = useState<string[]>([]);
  const [activeTitle, setActiveTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchAllChaptersByTitle();
        const sortedTitles = Array.from(data.keys()).sort((a, b) => {
          // Sort by chapter number if possible
          const na = parseInt(a.match(/\d+/)?.[0] || '999');
          const nb = parseInt(b.match(/\d+/)?.[0] || '999');
          return na - nb;
        });
        setGroups(data);
        setTitles(sortedTitles);
        if (sortedTitles.length > 0) setActiveTitle(sortedTitles[0]);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const activeGroups = groups.get(activeTitle) || [];

  return (
    <div>
      {/* Header */}
      <section className="border-b border-stone-200 bg-gradient-to-b from-stone-50 to-[#faf8f5]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-[#1a1a1a] transition-smooth mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            홈
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#c8553d]/10 text-[#c8553d] text-xs font-medium tracking-wide mb-4">
            <LayoutGrid className="w-3.5 h-3.5" />
            챕터 비교
          </div>
          <h1 className="font-serif-kr text-3xl sm:text-4xl font-bold text-[#1a1a1a]">
            같은 챕터, 다른 접근
          </h1>
          <p className="mt-2 text-stone-600 leading-relaxed max-w-2xl">
            학생들이 같은 주제의 챕터에서 어떻게 다른 작업을 했는지 나란히 비교해 보세요.
          </p>
        </div>
      </section>

      {/* Chapter title tabs */}
      <section className="sticky top-16 z-30 bg-[#faf8f5]/90 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center gap-1 overflow-x-auto py-3">
            {titles.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTitle(t)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-smooth ${
                  t === activeTitle
                    ? 'bg-[#1a1a1a] text-[#faf8f5]'
                    : 'text-stone-600 hover:bg-stone-200/50'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            오류: {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse space-y-4">
                <div className="h-6 w-40 bg-stone-200 rounded" />
                <div className="h-64 bg-stone-100 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : activeGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <LayoutGrid className="w-12 h-12 text-stone-300 mb-4" />
            <p className="text-stone-500">비교할 챕터가 없습니다. 학생과 챕터를 먼저 추가해주세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
            {activeGroups.map((g, i) => (
              <div
                key={g.chapter.id}
                className="animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Student label */}
                <button
                  onClick={() => navigate(`/student/${g.student.id}`)}
                  className="flex items-center gap-3 mb-4 group"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-stone-200 flex-shrink-0">
                    {g.student.photo_url ? (
                      <img src={g.student.photo_url} alt={g.student.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-serif-kr text-sm text-stone-500">
                        {g.student.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-serif-kr text-lg font-semibold text-[#1a1a1a] group-hover:text-[#c8553d] transition-smooth">
                      {g.student.name}
                    </p>
                    {g.student.cohort && (
                      <p className="text-xs text-stone-500">{g.student.cohort}</p>
                    )}
                  </div>
                </button>

                {/* Chapter description */}
                {g.chapter.description && (
                  <p className="text-sm text-stone-600 leading-relaxed mb-4">{g.chapter.description}</p>
                )}

                {/* Slide gallery */}
                <SlideGallery
                  artworks={g.artworks}
                  chapterTitle={g.chapter.title}
                  studentName={g.student.name}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
