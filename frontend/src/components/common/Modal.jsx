import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${maxWidth} max-h-[90vh] flex flex-col overflow-hidden animate-scale-in bg-[var(--color-card)] border border-[var(--color-border)] shadow-elevated`} style={{ borderRadius: 28 }}>
        <div className="flex items-center justify-between px-8 py-5 border-b border-[var(--color-border)] shrink-0">
          <h2 className="text-lg font-bold text-[var(--color-foreground)] tracking-tight">{title}</h2>
          <button onClick={onClose} className="dc-btn-ghost p-1.5 rounded-lg">
            <X size={18} />
          </button>
        </div>
        <div className="px-8 py-6 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body
  );
}
