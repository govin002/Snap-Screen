import React from 'react';
import { X, Keyboard, Mic, Monitor, Volume2, ShieldCheck, Zap } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/40">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-sm text-neutral-100">PC Shortcuts &amp; Recording Guide</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-neutral-300">
          {/* Shortcuts Grid */}
          <div>
            <h4 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Keyboard Shortcuts</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { key: 'Space', desc: 'Pause / Resume active recording or playback' },
                { key: 'Ctrl + V', desc: 'Paste screenshot from clipboard into editor' },
                { key: 'Ctrl + Z', desc: 'Undo last annotation on canvas' },
                { key: 'Ctrl + Y', desc: 'Redo annotation' },
                { key: 'Alt + T', desc: 'Toggle presenter teleprompter window' },
                { key: 'Esc', desc: 'Close open modal or cancel tool' },
              ].map((s) => (
                <div
                  key={s.key}
                  className="flex items-center justify-between p-2.5 bg-neutral-950/60 rounded-xl border border-neutral-800/80"
                >
                  <span className="text-neutral-400">{s.desc}</span>
                  <kbd className="px-2 py-1 bg-neutral-800 text-neutral-200 rounded border border-neutral-700 font-mono font-medium shadow-xs">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* PC Audio & System Sound Guide */}
          <div>
            <h4 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>PC System Audio &amp; Microphone Setup</span>
            </h4>
            <div className="space-y-2.5 bg-neutral-950/60 p-3.5 rounded-xl border border-neutral-800/80">
              <div className="flex items-start gap-2.5">
                <Monitor className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-neutral-200 block mb-0.5">Capturing PC System Audio:</strong>
                  <span>
                    When the browser asks which screen or tab to share, ensure the checkbox{' '}
                    <span className="text-indigo-400 font-medium">"Also share system audio"</span> (or
                    tab audio) at the bottom left is checked.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-2 border-t border-neutral-800/60">
                <Mic className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-neutral-200 block mb-0.5">Microphone Mixing:</strong>
                  <span>
                    CapturePro automatically routes your microphone and system audio through a Web Audio
                    hardware mixer, balancing speech volume and gameplay/meeting audio together.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy & Performance Guarantee */}
          <div>
            <h4 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider mb-3 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Client-Side Privacy Guarantee</span>
            </h4>
            <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80 text-neutral-400 leading-relaxed">
              All video streams, webcam feeds, audio mix tracks, and high-resolution screenshots are
              processed and rendered directly on your local computer via hardware acceleration. No video
              data or sensitive screenshots are ever uploaded to any cloud server.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-medium"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
