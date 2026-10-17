import React, { useState } from 'react';
import { ImageData } from '../../types/exam';
import { ImageIcon, ZoomIn, X } from 'lucide-react';

interface ImageViewProps {
  data: ImageData;
  className?: string;
}

export const ImageView: React.FC<ImageViewProps> = ({ data, className = '' }) => {
  const [isZoomed, setIsZoomed] = useState(false);

  if (!data || !data.url) {
    return null;
  }

  return (
    <>
      <div className={`overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm my-3 ${className}`}>
        <div className="relative group cursor-pointer overflow-hidden rounded-lg bg-slate-100 flex items-center justify-center max-h-[360px]">
          <img
            src={data.url}
            alt={data.alt || 'Gambar Stimulus Soal'}
            className="w-full h-auto object-contain max-h-[360px] rounded-lg transition-transform duration-300 group-hover:scale-[1.02]"
            onClick={() => setIsZoomed(true)}
          />
          <div
            onClick={() => setIsZoomed(true)}
            className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          >
            <span className="flex items-center gap-1.5 bg-white/90 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-md backdrop-blur-xs">
              <ZoomIn className="h-3.5 w-3.5" />
              Perbesar Gambar
            </span>
          </div>
        </div>

        {data.caption && (
          <div className="flex items-center gap-2 pt-2.5 px-1 text-xs text-slate-600 italic">
            <ImageIcon className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
            <span>{data.caption}</span>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-fadeIn"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute -top-10 right-0 text-white hover:text-slate-300 transition-colors p-1"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={data.url}
              alt={data.alt || 'Zoomed Preview'}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            {data.caption && (
              <p className="mt-3 text-sm text-slate-200 text-center font-medium bg-black/50 px-4 py-1.5 rounded-full">
                {data.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};
