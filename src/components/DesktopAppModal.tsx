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
  Github,
  FolderDown,
  Monitor,
  Cpu,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface DesktopAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesktopAppModal: React.FC<DesktopAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'github' | 'pwa' | 'cli'>('github');
  const [githubRepo, setGithubRepo] = useState<string>('gowin297/capturepro-pc');

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(id);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const cleanRepo = githubRepo.trim().replace(/^https?:\/\/github\.com\//, '');
  const releasesUrl = `https://github.com/${cleanRepo}/releases`;
  const latestReleaseUrl = `https://github.com/${cleanRepo}/releases/latest`;

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
              <h3 className="font-bold text-sm text-neutral-100 flex items-center gap-2">
                <span>CapturePro PC</span>
                <span className="text-[11px] font-normal text-indigo-400">· Product by Gowin</span>
              </h3>
              <p className="text-[11px] text-neutral-400">
                Native packages with custom icon (app.ico) &amp; desktop shortcut setup
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
            onClick={() => setActiveTab('github')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'github'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Github className="w-3.5 h-3.5 text-white" />
            <span>Direct GitHub Downloads</span>
          </button>
          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'pwa'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Instant Desktop PWA</span>
          </button>
          <button
            onClick={() => setActiveTab('cli')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'cli'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Build from Source (CLI)</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-neutral-300">
          {activeTab === 'github' && (
            <div className="space-y-5">
              {/* Repo Config Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-neutral-950/60 rounded-xl border border-neutral-800">
                <div className="flex items-center gap-2 text-neutral-300">
                  <Github className="w-4 h-4 text-white shrink-0" />
                  <span>GitHub Repository:</span>
                  <input
                    type="text"
                    value={githubRepo}
                    onChange={(e) => setGithubRepo(e.target.value)}
                    placeholder="username/repository"
                    className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-white text-xs font-mono focus:border-indigo-500 outline-none w-56"
                  />
                </div>
                <a
                  href={releasesUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-medium border border-neutral-700 transition-colors"
                >
                  <span>Open GitHub Releases</span>
                  <ExternalLink className="w-3 h-3 text-neutral-400" />
                </a>
              </div>

              {/* Full Version 1.0.0 Bundle Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/60 to-purple-950/40 border border-indigo-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-white font-bold text-sm mb-1">
                    <span className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[11px] font-mono">v1.0.0</span>
                    <span>Complete Release Bundle (Ready to Download)</span>
                  </div>
                  <p className="text-neutral-300 text-xs leading-relaxed">
                    Includes all formats: Linux <code className="text-emerald-400 font-mono">.deb</code>, universal <code className="text-amber-400 font-mono">.tar.gz</code>, Windows <code className="text-indigo-300 font-mono">.zip</code> launcher, and setup scripts.
                  </p>
                </div>
                <a
                  href="/downloads/CapturePro-v1.0.0-Release-All.zip"
                  download="CapturePro-v1.0.0-Release-All.zip"
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 whitespace-nowrap"
                >
                  <FolderDown className="w-4 h-4" />
                  <span>Download v1.0.0 Bundle</span>
                </a>
              </div>

              {/* Direct Download Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Windows Card */}
                <div className="p-4 bg-neutral-950/70 border border-neutral-800 rounded-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-white font-semibold text-sm">
                        <Monitor className="w-4 h-4 text-indigo-400" />
                        <span>Windows</span>
                      </div>
                      <span className="text-[10px] text-neutral-500 font-mono">x64 / 64-bit</span>
                    </div>
                    <p className="text-neutral-400 text-xs mb-3">
                      Includes custom <code className="text-indigo-400 font-mono">app.ico</code>. Asks on launch to create your desktop shortcut. Product by Gowin.
                    </p>
                    <div className="space-y-2">
                      <a
                        href="/downloads/CapturePro-Windows.zip"
                        download="CapturePro-Windows.zip"
                        className="w-full flex items-center justify-between p-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/50 rounded-lg text-white transition-all shadow-xs"
                      >
                        <div className="flex items-center gap-2">
                          <FolderDown className="w-4 h-4 text-indigo-400" />
                          <span className="font-semibold text-xs">CapturePro-Windows.zip</span>
                        </div>
                        <span className="text-[10px] bg-indigo-600 px-2 py-0.5 rounded text-white font-mono font-medium">
                          Custom Icon &amp; Launcher
                        </span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Linux Card */}
                <div className="p-4 bg-neutral-950/70 border border-neutral-800 rounded-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-white font-semibold text-sm">
                        <Cpu className="w-4 h-4 text-amber-400" />
                        <span>Linux</span>
                      </div>
                      <span className="text-[10px] text-neutral-500 font-mono">x86_64 / amd64</span>
                    </div>
                    <p className="text-neutral-400 text-xs mb-3">
                      Includes desktop icon &amp; shortcut setup prompt. Product by Gowin.
                    </p>
                    <div className="space-y-2">
                      <a
                        href="/downloads/CapturePro_1.0.0_amd64.deb"
                        download="CapturePro_1.0.0_amd64.deb"
                        className="w-full flex items-center justify-between p-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/50 rounded-lg text-white transition-all shadow-xs"
                      >
                        <div className="flex items-center gap-2">
                          <FolderDown className="w-4 h-4 text-emerald-400" />
                          <span className="font-semibold text-xs">CapturePro_1.0.0_amd64.deb</span>
                        </div>
                        <span className="text-[10px] bg-indigo-600 px-2 py-0.5 rounded text-white font-mono font-medium">
                          Direct .deb
                        </span>
                      </a>

                      <a
                        href="/downloads/CapturePro-Linux-Desktop.tar.gz"
                        download="CapturePro-Linux-Desktop.tar.gz"
                        className="w-full flex items-center justify-between p-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 rounded-lg text-neutral-200 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Download className="w-4 h-4 text-amber-400" />
                          <span className="font-medium text-xs">CapturePro-Linux-Desktop.tar.gz</span>
                        </div>
                        <span className="text-[10px] bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-400 font-mono">
                          Universal
                        </span>
                      </a>

                      <a
                        href="/downloads/install-linux.sh"
                        download="install-linux.sh"
                        className="w-full flex items-center justify-between p-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 rounded-lg text-neutral-200 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Terminal className="w-4 h-4 text-neutral-400" />
                          <span className="font-medium text-xs">install-linux.sh (Quick Script)</span>
                        </div>
                        <span className="text-[10px] bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-400 font-mono">
                          Installer
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Automated GitHub Actions CI/CD explanation */}
              <div className="p-4 bg-neutral-950/60 rounded-xl border border-neutral-800 space-y-2">
                <div className="flex items-center gap-2 text-neutral-200 font-semibold text-xs">
                  <Zap className="w-4 h-4 text-indigo-400" />
                  <span>Automated GitHub Release Pipeline Included</span>
                </div>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  The repository includes an automated workflow at{' '}
                  <code className="text-indigo-400 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800 font-mono">
                    .github/workflows/build-desktop.yml
                  </code>
                  . Whenever you push to your GitHub repo and publish a tag (e.g.{' '}
                  <code className="font-mono text-neutral-300">git tag v1.0.0 &amp;&amp; git push --tags</code>
                  ), GitHub Actions automatically spins up Windows &amp; Ubuntu runners, compiles
                  the binaries, and publishes the downloadable <code className="font-mono text-indigo-300">.exe</code>,{' '}
                  <code className="font-mono text-amber-300">.AppImage</code>, and{' '}
                  <code className="font-mono text-amber-300">.deb</code> files directly into your GitHub Releases tab!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'pwa' && (
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
                      desc: 'Launch directly from your Windows taskbar, Linux app menu, or desktop icon.',
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
            </div>
          )}

          {activeTab === 'cli' && (
            <div className="space-y-4">
              <p className="text-neutral-300 leading-relaxed">
                You can also compile your own standalone executables directly on your machine using
                the preconfigured npm scripts in <code className="text-indigo-400 font-mono">package.json</code>:
              </p>

              {/* Windows Build Command */}
              <div className="p-3.5 bg-neutral-950/60 rounded-xl border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-200 text-xs flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-indigo-400" />
                    <span>Build Windows .exe (Installer &amp; Portable)</span>
                  </span>
                  <button
                    onClick={() =>
                      handleCopy('npm run desktop:build:win', 'cli_win')
                    }
                    className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white"
                  >
                    {copiedCommand === 'cli_win' ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedCommand === 'cli_win' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="bg-neutral-950 text-indigo-300 p-2.5 rounded-lg border border-neutral-800 font-mono text-[11px] overflow-x-auto">
                  npm run desktop:build:win
                </pre>
                <p className="text-[11px] text-neutral-500">
                  Outputs <code className="text-neutral-300">release/CapturePro-Setup-1.0.0.exe</code>.
                </p>
              </div>

              {/* Linux Build Command */}
              <div className="p-3.5 bg-neutral-950/60 rounded-xl border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-200 text-xs flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-amber-400" />
                    <span>Build Linux .AppImage &amp; .deb</span>
                  </span>
                  <button
                    onClick={() =>
                      handleCopy('npm run desktop:build:linux', 'cli_linux')
                    }
                    className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white"
                  >
                    {copiedCommand === 'cli_linux' ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedCommand === 'cli_linux' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="bg-neutral-950 text-amber-300 p-2.5 rounded-lg border border-neutral-800 font-mono text-[11px] overflow-x-auto">
                  npm run desktop:build:linux
                </pre>
                <p className="text-[11px] text-neutral-500">
                  Outputs <code className="text-neutral-300">release/CapturePro-1.0.0.AppImage</code> and <code className="text-neutral-300">release/CapturePro_1.0.0_amd64.deb</code>.
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
