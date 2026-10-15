import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Video,
  Camera,
  Trash2,
  Download,
  Edit2,
  Check,
  Clock,
  HardDrive,
  ExternalLink,
} from 'lucide-react';
import { LibraryItem } from '../types';
import {
  getAllMediaItems,
  deleteMediaItem,
  updateMediaItemTitle,
  formatBytes,
  formatDuration,
} from '../utils/storage';
import { downloadBlob } from '../utils/capture';

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectItem: (item: LibraryItem) => void;
}

export const LibraryModal: React.FC<LibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectItem,
}) => {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'video' | 'screenshot'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const loadItems = async () => {
    const list = await getAllMediaItems();
    setItems(list);
  };

  useEffect(() => {
    if (isOpen) {
      loadItems();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredItems = items.filter((item) => {
    if (filter !== 'all' && item.type !== filter) return false;
    if (searchQuery.trim() && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteMediaItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleDownload = (e: React.MouseEvent, item: LibraryItem) => {
    e.stopPropagation();
    if (item.blob) {
      const ext = item.type === 'video' ? 'webm' : 'png';
      downloadBlob(item.blob, `${item.title}.${ext}`);
    }
  };

  const startRename = (e: React.MouseEvent, item: LibraryItem) => {
    e.stopPropagation();
    setEditingId(item.id);
    setEditTitle(item.title);
  };

  const saveRename = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      await updateMediaItemTitle(id, editTitle.trim());
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, title: editTitle.trim() } : i))
      );
    }
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/40">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>PC Media Library &amp; Recordings</span>
            </h2>
            <div className="text-xs text-neutral-400 mt-0.5">
              <span>{items.length} captures saved locally in browser</span>
              <span className="mx-2">·</span>
              <span>
                Total storage:{' '}
                {formatBytes(items.reduce((acc, curr) => acc + (curr.fileSize || 0), 0))}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="px-6 py-3 border-b border-neutral-800/80 bg-neutral-900/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Segmented filter */}
          <div className="flex items-center gap-1 p-1 bg-neutral-800/80 rounded-lg border border-neutral-700/60">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-neutral-700 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              All Media ({items.length})
            </button>
            <button
              onClick={() => setFilter('video')}
              className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
                filter === 'video'
                  ? 'bg-neutral-700 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Recordings ({items.filter((i) => i.type === 'video').length})</span>
            </button>
            <button
              onClick={() => setFilter('screenshot')}
              className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
                filter === 'screenshot'
                  ? 'bg-neutral-700 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Screenshots ({items.filter((i) => i.type === 'screenshot').length})</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search captures..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-neutral-950/80 text-white placeholder-neutral-500 pl-8 pr-3 py-1.5 rounded-lg border border-neutral-800 text-xs focus:outline-none focus:border-indigo-500 w-56"
            />
          </div>
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-neutral-400">
              <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-500 mb-3">
                <Video className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-neutral-300">No media found</p>
              <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                Record your PC screen or take a screenshot to see your items preserved here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className="group relative bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-xl overflow-hidden cursor-pointer flex flex-col transition-all hover:shadow-lg"
                >
                  {/* Thumbnail Container */}
                  <div className="relative aspect-video bg-neutral-900 flex items-center justify-center overflow-hidden">
                    {item.thumbnailUrl ? (
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="text-neutral-600">
                        {item.type === 'video' ? (
                          <Video className="w-10 h-10" />
                        ) : (
                          <Camera className="w-10 h-10" />
                        )}
                      </div>
                    )}

                    {/* Badge type */}
                    <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] text-neutral-300 font-mono">
                      {item.type === 'video' ? (
                        <>
                          <Video className="w-3 h-3 text-indigo-400" />
                          <span>{formatDuration(item.duration || 0)}</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-3 h-3 text-emerald-400" />
                          <span>PNG</span>
                        </>
                      )}
                    </div>

                    {/* Quick action buttons on hover */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleDownload(e, item)}
                        className="p-1.5 rounded-md bg-neutral-900/90 text-neutral-300 hover:text-white border border-neutral-700"
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, item.id)}
                        className="p-1.5 rounded-md bg-neutral-900/90 text-neutral-300 hover:text-rose-400 border border-neutral-700"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="p-3 flex flex-col gap-1.5 flex-1 justify-between bg-neutral-900/40">
                    {editingId === item.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="bg-neutral-950 border border-indigo-500 rounded px-1.5 py-0.5 text-xs text-white flex-1"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button
                          onClick={(e) => saveRename(e, item.id)}
                          className="p-1 text-emerald-400 hover:text-emerald-300"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-neutral-200 truncate" title={item.title}>
                          {item.title}
                        </h4>
                        <button
                          onClick={(e) => startRename(e, item)}
                          className="text-neutral-500 hover:text-neutral-300 p-0.5"
                          title="Rename"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-neutral-500">
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      <span className="font-mono">{formatBytes(item.fileSize)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
