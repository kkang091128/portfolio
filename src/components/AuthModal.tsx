import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { Modal } from './Modal';

type Props = {
  open: boolean;
  onClose: () => void;
};

const ADMIN_EMAIL = 'admin@portfolio.local';

export function AuthModal({ open, onClose }: Props) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setName('');
    setEmail('');
    setPassword('');
    setError(null);
  };

  const close = () => {
    reset();
    onClose();
  };

  const resolveEmail = (value: string) => {
    const trimmed = value.trim();
    if (trimmed.toLowerCase() === 'admin') return ADMIN_EMAIL;
    return trimmed;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    if (mode === 'signup' && !name.trim()) return;
    try {
      setBusy(true);
      setError(null);
      const resolved = resolveEmail(email);
      if (mode === 'signin') {
        await signIn(resolved, password);
      } else {
        await signUp(resolved, password, name);
      }
      close();
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.includes('Invalid login credentials')) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      } else if (msg.includes('already registered') || msg.includes('already been registered')) {
        setError('이미 가입된 이메일입니다. 로그인해주세요.');
      } else if (msg.toLowerCase().includes('weak_password') || msg.toLowerCase().includes('password is known to be weak')) {
        setError('비밀번호가 너무 약합니다. 더 복잡한 비밀번호를 사용해주세요.');
      } else if (msg.toLowerCase().includes('password') && msg.toLowerCase().includes('short')) {
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

  const canSubmit = mode === 'signin'
    ? !!email.trim() && !!password.trim()
    : !!name.trim() && !!email.trim() && !!password.trim();

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

        {mode === 'signup' ? (
          <p className="text-xs text-stone-500 leading-relaxed">
            회원 가입 시 입력한 이름으로 학생 프로필이 자동 생성됩니다. 로그인 후 본인의 챕터와 작품을 추가하고 삭제할 수 있습니다.
          </p>
        ) : (
          <p className="text-xs text-stone-500 leading-relaxed">
            학생은 이메일로 로그인하고, 관리자는 아이디 <span className="font-medium text-stone-700">admin</span> 으로 로그인합니다.
          </p>
        )}

        {mode === 'signup' && (
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">이름 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="학생 이름"
              autoComplete="name"
              autoFocus
              required
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            {mode === 'signin' ? '이메일 (또는 admin)' : '이메일'}
          </label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder={mode === 'signin' ? 'you@example.com 또는 admin' : 'you@example.com'}
            autoComplete="email"
            autoFocus={mode === 'signin'}
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
            disabled={busy || !canSubmit}
            className="px-5 py-2.5 rounded-lg bg-[#1a1a1a] text-[#faf8f5] text-sm font-medium hover:bg-[#c8553d] transition-smooth disabled:opacity-50"
          >
            {busy ? '처리 중...' : mode === 'signin' ? '로그인' : '가입하기'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
