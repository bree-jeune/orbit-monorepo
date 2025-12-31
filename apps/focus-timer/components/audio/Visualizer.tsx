import React, { useRef, useEffect } from 'react';
import { audioEngine } from '@orbit/core';
import { useStore } from '../../stores/useStore';

export function Visualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isPlaying = useStore((s) => s.isPlaying);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const analyzer = audioEngine.getAnalyzer();
    if (!analyzer) return;

    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationId = requestAnimationFrame(draw);
      analyzer.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const val = dataArray[i];
        const percent = val / 255;
        const barHeight = percent * canvas.height * (i < 10 ? 1.2 : 1.0);

        // Dynamic colors: Lows (purple/nebula) to Highs (cyan/aurora)
        const hue = 260 - (i / bufferLength) * 80; // 260 (purple) to 180 (cyan)
        const alpha = 0.2 + percent * 0.6;

        ctx.shadowBlur = 10 * percent;
        ctx.shadowColor = `hsla(${hue}, 70%, 50%, ${alpha})`;
        ctx.fillStyle = `hsla(${hue}, 70%, 50%, ${alpha})`;

        // Draw bars as rounded capsules or circles? Capsules are better for bars.
        const r = 3;
        const w = barWidth - 3;
        const h = Math.max(2, barHeight);
        const y = canvas.height - h;

        // Draw centered vertically or from bottom? Bottom is standard.
        // Let's make them slightly rounded capsules.
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, [r, r, 0, 0]);
        ctx.fill();

        x += barWidth;
      }
    };

    if (isPlaying) {
      draw();
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    return () => cancelAnimationFrame(animationId);
  }, [isPlaying]);

  useEffect(() => {
    const resize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
      }
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      height={120}
      className="w-full h-full pointer-events-none"
    />
  );
}
