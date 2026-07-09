import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { Modal } from './Modal';

type Props = {
  open: boolean;
  onClose: () => void;
};

export function AuthModal({ open, onClose }: Props) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setEmail('');
    setPassword('');
    setError(null);
  };

  const close = () => {
    reset();
    onClose();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    try {
      setBusy(true);
      setError(null);
      if (mode === 'signin') {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password);
      }
      close();
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.includes('Invalid login credentials')) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      } else if (msg.includes('already registered') || msg.includes('already been registered')) {
        setError('이미 가입된 이메일입니다. 로그인해주세요.');
      } else if (msg.includes('password') && msg.toLowerCase().includes('short')) {
        setError('비밀번호는 최소 6자 이상이어야 합니다.');
      } else {
        setError(msg);
      }
    } finally {
      setBusy(false);
    }
  };

  const switchMode = (m: 'signin' | 'signup') => {
    setMode(m);
    setError(null);
  };

  return (
    <Modal open={open} onClose={close} title={mode === 'signin' ? '로그인' : '회원 가입'} maxWidth="max-w-md">
      <form onSubmit={submit} className="space-y-4">
        <div className="flex gap-1 p-1 rounded-xl bg-stone-100">
          <button
            type="button"
            onClick={() => switchMode('signin')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-smooth ${
              mode === 'signin' ? 'bg-white text-[#1a1a1a] shadow-sm' : 'text-stone-500 hover:text-[#1a1a1a]'
            }`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-smooth ${
              mode === 'signup' ? 'bg-white text-[#1a1a1a] shadow-sm' : 'text-stone-500 hover:text-[#1a1a1a]'
            }`}
          >
            회원 가입
          </button>
        </div>

        {mode === 'signup' && (
          <p className="text-xs text-stone-500 leading-relaxed">
            콘텐츠를 추가하거나 삭제하려면 계정이 필요합니다. 이메일과 비밀번호로 가입할 수 있습니다.
          </p>
        )}

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            placeholder="최소 6자 이상"
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            required
          />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={close}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-100 transition-smooth"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={busy || !email.trim() || !password.trim()}
            className="px-5 py-2.5 rounded-lg bg-[#1a1a1a] text-[#faf8f5] text-sm font-medium hover:bg-[#c8553d] transition-smooth disabled:opacity-50"
          >
            {busy ? '처리 중...' : mode === 'signin' ? '로그인' : '가입하기'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
