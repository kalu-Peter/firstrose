import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function GalleryLightbox({
  images,
  index,
  onClose,
  onIndexChange,
}: {
  images: string[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}) {
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && index > 0) onIndexChange(index - 1);
      if (e.key === "ArrowRight" && index < images.length - 1) onIndexChange(index + 1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [index, images.length, onClose, onIndexChange]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta > 50 && index > 0) onIndexChange(index - 1);
    else if (delta < -50 && index < images.length - 1) onIndexChange(index + 1);
    touchStartX.current = null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
        onClick={onClose}
        aria-label="Close gallery"
      >
        ✕
      </button>

      {index > 0 && (
        <button
          className="absolute left-4 z-10 rounded-full bg-white/10 px-4 py-3 text-white transition hover:bg-white/20"
          onClick={(e) => {
            e.stopPropagation();
            onIndexChange(index - 1);
          }}
          aria-label="Previous photo"
        >
          ‹
        </button>
      )}

      <AnimatePresence mode="wait">
        <motion.img
          key={index}
          src={images[index]}
          alt={`Photo ${index + 1} of ${images.length}`}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.2 }}
          className="max-h-[90vh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
      </AnimatePresence>

      {index < images.length - 1 && (
        <button
          className="absolute right-4 z-10 rounded-full bg-white/10 px-4 py-3 text-white transition hover:bg-white/20"
          onClick={(e) => {
            e.stopPropagation();
            onIndexChange(index + 1);
          }}
          aria-label="Next photo"
        >
          ›
        </button>
      )}

      <p className="absolute bottom-4 text-sm text-white/60">
        {index + 1} / {images.length}
      </p>
    </motion.div>
  );
}
