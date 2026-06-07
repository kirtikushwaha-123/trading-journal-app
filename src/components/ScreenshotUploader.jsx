import { Image, Trash2, Upload } from 'lucide-react';
import SafeImage from './SafeImage';

const accept = 'image/png,image/jpeg,image/jpg,image/webp';

export default function ScreenshotUploader({ label, value, onFile, onDelete, onOpen }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold">{label}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">PNG, JPG, JPEG, WEBP</p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500">
          <Upload size={14} />
          Upload
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onFile(file);
              event.target.value = '';
            }}
          />
        </label>
      </div>

      {value ? (
        <div className="space-y-3">
          <button type="button" className="block w-full overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800" onClick={() => onOpen(value)}>
            <SafeImage src={value} alt={label} className="h-56 w-full object-cover" />
          </button>
          <button type="button" className="inline-flex items-center gap-2 text-sm font-semibold text-rose-600 dark:text-rose-400" onClick={onDelete}>
            <Trash2 size={15} />
            Delete screenshot
          </button>
        </div>
      ) : (
        <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-slate-300 text-slate-400 dark:border-slate-700">
          <Image size={30} />
        </div>
      )}
    </div>
  );
}
