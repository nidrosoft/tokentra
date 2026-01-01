"use client";

import { useEffect, useState, useCallback } from "react";
import { X } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import type { Celebration } from "@/lib/ftue/types";
import { trackCelebrationShown } from "@/lib/ftue/analytics";

interface ConfettiProps {
  duration?: number;
  onComplete?: () => void;
}

export function Confetti({ duration = 5000, onComplete }: ConfettiProps) {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    color: string;
    delay: number;
    size: number;
  }>>([]);

  useEffect(() => {
    // Generate confetti particles
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
    const newParticles = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.5,
      size: Math.random() * 8 + 4,
    }));
    setParticles(newParticles);

    const timer = setTimeout(() => {
      setParticles([]);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-confetti"
          style={{
            left: `${particle.x}%`,
            top: "-20px",
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}s`,
            borderRadius: Math.random() > 0.5 ? "50%" : "0",
          }}
        />
      ))}
      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti 3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

interface CelebrationModalProps {
  celebration: Celebration;
  isOpen: boolean;
  onClose: () => void;
}

export function CelebrationModal({ celebration, isOpen, onClose }: CelebrationModalProps) {
  useEffect(() => {
    if (isOpen) {
      trackCelebrationShown(celebration.id);
    }
  }, [isOpen, celebration.id]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-primary rounded-2xl p-8 max-w-sm text-center shadow-2xl animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {celebration.emoji && (
          <div className="text-6xl mb-4">{celebration.emoji}</div>
        )}
        <h2 className="text-xl font-bold text-primary mb-2">
          {celebration.title}
        </h2>
        <p className="text-tertiary mb-6">{celebration.message}</p>

        {celebration.action ? (
          <Button onClick={() => (window.location.href = celebration.action!.url)}>
            {celebration.action.label}
          </Button>
        ) : (
          <Button onClick={onClose}>Got it!</Button>
        )}
      </div>
    </div>
  );
}

interface CelebrationToastProps {
  celebration: Celebration;
  isVisible: boolean;
  onDismiss: () => void;
}

export function CelebrationToast({ celebration, isVisible, onDismiss }: CelebrationToastProps) {
  useEffect(() => {
    if (isVisible) {
      trackCelebrationShown(celebration.id);

      if (celebration.duration) {
        const timer = setTimeout(onDismiss, celebration.duration);
        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, celebration, onDismiss]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[150] animate-in slide-in-from-right duration-300">
      <div className="bg-primary rounded-lg shadow-xl border border-secondary p-4 max-w-sm flex items-start gap-3">
        {celebration.emoji && (
          <span className="text-2xl flex-shrink-0">{celebration.emoji || "🎉"}</span>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-primary text-sm">{celebration.title}</h4>
          <p className="text-tertiary text-sm mt-0.5">{celebration.message}</p>
        </div>
        <button
          onClick={onDismiss}
          className="text-quaternary hover:text-secondary flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

interface CelebrationManagerProps {
  celebration: Celebration | null;
  onComplete: () => void;
}

export function CelebrationManager({ celebration, onComplete }: CelebrationManagerProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!celebration) {
      setShowConfetti(false);
      setShowModal(false);
      setShowToast(false);
      return;
    }

    switch (celebration.type) {
      case "confetti":
        setShowConfetti(true);
        setShowToast(true);
        break;
      case "modal":
        setShowModal(true);
        break;
      case "toast":
        setShowToast(true);
        break;
      case "badge":
        setShowToast(true);
        break;
    }
  }, [celebration]);

  const handleComplete = useCallback(() => {
    setShowConfetti(false);
    setShowModal(false);
    setShowToast(false);
    onComplete();
  }, [onComplete]);

  if (!celebration) return null;

  return (
    <>
      {showConfetti && (
        <Confetti
          duration={celebration.duration || 5000}
          onComplete={() => setShowConfetti(false)}
        />
      )}
      {showModal && (
        <CelebrationModal
          celebration={celebration}
          isOpen={showModal}
          onClose={handleComplete}
        />
      )}
      {showToast && !showModal && (
        <CelebrationToast
          celebration={celebration}
          isVisible={showToast}
          onDismiss={handleComplete}
        />
      )}
    </>
  );
}
