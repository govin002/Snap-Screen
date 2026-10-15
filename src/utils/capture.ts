import { AnnotationElement } from '../types';

export async function takeDisplayScreenshot(): Promise<{
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
}> {
  // Capture screen media stream
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: {
      displaySurface: 'monitor',
    },
    audio: false,
  });

  const video = document.createElement('video');
  video.srcObject = stream;
  video.muted = true;
  await video.play();

  // Wait for video frame to be ready
  await new Promise((resolve) => {
    if (video.readyState >= 2) resolve(true);
    else video.onloadeddata = () => resolve(true);
  });

  const width = video.videoWidth || 1920;
  const height = video.videoHeight || 1080;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create canvas context');

  ctx.drawImage(video, 0, 0, width, height);

  // Clean up streams right after snapshot
  stream.getTracks().forEach((track) => track.stop());
  video.pause();
  video.srcObject = null;

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error('Failed to convert canvas to blob'));
    }, 'image/png');
  });

  const dataUrl = canvas.toDataURL('image/png');

  return { dataUrl, blob, width, height };
}

export async function copyBlobToClipboard(blob: Blob): Promise<boolean> {
  try {
    if (navigator.clipboard && window.ClipboardItem) {
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type || 'image/png']: blob }),
      ]);
      return true;
    }
  } catch (err) {
    console.warn('Clipboard write failed, attempting fallback:', err);
  }
  return false;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Draws annotations onto the canvas
 */
export function drawAnnotation(
  ctx: CanvasRenderingContext2D,
  el: AnnotationElement,
  baseImage: HTMLImageElement | null
) {
  ctx.save();

  if (el.tool === 'pen' && el.points && el.points.length > 1) {
    ctx.strokeStyle = el.color;
    ctx.lineWidth = el.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(el.points[0].x, el.points[0].y);
    for (let i = 1; i < el.points.length; i++) {
      ctx.lineTo(el.points[i].x, el.points[i].y);
    }
    ctx.stroke();
  } else if (el.tool === 'highlighter' && el.points && el.points.length > 1) {
    ctx.strokeStyle = el.color;
    ctx.lineWidth = Math.max(16, el.strokeWidth * 3);
    ctx.lineCap = 'square';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.moveTo(el.points[0].x, el.points[0].y);
    for (let i = 1; i < el.points.length; i++) {
      ctx.lineTo(el.points[i].x, el.points[i].y);
    }
    ctx.stroke();
  } else if (el.tool === 'rect' && el.start && el.end) {
    const x = Math.min(el.start.x, el.end.x);
    const y = Math.min(el.start.y, el.end.y);
    const w = Math.abs(el.end.x - el.start.x);
    const h = Math.abs(el.end.y - el.start.y);

    if (el.fill) {
      ctx.fillStyle = el.color + '40'; // semi-transparent
      ctx.fillRect(x, y, w, h);
    }
    ctx.strokeStyle = el.color;
    ctx.lineWidth = el.strokeWidth;
    ctx.strokeRect(x, y, w, h);
  } else if (el.tool === 'circle' && el.start && el.end) {
    const rx = Math.abs(el.end.x - el.start.x) / 2;
    const ry = Math.abs(el.end.y - el.start.y) / 2;
    const cx = Math.min(el.start.x, el.end.x) + rx;
    const cy = Math.min(el.start.y, el.end.y) + ry;

    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    if (el.fill) {
      ctx.fillStyle = el.color + '40';
      ctx.fill();
    }
    ctx.strokeStyle = el.color;
    ctx.lineWidth = el.strokeWidth;
    ctx.stroke();
  } else if (el.tool === 'arrow' && el.start && el.end) {
    ctx.strokeStyle = el.color;
    ctx.fillStyle = el.color;
    ctx.lineWidth = el.strokeWidth;
    ctx.lineCap = 'round';

    const dx = el.end.x - el.start.x;
    const dy = el.end.y - el.start.y;
    const angle = Math.atan2(dy, dx);
    const headLen = Math.max(14, el.strokeWidth * 3.5);

    // Shaft
    ctx.beginPath();
    ctx.moveTo(el.start.x, el.start.y);
    ctx.lineTo(el.end.x, el.end.y);
    ctx.stroke();

    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(el.end.x, el.end.y);
    ctx.lineTo(
      el.end.x - headLen * Math.cos(angle - Math.PI / 6),
      el.end.y - headLen * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      el.end.x - headLen * Math.cos(angle + Math.PI / 6),
      el.end.y - headLen * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
  } else if (el.tool === 'step' && el.start) {
    const radius = Math.max(16, el.strokeWidth * 3);
    // Draw badge background
    ctx.beginPath();
    ctx.arc(el.start.x, el.start.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = el.color;
    ctx.fill();

    // White border
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Draw step number
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(radius * 1.1)}px 'Plus Jakarta Sans', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${el.stepNumber || 1}`, el.start.x, el.start.y + 1);
  } else if (el.tool === 'text' && el.start && el.text) {
    const fontSize = el.fontSize || 20;
    ctx.font = `600 ${fontSize}px 'Plus Jakarta Sans', sans-serif`;
    const metrics = ctx.measureText(el.text);
    const paddingX = 8;
    const paddingY = 4;
    const textHeight = fontSize;

    // Background tag
    ctx.fillStyle = 'rgba(10, 10, 10, 0.85)';
    ctx.strokeStyle = el.color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(
      el.start.x - paddingX,
      el.start.y - textHeight - paddingY,
      metrics.width + paddingX * 2,
      textHeight + paddingY * 2,
      4
    );
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = el.color;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(el.text, el.start.x, el.start.y);
  } else if (el.tool === 'blur' && el.start && el.end && baseImage) {
    // Pixelate redaction mosaic
    const x = Math.min(el.start.x, el.end.x);
    const y = Math.min(el.start.y, el.end.y);
    const w = Math.abs(el.end.x - el.start.x);
    const h = Math.abs(el.end.y - el.start.y);

    if (w > 2 && h > 2) {
      const blockSize = 10;
      // Get image data in that region
      try {
        const imgData = ctx.getImageData(x, y, w, h);
        for (let py = 0; py < h; py += blockSize) {
          for (let px = 0; px < w; px += blockSize) {
            const pixelIndex = (py * w + px) * 4;
            const r = imgData.data[pixelIndex];
            const g = imgData.data[pixelIndex + 1];
            const b = imgData.data[pixelIndex + 2];
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(x + px, y + py, blockSize, blockSize);
          }
        }
      } catch (err) {
        // Fallback to solid redaction box
        ctx.fillStyle = '#171717';
        ctx.fillRect(x, y, w, h);
      }
      ctx.strokeStyle = '#525252';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, w, h);
    }
  } else if (el.tool === 'loupe' && el.start && baseImage) {
    // Circular magnifier
    const radius = 60;
    const zoom = 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(el.start.x, el.start.y, radius, 0, Math.PI * 2);
    ctx.clip();

    ctx.drawImage(
      baseImage,
      el.start.x - radius / zoom,
      el.start.y - radius / zoom,
      (radius * 2) / zoom,
      (radius * 2) / zoom,
      el.start.x - radius,
      el.start.y - radius,
      radius * 2,
      radius * 2
    );

    ctx.restore();

    // Loupe ring
    ctx.beginPath();
    ctx.arc(el.start.x, el.start.y, radius, 0, Math.PI * 2);
    ctx.lineWidth = 3;
    ctx.strokeStyle = el.color;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 10;
    ctx.stroke();
  }

  ctx.restore();
}
