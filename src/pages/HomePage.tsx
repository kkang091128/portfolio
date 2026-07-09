import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ArrowRight, BookOpen } from 'lucide-react';
import { fetchStudents, createStudent, updateStudent, deleteStudent } from '../lib/api';
import { navigate } from '../lib/router';
import { useAuth } from '../lib/auth';
import type { Student } from '../lib/supabase';
import { Modal } from '../components/Modal';

export function HomePage() {
  const { user, isAdmin } = useAuth();
  const canAdd = !!user;
  const canManage = (s: Student) => isAdmin || (s.user_id !== null && s.user_id === user?.id);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState({ name: '', bio: '', cohort: '', photo_url: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchStudents();
      setStudents(data);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', bio: '', cohort: '', photo_url: '' });
    setModalOpen(true);
  };

  const openEdit = (s: Student) => {
    setEditing(s);
    setForm({ name: s.name, bio: s.bio || '', cohort: s.cohort || '', photo_url: s.photo_url || '' });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) return;
    try {
      setSaving(true);
      if (editing) {
        await updateStudent(editing.id, {
          name: form.name.trim(),
          bio: form.bio.trim() || null,
          cohort: form.cohort.trim() || null,
          photo_url: form.photo_url.trim() || null,
        });
      } else {
        await createStudent({
          name: form.name.trim(),
          bio: form.bio.trim() || null,
          cohort: form.cohort.trim() || null,
          photo_url: form.photo_url.trim() || null,
          sort_order: students.length,
        });
      }
      setModalOpen(false);
      await load();
    } catch (e) {
      const msg = (e as Error).message;
      setError(user ? msg : '로그인이 필요합니다. 오른쪽 위에서 로그인해주세요.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (s: Student) => {
    if (!canManage(s)) {
      setError('본인의 포트폴리오만 삭제할 수 있습니다.');
      return;
    }
    if (!confirm(`'${s.name}' 학생과 모든 챕터, 작품이 삭제됩니다. 계속하시겠습니까?`)) return;
    try {
      await deleteStudent(s.id);
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-stone-200">
        <div className="absolute inset-0 bg-gradient-to-br from-[#faf8f5] via-[#faf8f5] to-stone-100" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#c8553d]/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-20 lg:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#c8553d]/10 text-[#c8553d] text-xs font-medium tracking-wide mb-6">
              <BookOpen className="w-3.5 h-3.5" />
              편집 및 출판 직업훈련반
            </div>
            <h1 className="font-serif-kr text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.15] text-[#1a1a1a]">
              학생 포트폴리오<br />
              <span className="text-[#c8553d]">전시 아카이브</span>
            </h1>
            <p className="mt-6 text-lg text-stone-600 leading-relaxed max-w-xl">
              편집과 출판의 과정을 배우는 학생들의 작품을 챕터별로 전시합니다.
              슬라이드 갤러리로 감상하고, 챕터별로 비교하며, 직접 작품을 추가하고 수정할 수 있습니다.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/compare')}
                className="px-5 py-3 rounded-xl bg-[#1a1a1a] text-[#faf8f5] font-medium text-sm hover:bg-[#c8553d] transition-smooth"
              >
                챕터 비교하기
              </button>
              {canAdd && (
                <button
                  onClick={openAdd}
                  className="px-5 py-3 rounded-xl border border-stone-300 text-[#1a1a1a] font-medium text-sm hover:border-[#1a1a1a] hover:bg-white transition-smooth flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  학생 추가
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Students grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-serif-kr text-2xl font-bold text-[#1a1a1a]">참여 학생</h2>
            <p className="mt-1 text-sm text-stone-500">총 {students.length}명의 학생 포트폴리오</p>
          </div>
          {canAdd && (
            <button
              onClick={openAdd}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-stone-300 text-sm font-medium text-stone-700 hover:border-[#1a1a1a] hover:bg-white transition-smooth"
            >
              <Plus className="w-4 h-4" />
              학생 추가
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            오류: {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-stone-100 animate-pulse" />
            ))}
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-stone-400" />
            </div>
            <p className="text-stone-500 mb-4">아직 등록된 학생이 없습니다</p>
            {canAdd ? (
              <button
                onClick={openAdd}
                className="px-5 py-2.5 rounded-lg bg-[#1a1a1a] text-[#faf8f5] text-sm font-medium hover:bg-[#c8553d] transition-smooth"
              >
                첫 학생 추가하기
              </button>
            ) : (
              <p className="text-xs text-stone-400">학생을 추가하려면 로그인이 필요합니다.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((s, i) => (
              <div
                key={s.id}
                className="group relative bg-white rounded-2xl overflow-hidden border border-stone-200 hover-lift hover:shadow-xl animate-fade-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <button
                  onClick={() => navigate(`/student/${s.id}`)}
                  className="block w-full text-left"
                >
                  <div className="aspect-[4/5] overflow-hidden bg-stone-100 relative">
                    {s.photo_url ? (
                      <img
                        src={s.photo_url}
                        alt={s.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200">
                        <span className="font-serif-kr text-4xl text-stone-400">
                          {s.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/70 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      {s.cohort && (
                        <span className="inline-block px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-medium mb-2">
                          {s.cohort}
                        </span>
                      )}
                      <h3 className="font-serif-kr text-2xl font-bold text-white">{s.name}</h3>
                    </div>
                  </div>
                  {s.bio && (
                    <p className="px-5 py-4 text-sm text-stone-600 leading-relaxed line-clamp-2">
                      {s.bio}
                    </p>
                  )}
                </button>

                {/* Action buttons */}
                {canManage(s) && (
                <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-smooth">
                  <button
                    onClick={(e) => { e.stopPropagation(); openEdit(s); }}
                    className="w-9 h-9 rounded-lg bg-white/90 backdrop-blur-md flex items-center justify-center text-stone-700 hover:bg-white shadow-sm"
                    aria-label="편집"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); remove(s); }}
                    className="w-9 h-9 rounded-lg bg-white/90 backdrop-blur-md flex items-center justify-center text-red-600 hover:bg-red-50 shadow-sm"
                    aria-label="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                )}

                {/* Hover arrow */}
                <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-[#c8553d] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-smooth translate-y-2 group-hover:translate-y-0">
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? '학생 정보 수정' : '새 학생 추가'}
      >
        <div className="space-y-4">
          <Field label="이름 *">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input"
              placeholder="학생 이름"
            />
          </Field>
          <Field label="기수">
            <input
              value={form.cohort}
              onChange={(e) => setForm({ ...form, cohort: e.target.value })}
              className="input"
              placeholder="예: 2025 1기"
            />
          </Field>
          <Field label="프로필 이미지 URL">
            <input
              value={form.photo_url}
              onChange={(e) => setForm({ ...form, photo_url: e.target.value })}
              className="input"
              placeholder="https://..."
            />
          </Field>
          <Field label="소개">
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="input min-h-[80px] resize-y"
              placeholder="학생 소개"
            />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-100 transition-smooth"
            >
              취소
            </button>
            <button
              onClick={save}
              disabled={saving || !form.name.trim()}
              className="px-5 py-2.5 rounded-lg bg-[#1a1a1a] text-[#faf8f5] text-sm font-medium hover:bg-[#c8553d] transition-smooth disabled:opacity-50"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
