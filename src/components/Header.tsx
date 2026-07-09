import { useState } from 'react';
import { BookOpen, LayoutGrid, Info, Home, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { navigate, type Route } from '../lib/router';
import { useAuth } from '../lib/auth';
import { AuthModal } from './AuthModal';

type Props = {
  route: Route;
};

export function Header({ route }: Props) {
  const isActive = (name: string) => route.name === name;
  const { user, signOut } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (e) {
      console.error('Sign out failed', e);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#faf8f5]/85 backdrop-blur-md border-b border-stone-200/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-lg bg-[#1a1a1a] flex items-center justify-center transition-smooth group-hover:bg-[#c8553d]">
              <BookOpen className="w-5 h-5 text-[#faf8f5]" strokeWidth={1.8} />
            </div>
            <div className="text-left">
              <div className="font-serif-kr text-lg font-semibold leading-none text-[#1a1a1a]">
                편출포트폴리오
              </div>
              <div className="text-[10px] tracking-[0.15em] uppercase text-stone-500 mt-0.5">
                Editing & Publishing
              </div>
            </div>
          </button>

          <div className="flex items-center gap-1">
            <nav className="hidden sm:flex items-center gap-1">
              <NavButton
                label="홈"
                icon={<Home className="w-4 h-4" />}
                active={isActive('home')}
                onClick={() => navigate('/')}
              />
              <NavButton
                label="학생 갤러리"
                icon={<LayoutGrid className="w-4 h-4" />}
                active={isActive('student')}
                onClick={() => navigate('/')}
              />
              <NavButton
                label="챕터 비교"
                icon={<LayoutGrid className="w-4 h-4" />}
                active={isActive('compare')}
                onClick={() => navigate('/compare')}
              />
              <NavButton
                label="소개"
                icon={<Info className="w-4 h-4" />}
                active={isActive('about')}
                onClick={() => navigate('/about')}
              />
            </nav>

            <div className="flex items-center gap-1 ml-1 sm:ml-2 pl-1 sm:pl-2 border-l border-stone-200">
              {user ? (
                <div className="flex items-center gap-1.5">
                  <span className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-stone-600">
                    <UserIcon className="w-3.5 h-3.5" />
                    <span className="max-w-[140px] truncate">{user.email}</span>
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-stone-600 hover:text-[#1a1a1a] hover:bg-stone-200/50 transition-smooth"
                    aria-label="로그아웃"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">로그아웃</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAuthOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium bg-[#1a1a1a] text-[#faf8f5] hover:bg-[#c8553d] transition-smooth"
                >
                  <LogIn className="w-4 h-4" />
                  <span>로그인</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}

function NavButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-smooth ${
        active
          ? 'bg-[#1a1a1a] text-[#faf8f5]'
          : 'text-stone-600 hover:text-[#1a1a1a] hover:bg-stone-200/50'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
