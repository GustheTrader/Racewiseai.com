import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
}

const FireParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const createParticle = (): Particle => {
      const x = Math.random() * canvas.width;
      return {
        x,
        y: canvas.height + 10,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -Math.random() * 2 - 1,
        life: 0,
        maxLife: Math.random() * 150 + 100,
        size: Math.random() * 4 + 2,
        hue: Math.random() * 40 + 10, // 10-50 for orange/red range
      };
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Add new particles
      if (particlesRef.current.length < 60 && Math.random() > 0.85) {
        particlesRef.current.push(createParticle());
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter((p) => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy -= 0.01; // Float up
        p.vx += (Math.random() - 0.5) * 0.1; // Wobble

        const lifeRatio = p.life / p.maxLife;
        const alpha = 1 - lifeRatio;
        const size = p.size * (1 - lifeRatio * 0.5);

        // Fire gradient from yellow to red to transparent
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size);
        gradient.addColorStop(0, `hsla(${p.hue + 20}, 100%, 70%, ${alpha * 0.8})`);
        gradient.addColorStop(0.4, `hsla(${p.hue}, 100%, 50%, ${alpha * 0.5})`);
        gradient.addColorStop(1, `hsla(${p.hue - 10}, 100%, 30%, 0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Add glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = `hsla(${p.hue}, 100%, 50%, ${alpha * 0.3})`;

        return p.life < p.maxLife;
      });

      ctx.shadowBlur = 0;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-[1]"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default FireParticles;
