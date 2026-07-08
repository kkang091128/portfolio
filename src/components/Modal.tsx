import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
};

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }: Props) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#1a1a1a]/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        className={`relative ${maxWidth} w-full max-h-[90vh] overflow-y-auto bg-[#faf8f5] rounded-2xl shadow-2xl animate-fade-in-scale`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-[#faf8f5]/95 backdrop-blur-sm rounded-t-2xl">
          <h2 className="font-serif-kr text-xl font-semibold text-[#1a1a1a]">{title}</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-stone-500 hover:bg-stone-200 hover:text-[#1a1a1a] transition-smooth"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
