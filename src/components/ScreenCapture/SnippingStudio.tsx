import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  MousePointer,
  Pen,
  Highlighter,
  ArrowUpRight,
  Square,
  Circle,
  Hash,
  Type,
  EyeOff,
  Search,
  Undo2,
  Redo2,
  Trash2,
  Copy,
  Download,
  Check,
  Camera,
  Timer,
  Upload,
  Crop,
} from 'lucide-react';
import { AnnotationTool, AnnotationElement, LibraryItem } from '../../types';
import {
  takeDisplayScreenshot,
  copyBlobToClipboard,
  downloadBlob,
  drawAnnotation,
} from '../../utils/capture';
import { saveMediaItem } from '../../utils/storage';

const PRESET_COLORS = [
  '#f43f5e', // Rose / Red
  '#f59e0b', // Amber / Orange
  '#10b981', // Emerald / Green
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#ffffff', // White
  '#0a0a0a', // Black
];

export const SnippingStudio: React.FC<{
  onSavedToLibrary?: (item: LibraryItem) => void;
  initialImageData?: string | null;
}> = ({ onSavedToLibrary, initialImageData }) => {
  const [currentImage, setCurrentImage] = useState<string | null>(initialImageData || null);
  const [baseImageObj, setBaseImageObj] = useState<HTMLImageElement | null>(null);

  // Tools & Settings
  const [activeTool, setActiveTool] = useState<AnnotationTool>('arrow');
  const [currentColor, setCurrentColor] = useState<string>('#f43f5e');
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [fontSize, setFontSize] = useState<number>(20);
  const [stepCounter, setStepCounter] = useState<number>(1);
  const [fillShape, setFillShape] = useState<boolean>(false);

  // Text tool input prompt
  const [textInputPos, setTextInputPos] = useState<{ x: number; y: number } | null>(null);
  const [textInputValue, setTextInputValue] = useState<string>('');

  // History stack for Undo/Redo
  const [elements, setElements] = useState<AnnotationElement[]>([]);
  const [redoStack, setRedoStack] = useState<AnnotationElement[][]>([]);

  // Capture timer state
  const [countdown, setCountdown] = useState<number | null>(null);
  const [delaySec, setDelaySec] = useState<number>(0);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // References
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const currentElementRef = useRef<AnnotationElement | null>(null);

  // Load image into HTMLImageElement
  useEffect(() => {
    if (!currentImage) {
      setBaseImageObj(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setBaseImageObj(img);
      setElements([]);
      setRedoStack([]);
      setStepCounter(1);
    };
    img.src = currentImage;
  }, [currentImage]);

  // Redraw canvas whenever baseImage or elements change
  const renderCanvas = useCallback(
    (tempElement?: AnnotationElement | null) => {
      const canvas = canvasRef.current;
      if (!canvas || !baseImageObj) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = baseImageObj.naturalWidth;
      canvas.height = baseImageObj.naturalHeight;

      // Draw base image
      ctx.drawImage(baseImageObj, 0, 0);

      // Draw all saved annotations
      for (const el of elements) {
        drawAnnotation(ctx, el, baseImageObj);
      }

      // Draw active in-progress annotation
      if (tempElement) {
        drawAnnotation(ctx, tempElement, baseImageObj);
      }
    },
    [baseImageObj, elements]
  );

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Timed or instant screen capture
  const handleCaptureScreen = async (delay = 0) => {
    if (delay > 0) {
      setCountdown(delay);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            executeCapture();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      executeCapture();
    }
  };

  const executeCapture = async () => {
    setIsCapturing(true);
    try {
      const res = await takeDisplayScreenshot();
      setCurrentImage(res.dataUrl);
    } catch (err) {
      console.warn('Screen capture cancelled or failed:', err);
    } finally {
      setIsCapturing(false);
      setCountdown(null);
    }
  };

  // Paste from clipboard handler
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result) {
                setCurrentImage(event.target.result as string);
              }
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Mouse coordinate mapping (canvas internal coordinates vs client rect)
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: Math.round((e.clientX - rect.left) * scaleX),
      y: Math.round((e.clientY - rect.top) * scaleY),
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!baseImageObj) return;
    const pos = getCanvasCoords(e);
    isDrawingRef.current = true;

    if (activeTool === 'text') {
      setTextInputPos(pos);
      setTextInputValue('');
      isDrawingRef.current = false;
      return;
    }

    if (activeTool === 'step') {
      const newStep: AnnotationElement = {
        id: `step_${Date.now()}`,
        tool: 'step',
        color: currentColor,
        strokeWidth,
        start: pos,
        stepNumber: stepCounter,
      };
      setElements((prev) => [...prev, newStep]);
      setStepCounter((prev) => prev + 1);
      setRedoStack([]);
      isDrawingRef.current = false;
      return;
    }

    if (activeTool === 'pen' || activeTool === 'highlighter') {
      currentElementRef.current = {
        id: `draw_${Date.now()}`,
        tool: activeTool,
        color: currentColor,
        strokeWidth,
        points: [pos],
      };
    } else {
      currentElementRef.current = {
        id: `shape_${Date.now()}`,
        tool: activeTool,
        color: currentColor,
        strokeWidth,
        start: pos,
        end: pos,
        fill: fillShape,
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !currentElementRef.current) return;
    const pos = getCanvasCoords(e);

    if (activeTool === 'pen' || activeTool === 'highlighter') {
      currentElementRef.current.points?.push(pos);
    } else {
      currentElementRef.current.end = pos;
    }

    renderCanvas(currentElementRef.current);
  };

  const handleMouseUp = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    if (currentElementRef.current) {
      setElements((prev) => [...prev, currentElementRef.current!]);
      setRedoStack([]);
      currentElementRef.current = null;
    }
  };

  const handleAddText = () => {
    if (!textInputPos || !textInputValue.trim()) {
      setTextInputPos(null);
      return;
    }

    const textEl: AnnotationElement = {
      id: `text_${Date.now()}`,
      tool: 'text',
      color: currentColor,
      strokeWidth,
      start: textInputPos,
      text: textInputValue.trim(),
      fontSize,
    };

    setElements((prev) => [...prev, textEl]);
    setRedoStack([]);
    setTextInputPos(null);
    setTextInputValue('');
  };

  const handleUndo = () => {
    if (elements.length === 0) return;
    const last = elements[elements.length - 1];
    setRedoStack((prev) => [...prev, elements]);
    setElements((prev) => prev.slice(0, -1));
    if (last.tool === 'step' && stepCounter > 1) {
      setStepCounter((prev) => prev - 1);
    }
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setElements(nextState);
  };

  const handleClearAll = () => {
    if (elements.length === 0) return;
    setRedoStack((prev) => [...prev, elements]);
    setElements([]);
    setStepCounter(1);
  };

  // Export current annotated image to PNG blob
  const getAnnotatedBlob = async (): Promise<Blob | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  };

  // One-click Copy to PC Clipboard
  const handleCopyToClipboard = async () => {
    const blob = await getAnnotatedBlob();
    if (!blob) return;

    const ok = await copyBlobToClipboard(blob);
    if (ok) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2200);
    }
  };

  // Download image with timestamp
  const handleDownloadImage = async (format: 'png' | 'jpeg' | 'webp' = 'png') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10);
        const timeStr = now.toTimeString().slice(0, 5).replace(':', '-');
        downloadBlob(blob, `Capture_${dateStr}_${timeStr}.${format}`);
      },
      `image/${format}`,
      0.95
    );
  };

  // Save to IndexedDB Library
  const handleSaveToLibrary = async () => {
    const blob = await getAnnotatedBlob();
    const canvas = canvasRef.current;
    if (!blob || !canvas) return;

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 5).replace(':', '-');
    const title = `Capture_${dateStr}_${timeStr}`;

    const item: LibraryItem = {
      id: `cap_${Date.now()}`,
      type: 'screenshot',
      title,
      createdAt: Date.now(),
      blob,
      thumbnailUrl: canvas.toDataURL('image/jpeg', 0.6),
      fileSize: blob.size,
      dimensions: { width: canvas.width, height: canvas.height },
      mimeType: 'image/png',
    };

    await saveMediaItem(item);
    if (onSavedToLibrary) onSavedToLibrary(item);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-neutral-100 select-none">
      {/* Top Banner when countdown is active */}
      {countdown !== null && (
        <div className="bg-amber-600 text-white text-center py-2 px-4 font-semibold text-sm flex items-center justify-center gap-2 animate-pulse shadow-md">
          <Timer className="w-4 h-4" />
          <span>
            Capturing screen in {countdown}s... Switch to your target PC window or dropdown now!
          </span>
        </div>
      )}

      {/* Main Studio Header & Mode Triggers */}
      <div className="border-b border-neutral-800 px-6 py-3 flex flex-wrap items-center justify-between gap-4 bg-neutral-900/60 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleCaptureScreen(0)}
            disabled={isCapturing}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg shadow-sm transition-all active:scale-95 whitespace-nowrap"
          >
            <Camera className="w-4 h-4" />
            <span>Snap PC Screen</span>
          </button>

          {/* Delay capture selector */}
          <div className="flex items-center gap-1.5 bg-neutral-800/80 p-1 rounded-lg border border-neutral-700/60 text-xs text-neutral-300">
            <Timer className="w-3.5 h-3.5 text-neutral-400 ml-1.5" />
            <span className="text-[11px] text-neutral-400">Delay:</span>
            {[
              { label: '0s', val: 0 },
              { label: '3s', val: 3 },
              { label: '5s', val: 5 },
              { label: '10s', val: 10 },
            ].map((d) => (
              <button
                key={d.val}
                onClick={() => {
                  setDelaySec(d.val);
                  if (d.val > 0) handleCaptureScreen(d.val);
                  else handleCaptureScreen(0);
                }}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  delaySec === d.val
                    ? 'bg-neutral-700 text-white font-semibold'
                    : 'hover:text-white'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Upload file fallback */}
          <label className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs rounded-lg cursor-pointer border border-neutral-700/60 transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>Open Image</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    if (ev.target?.result) setCurrentImage(ev.target.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </label>
        </div>

        {/* Right side Output & Clipboard Actions */}
        {currentImage && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyToClipboard}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                copySuccess
                  ? 'bg-emerald-600 border-emerald-500 text-white'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
              }`}
              title="Copy screenshot directly to PC clipboard (Ctrl+V into any app)"
            >
              {copySuccess ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copySuccess ? 'Copied to Clipboard!' : 'Copy to Clipboard'}</span>
            </button>

            <button
              onClick={() => handleDownloadImage('png')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-medium rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PNG</span>
            </button>

            <button
              onClick={handleSaveToLibrary}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-medium rounded-lg transition-colors"
            >
              <span>Save to Library</span>
            </button>
          </div>
        )}
      </div>

      {/* Editor Main Canvas Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* If image is loaded, show the Floating Annotation Toolbar */}
        {currentImage && (
          <div className="w-full md:w-64 border-r border-neutral-800 bg-neutral-900/90 p-3 flex flex-col gap-4 overflow-y-auto shrink-0 text-xs">
            {/* Tools Grid */}
            <div>
              <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Markup Tools
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'select' as AnnotationTool, icon: MousePointer, label: 'Select' },
                  { id: 'arrow' as AnnotationTool, icon: ArrowUpRight, label: 'Arrow' },
                  { id: 'rect' as AnnotationTool, icon: Square, label: 'Box' },
                  { id: 'circle' as AnnotationTool, icon: Circle, label: 'Oval' },
                  { id: 'pen' as AnnotationTool, icon: Pen, label: 'Pen' },
                  { id: 'highlighter' as AnnotationTool, icon: Highlighter, label: 'Marker' },
                  { id: 'step' as AnnotationTool, icon: Hash, label: 'Step ①' },
                  { id: 'text' as AnnotationTool, icon: Type, label: 'Text' },
                  { id: 'blur' as AnnotationTool, icon: EyeOff, label: 'Pixelate' },
                  { id: 'loupe' as AnnotationTool, icon: Search, label: 'Loupe' },
                ].map((t) => {
                  const Icon = t.icon;
                  const isActive = activeTool === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTool(t.id)}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                        isActive
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold shadow-sm'
                          : 'border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-neutral-200'
                      }`}
                      title={t.label}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span className="text-[10px]">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Palette */}
            <div>
              <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Color
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrentColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      currentColor === c ? 'scale-110 border-white shadow-md' : 'border-neutral-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Stroke Width Slider */}
            <div>
              <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1.5">
                <span>Thickness</span>
                <span className="font-mono text-neutral-300">{strokeWidth}px</span>
              </div>
              <input
                type="range"
                min="2"
                max="16"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                className="w-full h-1.5 accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Shape Fill toggle if Box or Oval */}
            {(activeTool === 'rect' || activeTool === 'circle') && (
              <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={fillShape}
                  onChange={(e) => setFillShape(e.target.checked)}
                  className="rounded accent-indigo-500"
                />
                <span>Fill shape with tint</span>
              </label>
            )}

            {/* Step Counter info if Step tool is active */}
            {activeTool === 'step' && (
              <div className="bg-neutral-800/80 p-2 rounded-lg border border-neutral-700/60 flex items-center justify-between">
                <span>Next badge:</span>
                <span
                  style={{ backgroundColor: currentColor }}
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold text-[11px]"
                >
                  {stepCounter}
                </span>
              </div>
            )}

            {/* Text size if text tool active */}
            {activeTool === 'text' && (
              <div>
                <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
                  <span>Font Size</span>
                  <span className="font-mono">{fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="14"
                  max="36"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full h-1.5 accent-indigo-500 cursor-pointer"
                />
              </div>
            )}

            {/* Undo / Redo / Clear Actions */}
            <div className="mt-auto pt-3 border-t border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button
                  onClick={handleUndo}
                  disabled={elements.length === 0}
                  className="p-1.5 rounded border border-neutral-800 hover:border-neutral-700 disabled:opacity-40 text-neutral-300"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRedo}
                  disabled={redoStack.length === 0}
                  className="p-1.5 rounded border border-neutral-800 hover:border-neutral-700 disabled:opacity-40 text-neutral-300"
                  title="Redo (Ctrl+Y)"
                >
                  <Redo2 className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleClearAll}
                disabled={elements.length === 0}
                className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-rose-400 disabled:opacity-30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        )}

        {/* Canvas Display Viewport */}
        <div className="flex-1 bg-neutral-950 flex items-center justify-center p-4 overflow-auto relative">
          {currentImage ? (
            <div className="relative shadow-2xl rounded-lg overflow-hidden border border-neutral-800 max-w-full max-h-full">
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className="max-w-full max-h-[75vh] object-contain cursor-crosshair block"
              />

              {/* Floating text input box when placing text */}
              {textInputPos && canvasRef.current && (
                <div
                  style={{
                    position: 'absolute',
                    left: `${(textInputPos.x / canvasRef.current.width) * 100}%`,
                    top: `${(textInputPos.y / canvasRef.current.height) * 100}%`,
                  }}
                  className="z-30 bg-neutral-900 border border-indigo-500 p-1.5 rounded shadow-lg flex items-center gap-2 transform -translate-y-full"
                >
                  <input
                    type="text"
                    value={textInputValue}
                    onChange={(e) => setTextInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddText();
                      if (e.key === 'Escape') setTextInputPos(null);
                    }}
                    autoFocus
                    placeholder="Type note & hit Enter..."
                    className="bg-neutral-950 text-white text-xs px-2 py-1 rounded border border-neutral-700 outline-none w-48"
                  />
                  <button
                    onClick={handleAddText}
                    className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Empty State: Ready to Capture or Paste */
            <div className="max-w-lg text-center p-8 bg-neutral-900/40 rounded-2xl border border-neutral-800">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">Capture or Paste Screenshot</h2>
              <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
                Take an instant full screen or window snapshot, set a 3s/5s delay to capture
                drop-downs and hover menus, or press{' '}
                <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded border border-neutral-700 text-neutral-300 font-mono">
                  Ctrl+V
                </kbd>{' '}
                to paste any image from your PC clipboard.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => handleCaptureScreen(0)}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl shadow-lg transition-transform active:scale-95"
                >
                  Snap Screen Now
                </button>
                <button
                  onClick={() => handleCaptureScreen(3)}
                  className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-medium rounded-xl transition-colors"
                >
                  Snap with 3s Timer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
