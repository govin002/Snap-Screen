import React, { useState } from 'react';
import {
  X,
  Laptop,
  Download,
  Check,
  Copy,
  Terminal,
  ExternalLink,
  Shield,
  Zap,
  Sparkles,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface DesktopAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesktopAppModal: React.FC<DesktopAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pwa' | 'electron'>('pwa');

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(id);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Laptop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-neutral-100">
                Run CapturePro as a PC Desktop Application
              </h3>
              <p className="text-[11px] text-neutral-400">
                Two ways to get a native desktop app on Windows, macOS, or Linux
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-6 py-2.5 bg-neutral-950/60 border-b border-neutral-800/80 flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'pwa'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Method 1: Instant Desktop Install (PWA)
          </button>
          <button
            onClick={() => setActiveTab('electron')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'electron'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Method 2: Standalone .EXE / Electron Build
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-neutral-300">
          {activeTab === 'pwa' ? (
            <div className="space-y-5">
              {/* Feature highlight */}
              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-indigo-300 font-semibold text-sm mb-1">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>Instant 1-Click Desktop App (Zero-download)</span>
                  </div>
                  <p className="text-neutral-400 text-xs leading-relaxed max-w-lg">
                    Installs as a standalone native desktop window on Windows, macOS, or Linux.
                    Adds a desktop shortcut, pins to your taskbar, runs offline, and launches with
                    zero browser address bars.
                  </p>
                </div>

                {isInstalled ? (
                  <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600/20 text-emerald-300 rounded-xl border border-emerald-500/40 text-xs font-semibold whitespace-nowrap">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Desktop App Installed!</span>
                  </div>
                ) : isInstallable ? (
                  <button
                    onClick={install}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 whitespace-nowrap"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install to Desktop Now</span>
                  </button>
                ) : (
                  <button
                    onClick={install}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 whitespace-nowrap"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install Desktop App</span>
                  </button>
                )}
              </div>

              {/* What you get list */}
              <div>
                <h4 className="font-semibold text-neutral-200 uppercase tracking-wider text-[11px] mb-3">
                  What you get with Desktop Installation:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      title: 'Dedicated Desktop Window',
                      desc: 'Runs in its own window without browser tabs or address bar distraction.',
                    },
                    {
                      title: 'Taskbar & Start Menu Shortcut',
                      desc: 'Launch directly from your Windows taskbar, Mac Dock, or desktop icon.',
                    },
                    {
                      title: 'Full Offline Recording & Snipping',
                      desc: 'Cached locally via Service Worker; works anytime even without internet.',
                    },
                    {
                      title: 'Hardware Acceleration',
                      desc: 'Direct access to your PC GPU, webcam, and microphone drivers.',
                    },
                  ].map((f, i) => (
                    <div
                      key={i}
                      className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80"
                    >
                      <h5 className="font-semibold text-neutral-200 text-xs mb-1 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{f.title}</span>
                      </h5>
                      <p className="text-[11px] text-neutral-400 leading-normal">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Manual Browser Instructions if prompt blocked */}
              <div className="p-3.5 bg-neutral-950/60 rounded-xl border border-neutral-800 text-neutral-400 leading-relaxed text-[11px]">
                <strong className="text-neutral-200 block mb-1">
                  How to install manually from your browser:
                </strong>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <strong>Google Chrome:</strong> Click the small screen/computer icon on the
                    right side of the address bar, or click Menu (⋮) →{' '}
                    <span className="text-neutral-200">"Cast, save, and share"</span> →{' '}
                    <span className="text-indigo-400">"Install CapturePro PC"</span>.
                  </li>
                  <li>
                    <strong>Microsoft Edge:</strong> Click the App icon in the address bar, or
                    Menu (...) → <span className="text-indigo-400">"Apps"</span> →{' '}
                    <span className="text-indigo-400">"Install CapturePro PC"</span>.
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            /* Electron / Standalone Native Build */
            <div className="space-y-4">
              <p className="text-neutral-300 leading-relaxed">
                If you want to compile a standalone <strong>.exe (Windows)</strong>,{' '}
                <strong>.dmg (macOS)</strong>, or <strong>.AppImage (Linux)</strong> installer that
                runs independently of any browser, the project already includes a turnkey{' '}
                <code className="text-indigo-400 bg-neutral-950 px-1.5 py-0.5 rounded border border-neutral-800 font-mono">
                  electron/main.cjs
                </code>{' '}
                wrapper.
              </p>

              {/* Step 1 */}
              <div className="p-3.5 bg-neutral-950/60 rounded-xl border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-200 text-xs flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>Step 1: Install Electron in the project</span>
                  </span>
                  <button
                    onClick={() =>
                      handleCopy('npm install --save-dev electron electron-builder', 'step1')
                    }
                    className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white"
                  >
                    {copiedCommand === 'step1' ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedCommand === 'step1' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="bg-neutral-950 text-emerald-400 p-2.5 rounded-lg border border-neutral-800 font-mono text-[11px] overflow-x-auto">
                  npm install --save-dev electron electron-builder
                </pre>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 bg-neutral-950/60 rounded-xl border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-200 text-xs flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>Step 2: Build the web assets and package .exe</span>
                  </span>
                  <button
                    onClick={() =>
                      handleCopy('npm run build && npx electron .', 'step2')
                    }
                    className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white"
                  >
                    {copiedCommand === 'step2' ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedCommand === 'step2' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="bg-neutral-950 text-emerald-400 p-2.5 rounded-lg border border-neutral-800 font-mono text-[11px] overflow-x-auto">
                  npm run build &amp;&amp; npx electron .
                </pre>
              </div>

              {/* Step 3 Packaging */}
              <div className="p-3.5 bg-neutral-950/60 rounded-xl border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-200 text-xs flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>Step 3: Generate standalone Windows .exe installer</span>
                  </span>
                  <button
                    onClick={() =>
                      handleCopy('npx electron-builder --win', 'step3')
                    }
                    className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white"
                  >
                    {copiedCommand === 'step3' ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedCommand === 'step3' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="bg-neutral-950 text-emerald-400 p-2.5 rounded-lg border border-neutral-800 font-mono text-[11px] overflow-x-auto">
                  npx electron-builder --win
                </pre>
                <p className="text-[11px] text-neutral-500">
                  This generates a portable Windows <code className="text-neutral-400">.exe</code> in the <code className="text-neutral-400">dist/</code> folder.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Client-side &amp; privacy preserving</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
