import { type RefObject, useEffect, useRef } from "react";
import type { JSX } from "react";

import Matter from "matter-js";

import { useErrorScreen } from "../../model";

//<editor-fold desc="Constants: stairs & layout" defaultstate="collapsed">
const STAIR_SPEED = 0.75;
const STAIR_STEP_COUNT = 5;
const STAIR_EXTRA = 8;
const NARROW_WIDTH_BREAKPOINT = 720;
//</editor-fold>

//<editor-fold desc="Constants: digit pool & respawn timing" defaultstate="collapsed">
const DEFAULT_POOL_SIZE = 6;
const RESPAWN_MIN_MS = 250;
const RESPAWN_MAX_MS = 1400;
const THROW_HISTORY_MS = 90;
//</editor-fold>

//<editor-fold desc="Constants: digit rendering" defaultstate="collapsed">
const DIGIT_BORDER_WIDTH = 0.75;
const DIGIT_LINE_WIDTH = 1.5;
const DIGIT_SIZE_MULTIPLIER = 1.5;
const DIGIT_PARTICLE_SIZE_CORRECT_X = 0.7;
const DIGIT_PARTICLE_SIZE_CORRECT_Y = 0.7;
//</editor-fold>

export function ErrorStairsScene(): JSX.Element {
  const { code } = useErrorScreen();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useStairsCanvas(canvasRef, code);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 size-full touch-none font-brand text-foreground/20 select-none"
      aria-hidden
    />
  );
}

interface DigitParticle {
  body: Matter.Body;
  size: number;
  digitIndex: number;
  waiting: boolean;
  respawnAt: number;
  dragging: boolean;
}

interface PointerSample {
  time: number;
  x: number;
  y: number;
}

function getDigitSize(width: number): number {
  const stairsAreaWidth = getStairsAreaWidth(width);
  return stairsAreaWidth / STAIR_STEP_COUNT;
}

function getStairsAreaWidth(containerWidth: number): number {
  return containerWidth < NARROW_WIDTH_BREAKPOINT
    ? containerWidth
    : containerWidth * 0.5;
}

