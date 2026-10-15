import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, X, Type, Move, Eye, Minimize2, Maximize2 } from 'lucide-react';

interface TeleprompterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Teleprompter: React.FC<TeleprompterProps> = ({ isOpen, onClose }) => {
  const [script, setScript] = useState<string>(
    `Welcome to this product walkthrough!\n\nIn this video, I will show you:\n1. How to capture any PC window or full screen in 4K or 1080p.\n2. How to include your webcam bubble and mix your microphone.\n3. How to annotate screenshots with blur redaction and step badges.\n\nLet's get started!`
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(2); // 1 to 5
  const [fontSize, setFontSize] = useState(22); // 16 to 36
  const [opacity, setOpacity] = useState(90); // 40 to 100
  const [isMinimized, setIsMinimized] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let lastTime = performance.now();

    const step = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      if (scrollContainer) {
        scrollContainer.scrollTop += speed * 25 * dt;

        // If reached bottom, pause
        if (
          scrollContainer.scrollTop + scrollContainer.clientHeight >=
          scrollContainer.scrollHeight - 5
        ) {
          setIsPlaying(false);
          return;
        }
      }
      animRef.current = requestAnimationFrame(step);
    };

    animRef.current = requestAnimationFrame(step);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, speed]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed top-16 right-6 z-50 w-96 rounded-xl border border-neutral-700 shadow-2xl backdrop-blur-md transition-all overflow-hidden"
      style={{
        backgroundColor: `rgba(15, 23, 42, ${opacity / 100})`,
      }}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-700/60 bg-neutral-900/80 cursor-move select-none">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
          <Move className="w-3.5 h-3.5 text-indigo-400" />
          <span>Presenter Teleprompter</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-rose-400 hover:bg-neutral-800"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Controls toolbar */}
          <div className="flex items-center justify-between px-3 py-2 bg-neutral-900/60 border-b border-neutral-800/80 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-colors ${
                  isPlaying
                    ? 'bg-amber-600/80 text-white hover:bg-amber-600'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500'
                }`}
              >
                {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{isPlaying ? 'Pause' : 'Scroll'}</span>
              </button>
              <button
                onClick={() => {
                  setIsPlaying(false);
                  if (scrollRef.current) scrollRef.current.scrollTop = 0;
                }}
                className="p-1 text-neutral-400 hover:text-white"
                title="Rewind to start"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-2 py-1 rounded transition-colors ${
                  isEditing ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {isEditing ? 'Done' : 'Edit Script'}
              </button>
            </div>

            {/* Speed & Size */}
            <div className="flex items-center gap-2 text-neutral-400">
              <span className="text-[11px]">Speed:</span>
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-16 h-1 accent-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Reading body */}
          <div className="p-3">
            {isEditing ? (
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                rows={7}
                placeholder="Paste or write your presentation notes here..."
                className="w-full bg-neutral-950/80 text-neutral-100 text-sm p-2.5 rounded border border-neutral-700 focus:outline-none focus:border-indigo-500 font-sans resize-none"
              />
            ) : (
              <div
                ref={scrollRef}
                style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
                className="h-48 overflow-y-auto pr-2 text-neutral-100 font-medium whitespace-pre-wrap select-text scroll-smooth"
              >
                {script}
              </div>
            )}
          </div>

          {/* Bottom Settings bar */}
          <div className="px-3 py-1.5 bg-neutral-950/60 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
            <div className="flex items-center gap-2">
              <Type className="w-3 h-3 text-neutral-500" />
              <input
                type="range"
                min="16"
                max="32"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-14 h-1 accent-neutral-400 cursor-pointer"
                title="Font Size"
              />
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-3 h-3 text-neutral-500" />
              <input
                type="range"
                min="30"
                max="100"
                value={opacity}
                onChange={(e) => setOpacity(parseInt(e.target.value))}
                className="w-14 h-1 accent-neutral-400 cursor-pointer"
                title="Window Opacity"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
