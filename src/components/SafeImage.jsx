import { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';
import { loadLocalImageObjectUrl, isLocalImageUrl } from '../lib/localImageStore';

export default function SafeImage({ src, alt, className }) {
  const [failed, setFailed] = useState(false);
  const [resolvedSrc, setResolvedSrc] = useState(src);

  useEffect(() => {
    let active = true;
    let objectUrl = '';

    setFailed(false);
    setResolvedSrc(src);

    if (isLocalImageUrl(src)) {
      loadLocalImageObjectUrl(src)
        .then((url) => {
          objectUrl = url;
          if (active) setResolvedSrc(url);
        })
        .catch(() => {
          if (active) setFailed(true);
        });
    }

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  if (!resolvedSrc || failed) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 text-slate-400 dark:bg-slate-900 ${className}`}>
        <ImageOff size={26} />
      </div>
    );
  }

  return <img src={resolvedSrc} alt={alt} className={className} loading="lazy" onError={() => setFailed(true)} />;
}
