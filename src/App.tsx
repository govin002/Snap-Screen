import React, { useState, useEffect } from 'react';
import {
  Video,
  Camera,
  FolderArchive,
  Keyboard,
  FileText,
  MonitorPlay,
  Layers,
} from 'lucide-react';
import { ActiveTab, LibraryItem } from './types';
import { RecorderDashboard } from './components/RecorderDashboard';
import { SnippingStudio } from './components/ScreenCapture/SnippingStudio';
import { LibraryModal } from './components/LibraryModal';
import { VideoPlayerModal } from './components/VideoStudio/VideoPlayerModal';
import { Teleprompter } from './components/Teleprompter';
import { ShortcutsModal } from './components/ShortcutsModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('recorder');
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isTeleprompterOpen, setIsTeleprompterOpen] = useState(false);

  // Active video in player modal
  const [activeVideoItem, setActiveVideoItem] = useState<LibraryItem | null>(null);

  // Transfer image from video frame snap or library into SnippingStudio
  const [snippingInitialImage, setSnippingInitialImage] = useState<string | null>(null);

  // Global hotkeys listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      if (e.key === 't' && e.altKey) {
        e.preventDefault();
        setIsTeleprompterOpen((prev) => !prev);
      } else if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsLibraryOpen(false);
        setIsShortcutsOpen(false);
        setActiveVideoItem(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleRecordingFinished = (item: LibraryItem) => {
    setActiveVideoItem(item);
  };

  const handleSelectItemFromLibrary = (item: LibraryItem) => {
    setIsLibraryOpen(false);
    if (item.type === 'video') {
      setActiveVideoItem(item);
    } else if (item.type === 'screenshot') {
      if (item.dataUrl) {
        setSnippingInitialImage(item.dataUrl);
      } else if (item.blob) {
        const url = URL.createObjectURL(item.blob);
        setSnippingInitialImage(url);
      }
      setActiveTab('capture');
    }
  };

  const handleOpenFrameInSnipping = (imageDataUrl: string) => {
    setSnippingInitialImage(imageDataUrl);
    setActiveTab('capture');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* 3-Zone Top Bar Contract */}
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-40">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-900/40">
            <MonitorPlay className="w-4 h-4" />
          </div>
          <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
            CapturePro PC
          </span>
        </div>

        {/* Zone 2: Concise single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-neutral-400">
          <button
            onClick={() => setActiveTab('recorder')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'recorder' ? 'text-white font-semibold' : 'hover:text-neutral-200'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-indigo-400" />
            <span>Screen Recorder</span>
          </button>

          <button
            onClick={() => setActiveTab('capture')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'capture' ? 'text-white font-semibold' : 'hover:text-neutral-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-emerald-400" />
            <span>Snipping Studio</span>
          </button>

          <button
            onClick={() => setIsLibraryOpen(true)}
            className="flex items-center gap-1.5 transition-colors hover:text-neutral-200 whitespace-nowrap shrink-0"
          >
            <FolderArchive className="w-3.5 h-3.5 text-amber-400" />
            <span>Library</span>
          </button>

          <button
            onClick={() => setIsTeleprompterOpen((prev) => !prev)}
            className="flex items-center gap-1.5 transition-colors hover:text-neutral-200 whitespace-nowrap shrink-0"
          >
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            <span>Teleprompter</span>
          </button>

          <button
            onClick={() => setIsShortcutsOpen(true)}
            className="flex items-center gap-1.5 transition-colors hover:text-neutral-200 whitespace-nowrap shrink-0"
          >
            <Keyboard className="w-3.5 h-3.5 text-neutral-400" />
            <span>Shortcuts</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action button & quick help */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsShortcutsOpen(true)}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg border border-neutral-800 transition-colors"
            title="Help, Shortcuts & Audio Guide (?)"
          >
            <span className="font-mono text-xs font-bold w-4 h-4 flex items-center justify-center">?</span>
          </button>
          {activeTab === 'recorder' ? (
            <button
              onClick={() => setActiveTab('capture')}
              className="px-4 py-2 text-xs font-semibold text-neutral-200 bg-neutral-800 hover:bg-neutral-700 rounded-lg border border-neutral-700 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              <span>Take Screenshot</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('recorder')}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Record Screen</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Viewport Content */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'recorder' ? (
          <RecorderDashboard
            onRecordingFinished={handleRecordingFinished}
            onOpenTeleprompter={() => setIsTeleprompterOpen(true)}
            onOpenShortcuts={() => setIsShortcutsOpen(true)}
            onSwitchToSnipping={() => setActiveTab('capture')}
          />
        ) : (
          <SnippingStudio
            initialImageData={snippingInitialImage}
            onSavedToLibrary={() => {}}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800/60 px-6 py-3 flex flex-wrap items-center justify-between text-xs text-neutral-400 bg-neutral-950">
        <div className="flex items-center gap-2">
          <span>CapturePro PC Studio</span>
          <span aria-hidden="true">·</span>
          <span>Screen Recording &amp; Snipping Tools</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>100% Local Hardware Accelerated</span>
          <span aria-hidden="true">·</span>
          <button
            onClick={() => setIsShortcutsOpen(true)}
            className="hover:text-neutral-200 underline underline-offset-2"
          >
            PC Shortcuts &amp; Audio Guide
          </button>
        </div>
      </footer>

      {/* Floating Presenter Teleprompter */}
      <Teleprompter
        isOpen={isTeleprompterOpen}
        onClose={() => setIsTeleprompterOpen(false)}
      />

      {/* PC Shortcuts Guide Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Media Library & History Modal */}
      <LibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelectItem={handleSelectItemFromLibrary}
      />

      {/* Video Review & Trimming Studio Modal */}
      {activeVideoItem && (
        <VideoPlayerModal
          item={activeVideoItem}
          onClose={() => setActiveVideoItem(null)}
          onOpenInSnipping={handleOpenFrameInSnipping}
          onTrimSaved={(newItem) => {
            setActiveVideoItem(newItem);
          }}
        />
      )}
    </div>
  );
}
