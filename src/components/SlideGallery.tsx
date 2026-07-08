import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import type { Artwork } from '../lib/supabase';

type Props = {
  artworks: Artwork[];
  chapterTitle: string;
  studentName?: string;
};

export function SlideGallery({ artworks, chapterTitle, studentName }: Props) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [fullscreen, setFullscreen] = useState(false);

  const next = useCallback(() => {
    setDirection('right');
    setIndex((i) => (i + 1) % artworks.length);
  }, [artworks.length]);

  const prev = useCallback(() => {
    setDirection('left');
    setIndex((i) => (i - 1 + artworks.length) % artworks.length);
  }, [artworks.length]);

  useEffect(() => {
    setIndex(0);
  }, [artworks]);

  useEffect(() => {
    if (!fullscreen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'Escape') setFullscreen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [fullscreen, next, prev]);

  if (artworks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-stone-400">
        <p className="text-sm">등록된 작품이 없습니다</p>
      </div>
    );
  }

  const current = artworks[index];

  return (
    <div className="w-full">
      {/* Main slide area */}
      <div className="relative bg-[#1a1a1a] rounded-2xl overflow-hidden group">
        <div className="aspect-[4/3] sm:aspect-[16/10] relative">
          {artworks.map((art, i) => (
            <div
              key={art.id}
              className={`absolute inset-0 transition-opacity duration-500 ${
                i === index ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <img
                src={art.image_url}
                alt={art.title}
                className={`w-full h-full object-contain ${
                  i === index && i === Math.min(index, artworks.length - 1)
                    ? direction === 'right'
                      ? 'animate-slide-right'
                      : 'animate-slide-left'
                    : ''
                }`}
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            </div>
          ))}

          {/* Nav arrows */}
          {artworks.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#faf8f5]/15 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-smooth hover:bg-[#faf8f5]/25"
                aria-label="이전"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#faf8f5]/15 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-smooth hover:bg-[#faf8f5]/25"
                aria-label="다음"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Fullscreen button */}
          <button
            onClick={() => setFullscreen(true)}
            className="absolute top-3 right-3 w-10 h-10 rounded-lg bg-[#faf8f5]/15 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-smooth hover:bg-[#faf8f5]/25"
            aria-label="전체화면"
          >
            <Maximize2 className="w-5 h-5" />
          </button>

          {/* Counter */}
          <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-[#1a1a1a]/60 backdrop-blur-md text-white text-xs font-medium tabular-nums">
            {index + 1} / {artworks.length}
          </div>
        </div>
      </div>

      {/* Caption */}
      <div className="mt-4 px-1">
        <div className="flex items-baseline gap-2">
          <h4 className="font-serif-kr text-lg font-semibold text-[#1a1a1a]">{current.title}</h4>
          {studentName && (
            <span className="text-sm text-stone-500">— {studentName}</span>
          )}
        </div>
        {current.description && (
          <p className="mt-1.5 text-sm text-stone-600 leading-relaxed">{current.description}</p>
        )}
        <p className="mt-1 text-xs text-stone-400">{chapterTitle}</p>
      </div>

      {/* Thumbnails */}
      {artworks.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {artworks.map((art, i) => (
            <button
              key={art.id}
              onClick={() => {
                setDirection(i > index ? 'right' : 'left');
                setIndex(i);
              }}
              className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-smooth ${
                i === index
                  ? 'border-[#c8553d] ring-2 ring-[#c8553d]/20'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={art.image_url} alt={art.title} className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen overlay */}
      {fullscreen && (
        <div className="fixed inset-0 z-[200] bg-[#0a0a0a]/95 flex items-center justify-center p-6 animate-fade-in">
          <button
            onClick={() => setFullscreen(false)}
            className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-smooth"
          >
            <X className="w-6 h-6" />
          </button>
          <button
            onClick={prev}
            className="absolute left-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-smooth"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
          <button
            onClick={next}
            className="absolute right-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-smooth"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
          <div className="max-w-5xl max-h-[85vh] flex flex-col items-center">
            <img
              src={current.image_url}
              alt={current.title}
              className="max-w-full max-h-[75vh] object-contain rounded-lg"
            />
            <div className="mt-4 text-center">
              <h4 className="font-serif-kr text-xl font-semibold text-white">{current.title}</h4>
              {current.description && (
                <p className="mt-1 text-sm text-stone-300 max-w-xl">{current.description}</p>
              )}
              <p className="mt-2 text-xs text-stone-500 tabular-nums">{index + 1} / {artworks.length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
