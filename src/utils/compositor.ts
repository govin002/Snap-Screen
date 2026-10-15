import { CamPosition, CamShape } from '../types';

export interface CompositorOptions {
  canvas: HTMLCanvasElement;
  screenWidth: number;
  screenHeight: number;
  fps: number;
  screenVideo: HTMLVideoElement | null;
  camVideo: HTMLVideoElement | null;
  camPosition: CamPosition;
  camShape: CamShape;
  camSizePercent: number; // e.g. 20 (meaning 20% of canvas width)
  camMirrored: boolean;
  highlightClicks: boolean;
}

export class VideoCompositor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private screenVideo: HTMLVideoElement | null = null;
  private camVideo: HTMLVideoElement | null = null;
  private animationFrameId: number | null = null;
  private running = false;
  
  public camPosition: CamPosition = 'bottom-right';
  public camShape: CamShape = 'circle';
  public camSizePercent = 20;
  public camMirrored = true;
  public highlightClicks = false;

  private clicks: { x: number; y: number; time: number }[] = [];

  constructor(canvas: HTMLCanvasElement, width: number, height: number) {
    this.canvas = canvas;
    this.canvas.width = width;
    this.canvas.height = height;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Could not get 2D context from canvas');
    this.ctx = context;

    // Listen to click pulses on the document or preview
    window.addEventListener('click', this.handleClickPulse);
  }

  private handleClickPulse = (e: MouseEvent) => {
    if (!this.highlightClicks) return;
    this.clicks.push({
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    });
  };

  public setSources(screenVideo: HTMLVideoElement | null, camVideo: HTMLVideoElement | null) {
    this.screenVideo = screenVideo;
    this.camVideo = camVideo;
  }

  public updateConfig(options: Partial<CompositorOptions>) {
    if (options.camPosition) this.camPosition = options.camPosition;
    if (options.camShape) this.camShape = options.camShape;
    if (options.camSizePercent) this.camSizePercent = options.camSizePercent;
    if (options.camMirrored !== undefined) this.camMirrored = options.camMirrored;
    if (options.highlightClicks !== undefined) this.highlightClicks = options.highlightClicks;
    if (options.screenWidth && options.screenHeight) {
      this.canvas.width = options.screenWidth;
      this.canvas.height = options.screenHeight;
    }
  }

  public start() {
    if (this.running) return;
    this.running = true;
    this.renderLoop();
  }

  public stop() {
    this.running = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    window.removeEventListener('click', this.handleClickPulse);
  }

  private renderLoop = () => {
    if (!this.running) return;
    this.renderFrame();
    this.animationFrameId = requestAnimationFrame(this.renderLoop);
  };

  private renderFrame() {
    const { width, height } = this.canvas;
    const ctx = this.ctx;

    // 1. Draw screen video or black background
    if (this.screenVideo && this.screenVideo.readyState >= 2) {
      // Calculate aspect ratio fit/fill
      ctx.drawImage(this.screenVideo, 0, 0, width, height);
    } else {
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Draw Webcam PiP overlay if available
    if (this.camVideo && this.camVideo.readyState >= 2) {
      const camW = Math.round(width * (this.camSizePercent / 100));
      const camH = this.camShape === 'circle' || this.camShape === 'square' ? camW : Math.round(camW * 0.75);
      const padding = 28;

      let camX = width - camW - padding;
      let camY = height - camH - padding;

      if (this.camPosition === 'bottom-left') {
        camX = padding;
        camY = height - camH - padding;
      } else if (this.camPosition === 'top-right') {
        camX = width - camW - padding;
        camY = padding;
      } else if (this.camPosition === 'top-left') {
        camX = padding;
        camY = padding;
      }

      ctx.save();

      // Shadow / border glow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 6;

      // Clip path for camShape
      ctx.beginPath();
      if (this.camShape === 'circle') {
        const radius = camW / 2;
        ctx.arc(camX + radius, camY + radius, radius, 0, Math.PI * 2);
      } else if (this.camShape === 'rounded') {
        const radius = 18;
        ctx.roundRect(camX, camY, camW, camH, radius);
      } else {
        ctx.rect(camX, camY, camW, camH);
      }
      ctx.closePath();
      ctx.clip();

      // Reset shadow for video drawing
      ctx.shadowColor = 'transparent';

      // Mirror mode if enabled
      if (this.camMirrored) {
        ctx.translate(camX + camW, camY);
        ctx.scale(-1, 1);
        ctx.drawImage(this.camVideo, 0, 0, camW, camH);
      } else {
        ctx.drawImage(this.camVideo, camX, camY, camW, camH);
      }

      ctx.restore();

      // Draw subtle border around webcam
      ctx.save();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#6366f1'; // Indigo accent
      ctx.beginPath();
      if (this.camShape === 'circle') {
        const radius = camW / 2;
        ctx.arc(camX + radius, camY + radius, radius, 0, Math.PI * 2);
      } else if (this.camShape === 'rounded') {
        ctx.roundRect(camX, camY, camW, camH, 18);
      } else {
        ctx.rect(camX, camY, camW, camH);
      }
      ctx.stroke();
      ctx.restore();
    }

    // 3. Render Click ripples if active
    if (this.highlightClicks && this.clicks.length > 0) {
      const now = Date.now();
      const maxAge = 600; // ms

      this.clicks = this.clicks.filter((c) => now - c.time < maxAge);

      for (const click of this.clicks) {
        const age = now - click.time;
        const progress = age / maxAge;
        const radius = 10 + progress * 40;
        const alpha = 1 - progress;

        ctx.save();
        ctx.beginPath();
        ctx.arc(click.x, click.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(244, 63, 94, ${alpha})`; // Rose color ripple
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  public getStream(fps: number): MediaStream {
    return this.canvas.captureStream(fps);
  }
}