function useStairsCanvas(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  code: string,
  poolSize = DEFAULT_POOL_SIZE,
): void {
  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    const digits = Array.from(code);

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 1.5, scale: 0.001 },
    });

    const size = { width: 0, height: 0 };

    let stairBodies: Matter.Body[] = [];
    let digitParticles: DigitParticle[] = [];
    let digitCounter = 0;

    const totalSteps = STAIR_STEP_COUNT + STAIR_EXTRA;

    //<editor-fold desc="Physics: init bodies" defaultstate="collapsed">
    const initPhysicsBodies = () => {
      Matter.Composite.clear(engine.world, false);

      const { width, height } = size;

      if (width === 0 || height === 0) {
        return;
      }

      const stairLength = height * 2;
      const stairsAreaWidth = getStairsAreaWidth(width);
      const stepWidth = stairsAreaWidth / STAIR_STEP_COUNT;
      const stepHeight = height / STAIR_STEP_COUNT;

      stairBodies = [];

      for (let i = -4; i < totalSteps - 4; i += 1) {
        const x = i * stepWidth + stepWidth / 2;
        const topY = (i + 1) * stepHeight;
        const y = topY + stairLength / 2;

        const body = Matter.Bodies.rectangle(x, y, stepWidth, stairLength, {
          isStatic: true,
          friction: 0,
          frictionStatic: 0,
          frictionAir: 0,
          restitution: 0,
        });

        stairBodies.push(body);
      }

      Matter.Composite.add(engine.world, stairBodies);

      const digitSize = getDigitSize(width) * DIGIT_SIZE_MULTIPLIER;
      digitParticles = Array.from({ length: poolSize }, (_, i) => {
        const body = Matter.Bodies.rectangle(
          0,
          -9999,
          digitSize * DIGIT_PARTICLE_SIZE_CORRECT_X,
          digitSize * DIGIT_PARTICLE_SIZE_CORRECT_Y,
          {
            friction: 0,
            frictionStatic: 0,
            frictionAir: 0.001,
            restitution: 0.1,
            density: 0.001,
          },
        );
        Matter.Composite.add(engine.world, body);

        return {
          body,
          size: digitSize,
          digitIndex: 0,
          waiting: true,
          respawnAt: performance.now() + i * 260 + Math.random() * 400,
          dragging: false,
        };
      });
    };
    //</editor-fold>

    //<editor-fold desc="Canvas: resize / init" defaultstate="collapsed">
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      size.width = rect.width;
      size.height = rect.height;

      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      initPhysicsBodies();
    };

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    //</editor-fold>

    //<editor-fold desc="Digits: spawn" defaultstate="collapsed">
    const spawnDigit = (particle: DigitParticle) => {
      const stairsAreaWidth = getStairsAreaWidth(size.width);
      const stepWidth = stairsAreaWidth / STAIR_STEP_COUNT;
      const startColumn = Math.floor(Math.random() * 4);

      const spawnX =
        startColumn * stepWidth +
        stepWidth / 2 +
        (Math.random() - 0.5) * stepWidth * 0.3;
      const spawnY = -particle.size;

      Matter.Body.setPosition(particle.body, { x: spawnX, y: spawnY });
      Matter.Body.setVelocity(particle.body, {
        x: 2 + Math.random() * 3,
        y: 0,
      });
      Matter.Body.setAngle(
        particle.body,
        ((Math.random() - 0.5) * 40 * Math.PI) / 180,
      );
      Matter.Body.setAngularVelocity(particle.body, 0);

      particle.waiting = false;
      particle.digitIndex = digitCounter % digits.length;
      digitCounter += 1;
    };
    //</editor-fold>

    //<editor-fold desc="Pointer: drag & throw state" defaultstate="collapsed">
    let draggedParticle: DigitParticle | null = null;
    let pointerOffsetX = 0;
    let pointerOffsetY = 0;
    let pointerHistory: PointerSample[] = [];

    const toCanvasPoint = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const hitTest = (point: { x: number; y: number }): DigitParticle | null => {
      const bodies = digitParticles
        .filter((p) => !p.waiting)
        .map((p) => p.body);
      const hits = Matter.Query.point(bodies, point);

      if (hits.length > 0) {
        const hitBody = hits[0];
        return (
          digitParticles.find((p) => p.body === hitBody && !p.waiting) ?? null
        );
      }

      return null;
    };
    //</editor-fold>

    //<editor-fold desc="Pointer: event handlers" defaultstate="collapsed">
    const handlePointerDown = (event: PointerEvent) => {
      const point = toCanvasPoint(event);
      const hit = hitTest(point);

      if (!hit) {
        return;
      }

      draggedParticle = hit;
      hit.dragging = true;
      Matter.Body.setStatic(hit.body, true);

      pointerOffsetX = point.x - hit.body.position.x;
      pointerOffsetY = point.y - hit.body.position.y;
      pointerHistory = [{ time: performance.now(), x: point.x, y: point.y }];

      canvas.setPointerCapture(event.pointerId);
      canvas.style.cursor = "grabbing";
    };

    const handlePointerMove = (event: PointerEvent) => {
      const point = toCanvasPoint(event);

      if (!draggedParticle) {
        canvas.style.cursor = hitTest(point) ? "grab" : "default";
        return;
      }

      const targetX = point.x - pointerOffsetX;
      const targetY = point.y - pointerOffsetY;

      Matter.Body.setPosition(draggedParticle.body, {
        x: targetX,
        y: targetY,
      });

      const now = performance.now();
      pointerHistory.push({ time: now, x: point.x, y: point.y });
      pointerHistory = pointerHistory.filter(
        (s) => now - s.time <= THROW_HISTORY_MS,
      );
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (!draggedParticle) return;

      const particle = draggedParticle;
      Matter.Body.setStatic(particle.body, false);

      const now = performance.now();
      const first = pointerHistory[0];
      const dt = first ? Math.max(0.001, (now - first.time) / 1000) : 0.016;

      if (first) {
        const point = toCanvasPoint(event);
        const vx = ((point.x - first.x) / dt) * 0.05;
        const vy = ((point.y - first.y) / dt) * 0.05;

        Matter.Body.setVelocity(particle.body, { x: vx, y: vy });
      }

      particle.dragging = false;
      draggedParticle = null;
      canvas.style.cursor = "grab";
      canvas.releasePointerCapture(event.pointerId);
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointercancel", handlePointerUp);
    //</editor-fold>

    //<editor-fold desc="Render: draw" defaultstate="collapsed">
    let lastTime = performance.now();
    let frame = 0;

    const draw = () => {
      const { width, height } = size;
      ctx.clearRect(0, 0, width, height);

      const stairLength = height * 2;
      const style = getComputedStyle(canvas);
      const color = style.color || "#000";
      const fontFamily = style.fontFamily;
      const stairsAreaWidth = getStairsAreaWidth(width);
      const stepWidth = stairsAreaWidth / STAIR_STEP_COUNT;

      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = DIGIT_BORDER_WIDTH;

      stairBodies.forEach((body) => {
        const left = body.position.x - stepWidth / 2;
        const right = left + stepWidth;
        const top = body.position.y - stairLength / 2;
        const bottom = top + stairLength;

        ctx.beginPath();
        ctx.moveTo(left, top);
        ctx.lineTo(right, top);
        ctx.lineTo(right, bottom);
        ctx.lineTo(left, bottom);
        ctx.stroke();
      });
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.lineJoin = "miter";

      digitParticles.forEach((particle) => {
        if (particle.waiting) {
          return;
        }

        const { x, y } = particle.body.position;
        const angle = particle.body.angle;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        ctx.strokeStyle = color;
        ctx.lineWidth = DIGIT_LINE_WIDTH;
        ctx.font = `${String(particle.size)}px ${fontFamily}`;

        const text = digits[particle.digitIndex] ?? "";
        const metrics = ctx.measureText(text);
        const textOffsetY =
          (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) /
          2;

        ctx.strokeText(text, 0, textOffsetY);

        ctx.restore();
      });
      ctx.restore();
    };
    //</editor-fold>

    //<editor-fold desc="Loop: tick" defaultstate="collapsed">
    const tick = (time: number) => {
      const delta = Math.min(time - lastTime, 100);
      const dt = delta / 1000;
      lastTime = time;

      const { width, height } = size;

      if (width > 0 && height > 0 && !reduceMotion) {
        Matter.Engine.update(engine, 1000 / 60);

        const stairsAreaWidth = getStairsAreaWidth(width);
        const stepWidth = stairsAreaWidth / STAIR_STEP_COUNT;
        const stepHeight = height / STAIR_STEP_COUNT;

        const dx = STAIR_SPEED * stepWidth * dt;
        const dy = STAIR_SPEED * stepHeight * dt;

        const totalWidth = totalSteps * stepWidth;
        const totalHeight = totalSteps * stepHeight;

        stairBodies.forEach((body) => {
          let newX = body.position.x - dx;
          let newY = body.position.y - dy;

          const stairLength = height * 2;
          const topY = newY - stairLength / 2;

          if (topY < -stepHeight * 2 || newX < -stepWidth * 2) {
            newX += totalWidth;
            newY += totalHeight;
          }

          Matter.Body.setPosition(body, { x: newX, y: newY });
        });

        digitParticles.forEach((particle) => {
          if (particle.dragging) {
            return;
          }

          if (particle.waiting) {
            if (time >= particle.respawnAt) spawnDigit(particle);
            return;
          }

          const { x, y } = particle.body.position;
          const offRight = x - particle.size / 2 > width + 100;
          const offBottom = y - particle.size / 2 > height + 200;

          if (offRight || offBottom) {
            particle.waiting = true;
            particle.respawnAt =
              time +
              RESPAWN_MIN_MS +
              Math.random() * (RESPAWN_MAX_MS - RESPAWN_MIN_MS);
            Matter.Body.setPosition(particle.body, { x: 0, y: -9999 });
            Matter.Body.setVelocity(particle.body, { x: 0, y: 0 });
          }
        });
      }

      draw();
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    //</editor-fold>

    //<editor-fold desc="Cleanup" defaultstate="collapsed">
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointercancel", handlePointerUp);
      Matter.Composite.clear(engine.world, false);
      Matter.Engine.clear(engine);
    };
    //</editor-fold>
  }, [canvasRef, code, poolSize]);
}
