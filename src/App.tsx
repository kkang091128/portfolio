import { useRouter } from './lib/router';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { StudentPage } from './pages/StudentPage';
import { ComparePage } from './pages/ComparePage';
import { AboutPage } from './pages/AboutPage';

function App() {
  const { route } = useRouter();

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Header route={route} />
      <main>
        {route.name === 'home' && <HomePage />}
        {route.name === 'student' && <StudentPage studentId={route.id} />}
        {route.name === 'compare' && <ComparePage />}
        {route.name === 'about' && <AboutPage />}
      </main>
      <footer className="border-t border-stone-200 mt-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-stone-500">
            편집·출판 직업훈련반 포트폴리오 전시 아카이브
          </p>
          <p className="text-xs text-stone-400">
            Editing & Publishing Vocational Training · Portfolio Exhibition
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
