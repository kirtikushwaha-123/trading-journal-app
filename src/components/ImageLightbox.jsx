import { X } from 'lucide-react';
import SafeImage from './SafeImage';

export default function ImageLightbox({ image, onClose }) {
  if (!image) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4" role="dialog" aria-modal="true">
      <button className="absolute right-4 top-4 icon-btn border-slate-700 bg-slate-900 text-white" onClick={onClose} aria-label="Close full-screen image">
        <X size={18} />
      </button>
      <SafeImage src={image} alt="Trade screenshot full screen" className="max-h-[90vh] max-w-full rounded-lg object-contain" />
    </div>
  );
}
