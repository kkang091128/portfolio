import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Pencil, Trash2, BookOpen, Image as ImageIcon } from 'lucide-react';
import {
  fetchStudent,
  createChapter,
  updateChapter,
  deleteChapter,
  createArtwork,
  updateArtwork,
  deleteArtwork,
} from '../lib/api';
import { navigate } from '../lib/router';
import { useAuth } from '../lib/auth';
import type { StudentWithChapters, Artwork } from '../lib/supabase';
import { SlideGallery } from '../components/SlideGallery';
import { Modal } from '../components/Modal';

type Props = { studentId: string };

export function StudentPage({ studentId }: Props) {
  const { isAdmin } = useAuth();
  const canEdit = isAdmin;
  const [data, setData] = useState<StudentWithChapters | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChapter, setActiveChapter] = useState(0);

  // Chapter modal
  const [chModalOpen, setChModalOpen] = useState(false);
  const [editingCh, setEditingCh] = useState<string | null>(null);
  const [chForm, setChForm] = useState({ title: '', description: '' });
  const [savingCh, setSavingCh] = useState(false);

  // Artwork modal
  const [awModalOpen, setAwModalOpen] = useState(false);
  const [awChapterId, setAwChapterId] = useState<string | null>(null);
  const [editingAw, setEditingAw] = useState<string | null>(null);
  const [awForm, setAwForm] = useState({ title: '', description: '', image_url: '' });
  const [savingAw, setSavingAw] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const d = await fetchStudent(studentId);
      setData(d);
      if (d && activeChapter >= d.chapters.length) setActiveChapter(0);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const openAddChapter = () => {
    setEditingCh(null);
    setChForm({ title: '', description: '' });
    setChModalOpen(true);
  };

  const openEditChapter = (chId: string, title: string, description: string | null) => {
    setEditingCh(chId);
    setChForm({ title, description: description || '' });
    setChModalOpen(true);
  };

  const saveChapter = async () => {
    if (!chForm.title.trim() || !data) return;
    try {
      setSavingCh(true);
      if (editingCh) {
        await updateChapter(editingCh, {
          title: chForm.title.trim(),
          description: chForm.description.trim() || null,
        });
      } else {
        await createChapter({
          student_id: studentId,
          title: chForm.title.trim(),
          description: chForm.description.trim() || null,
          sort_order: data.chapters.length,
        });
      }
      setChModalOpen(false);
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSavingCh(false);
    }
  };

  const removeChapter = async (chId: string, title: string) => {
    if (!confirm(`'${title}' 챕터와 모든 작품이 삭제됩니다. 계속하시겠습니까?`)) return;
    try {
      await deleteChapter(chId);
      if (activeChapter > 0) setActiveChapter(activeChapter - 1);
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const openAddArtwork = (chId: string) => {
    setAwChapterId(chId);
    setEditingAw(null);
    setAwForm({ title: '', description: '', image_url: '' });
    setAwModalOpen(true);
  };

  const openEditArtwork = (aw: Artwork) => {
    setAwChapterId(aw.chapter_id);
    setEditingAw(aw.id);
    setAwForm({ title: aw.title, description: aw.description || '', image_url: aw.image_url });
    setAwModalOpen(true);
  };

  const saveArtwork = async () => {
    if (!awForm.title.trim() || !awForm.image_url.trim() || !awChapterId || !data) return;
    try {
      setSavingAw(true);
      if (editingAw) {
        await updateArtwork(editingAw, {
          title: awForm.title.trim(),
          description: awForm.description.trim() || null,
          image_url: awForm.image_url.trim(),
        });
      } else {
        const ch = data.chapters.find((c) => c.id === awChapterId);
        await createArtwork({
          chapter_id: awChapterId,
          title: awForm.title.trim(),
          description: awForm.description.trim() || null,
          image_url: awForm.image_url.trim(),
          sort_order: ch ? ch.artworks.length : 0,
        });
      }
      setAwModalOpen(false);
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSavingAw(false);
    }
  };

  const removeArtwork = async (awId: string, title: string) => {
    if (!confirm(`'${title}' 작품을 삭제하시겠습니까?`)) return;
    try {
      await deleteArtwork(awId);
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-32 bg-stone-200 rounded" />
          <div className="h-48 bg-stone-100 rounded-2xl" />
          <div className="h-96 bg-stone-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 text-center">
        <p className="text-red-600 mb-4">{error || '학생을 찾을 수 없습니다.'}</p>
        <button onClick={() => navigate('/')} className="text-[#c8553d] underline">
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  const chapter = data.chapters[activeChapter];

  return (
    <div>
      {/* Student header */}
      <section className="border-b border-stone-200 bg-gradient-to-b from-stone-50 to-[#faf8f5]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-[#1a1a1a] transition-smooth mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            학생 목록
          </button>

          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-stone-200 flex-shrink-0">
              {data.photo_url ? (
                <img src={data.photo_url} alt={data.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-serif-kr text-4xl text-stone-400">
                  {data.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1">
              {data.cohort && (
                <span className="inline-block px-2.5 py-1 rounded-full bg-[#c8553d]/10 text-[#c8553d] text-xs font-medium mb-2">
                  {data.cohort}
                </span>
              )}
              <h1 className="font-serif-kr text-3xl sm:text-4xl font-bold text-[#1a1a1a]">{data.name}</h1>
              {data.bio && (
                <p className="mt-2 text-stone-600 leading-relaxed max-w-2xl">{data.bio}</p>
              )}
              <div className="mt-3 flex items-center gap-4 text-sm text-stone-500">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  {data.chapters.length}개 챕터
                </span>
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4" />
                  {data.chapters.reduce((sum, c) => sum + c.artworks.length, 0)}개 작품
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chapter tabs */}
      <section className="sticky top-16 z-30 bg-[#faf8f5]/90 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center gap-1 overflow-x-auto py-3">
            {data.chapters.map((ch, i) => (
              <button
                key={ch.id}
                onClick={() => setActiveChapter(i)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-smooth ${
                  i === activeChapter
                    ? 'bg-[#1a1a1a] text-[#faf8f5]'
                    : 'text-stone-600 hover:bg-stone-200/50'
                }`}
              >
                {ch.title}
              </button>
            ))}
            {canEdit && (
            <button
              onClick={openAddChapter}
              className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-stone-500 hover:bg-stone-200/50 transition-smooth"
              aria-label="챕터 추가"
            >
              <Plus className="w-5 h-5" />
            </button>
            )}
          </div>
        </div>
      </section>

      {/* Chapter content */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            오류: {error}
          </div>
        )}

        {data.chapters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-stone-400" />
            </div>
            <p className="text-stone-500 mb-4">아직 챕터가 없습니다</p>
            {canEdit ? (
              <button
                onClick={openAddChapter}
                className="px-5 py-2.5 rounded-lg bg-[#1a1a1a] text-[#faf8f5] text-sm font-medium hover:bg-[#c8553d] transition-smooth"
              >
                첫 챕터 만들기
              </button>
            ) : (
              <p className="text-xs text-stone-400">챕터를 추가하려면 로그인이 필요합니다.</p>
            )}
          </div>
        ) : chapter ? (
          <div>
            {/* Chapter header */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="font-serif-kr text-2xl font-bold text-[#1a1a1a]">{chapter.title}</h2>
                {chapter.description && (
                  <p className="mt-1.5 text-stone-600 leading-relaxed max-w-2xl">{chapter.description}</p>
                )}
              </div>
              {canEdit && (
              <div className="flex gap-1.5 flex-shrink-0">
                <button
                  onClick={() => openEditChapter(chapter.id, chapter.title, chapter.description)}
                  className="w-9 h-9 rounded-lg border border-stone-300 flex items-center justify-center text-stone-600 hover:border-[#1a1a1a] hover:bg-white transition-smooth"
                  aria-label="챕터 편집"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => removeChapter(chapter.id, chapter.title)}
                  className="w-9 h-9 rounded-lg border border-stone-300 flex items-center justify-center text-red-600 hover:border-red-300 hover:bg-red-50 transition-smooth"
                  aria-label="챕터 삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              )}
            </div>

            {/* Gallery */}
            <SlideGallery artworks={chapter.artworks} chapterTitle={chapter.title} studentName={data.name} />

            {/* Artwork list with edit */}
            {chapter.artworks.length > 0 && (
              <div className="mt-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-stone-700 uppercase tracking-wide">
                    작품 목록
                  </h3>
                  {canEdit && (
                  <button
                    onClick={() => openAddArtwork(chapter.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-100 transition-smooth"
                  >
                    <Plus className="w-4 h-4" />
                    작품 추가
                  </button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {chapter.artworks.map((aw) => (
                    <div
                      key={aw.id}
                      className="group relative rounded-xl overflow-hidden border border-stone-200 bg-white hover-lift"
                    >
                      <div className="aspect-square overflow-hidden bg-stone-100">
                        <img
                          src={aw.image_url}
                          alt={aw.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium text-[#1a1a1a] truncate">{aw.title}</p>
                        {aw.description && (
                          <p className="mt-0.5 text-xs text-stone-500 line-clamp-2">{aw.description}</p>
                        )}
                      </div>
                      {canEdit && (
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-smooth">
                        <button
                          onClick={() => openEditArtwork(aw)}
                          className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-md flex items-center justify-center text-stone-700 shadow-sm hover:bg-white"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeArtwork(aw.id, aw.title)}
                          className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-md flex items-center justify-center text-red-600 shadow-sm hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {chapter.artworks.length === 0 && (
              <div className="mt-8 flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-stone-200 rounded-2xl">
                <ImageIcon className="w-10 h-10 text-stone-300 mb-3" />
                <p className="text-stone-500 mb-4">이 챕터에 작품을 추가해보세요</p>
                {canEdit ? (
                  <button
                    onClick={() => openAddArtwork(chapter.id)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#1a1a1a] text-[#faf8f5] text-sm font-medium hover:bg-[#c8553d] transition-smooth"
                  >
                    <Plus className="w-4 h-4" />
                    작품 추가
                  </button>
                ) : (
                  <p className="text-xs text-stone-400">작품을 추가하려면 로그인이 필요합니다.</p>
                )}
              </div>
            )}
          </div>
        ) : null}
      </section>

      {/* Chapter modal */}
      <Modal
        open={chModalOpen}
        onClose={() => setChModalOpen(false)}
        title={editingCh ? '챕터 수정' : '새 챕터 추가'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">챕터 제목 *</label>
            <input
              value={chForm.title}
              onChange={(e) => setChForm({ ...chForm, title: e.target.value })}
              className="input"
              placeholder="예: 챕터 1: 타이포그래피"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">챕터 설명</label>
            <textarea
              value={chForm.description}
              onChange={(e) => setChForm({ ...chForm, description: e.target.value })}
              className="input min-h-[80px] resize-y"
              placeholder="챕터에 대한 설명"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setChModalOpen(false)}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-100 transition-smooth"
            >
              취소
            </button>
            <button
              onClick={saveChapter}
              disabled={savingCh || !chForm.title.trim()}
              className="px-5 py-2.5 rounded-lg bg-[#1a1a1a] text-[#faf8f5] text-sm font-medium hover:bg-[#c8553d] transition-smooth disabled:opacity-50"
            >
              {savingCh ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Artwork modal */}
      <Modal
        open={awModalOpen}
        onClose={() => setAwModalOpen(false)}
        title={editingAw ? '작품 수정' : '새 작품 추가'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">작품 제목 *</label>
            <input
              value={awForm.title}
              onChange={(e) => setAwForm({ ...awForm, title: e.target.value })}
              className="input"
              placeholder="작품명"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">이미지 URL *</label>
            <input
              value={awForm.image_url}
              onChange={(e) => setAwForm({ ...awForm, image_url: e.target.value })}
              className="input"
              placeholder="https://..."
            />
            {awForm.image_url && (
              <div className="mt-2 rounded-lg overflow-hidden border border-stone-200 max-h-40">
                <img src={awForm.image_url} alt="preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">작품 설명</label>
            <textarea
              value={awForm.description}
              onChange={(e) => setAwForm({ ...awForm, description: e.target.value })}
              className="input min-h-[80px] resize-y"
              placeholder="작품에 대한 설명"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setAwModalOpen(false)}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-100 transition-smooth"
            >
              취소
            </button>
            <button
              onClick={saveArtwork}
              disabled={savingAw || !awForm.title.trim() || !awForm.image_url.trim()}
              className="px-5 py-2.5 rounded-lg bg-[#1a1a1a] text-[#faf8f5] text-sm font-medium hover:bg-[#c8553d] transition-smooth disabled:opacity-50"
            >
              {savingAw ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
