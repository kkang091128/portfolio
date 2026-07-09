import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { Modal } from './Modal';

type Props = {
  open: boolean;
  onClose: () => void;
};

export function AuthModal({ open, onClose }: Props) {
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const close = () => {
    setUsername('');
    setPassword('');
    setError(null);
    onClose();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    try {
      setBusy(true);
      setError(null);
      await signIn(username.trim(), password);
      close();
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.includes('Invalid login credentials')) {
        setError('아이디 또는 비밀번호가 올바르지 않습니다.');
      } else {
        setError(msg);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={close} title="관리자 로그인" maxWidth="max-w-md">
      <form onSubmit={submit} className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#c8553d]/8 border border-[#c8553d]/15">
          <div className="w-9 h-9 rounded-lg bg-[#c8553d]/15 flex items-center justify-center text-[#c8553d] flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            콘텐츠 추가 및 삭제는 관리자 계정으로 로그인한 사용자만 가능합니다.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">아이디</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input"
            placeholder="admin"
            autoComplete="username"
            autoFocus
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
            placeholder="비밀번호"
            autoComplete="current-password"
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
            disabled={busy || !username.trim() || !password.trim()}
            className="px-5 py-2.5 rounded-lg bg-[#1a1a1a] text-[#faf8f5] text-sm font-medium hover:bg-[#c8553d] transition-smooth disabled:opacity-50"
          >
            {busy ? '로그인 중...' : '로그인'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
