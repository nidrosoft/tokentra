"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import type { Tour, TourStep } from "@/lib/ftue/types";
import { trackTourStarted, trackTourStepViewed, trackTourCompleted, trackTourSkipped } from "@/lib/ftue/analytics";

interface ProductTourProps {
  tour: Tour;
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function ProductTour({ tour, isOpen, onComplete, onSkip }: ProductTourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const step = tour.steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === tour.steps.length - 1;

  // Track tour start
  useEffect(() => {
    if (isOpen) {
      trackTourStarted(tour.id, tour.steps.length);
    }
  }, [isOpen, tour.id, tour.steps.length]);

  // Find and highlight target element
  useEffect(() => {
    if (!isOpen || !step) return;

    const findTarget = () => {
      if (step.target === "body") {
        setTargetRect(null);
        return;
      }

      const target = document.querySelector(step.target);
      if (target) {
        const rect = target.getBoundingClientRect();
        setTargetRect(rect);

        // Scroll into view
        target.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });

        // Add highlight class
        target.classList.add("tour-highlight");
      } else {
        setTargetRect(null);
      }
    };

    // Small delay to let page render
    const timer = setTimeout(findTarget, 100);

    // Track step view
    trackTourStepViewed(tour.id, step.id, currentStepIndex, tour.steps.length);

    return () => {
      clearTimeout(timer);
      // Remove highlight from all elements
      document.querySelectorAll(".tour-highlight").forEach((el) => {
        el.classList.remove("tour-highlight");
      });
    };
  }, [isOpen, step, currentStepIndex, tour.id, tour.steps.length]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      trackTourCompleted(tour.id);
      onComplete();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [isLastStep, onComplete, tour.id]);

  const handlePrevious = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [isFirstStep]);

  const handleSkip = useCallback(() => {
    trackTourSkipped(tour.id, currentStepIndex);
    onSkip();
  }, [onSkip, tour.id, currentStepIndex]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && step?.showSkip !== false) {
        handleSkip();
      }
      if (e.key === "ArrowRight") {
        handleNext();
      }
      if (e.key === "ArrowLeft" && !isFirstStep) {
        handlePrevious();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleSkip, handleNext, handlePrevious, isFirstStep, step?.showSkip]);

  if (!isOpen || !step) return null;

  const tooltipPosition = getTooltipPosition(targetRect, step.placement);

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Dark overlay with spotlight cutout */}
      <div className="absolute inset-0 bg-black/60 transition-opacity duration-300">
        {targetRect && (
          <div
            className="absolute bg-transparent rounded-lg ring-4 ring-brand ring-offset-4 ring-offset-transparent transition-all duration-300"
            style={{
              left: targetRect.left - (step.highlightPadding || 8),
              top: targetRect.top - (step.highlightPadding || 8),
              width: targetRect.width + (step.highlightPadding || 8) * 2,
              height: targetRect.height + (step.highlightPadding || 8) * 2,
              boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)",
            }}
          />
        )}
      </div>

      {/* Tooltip */}
      <div
        className="absolute bg-primary rounded-xl shadow-2xl p-6 max-w-sm z-10 border border-secondary animate-in fade-in slide-in-from-bottom-2 duration-300"
        style={tooltipPosition}
      >
        {/* Close button */}
        {step.showSkip !== false && (
          <button
            onClick={handleSkip}
            className="absolute top-3 right-3 text-quaternary hover:text-secondary transition-colors"
            aria-label="Skip tour"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Content */}
        <h3 className="font-semibold text-lg text-primary mb-2 pr-6">
          {step.title}
        </h3>
        <p className="text-tertiary text-sm leading-relaxed mb-6">
          {step.content}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* Progress dots */}
          {step.showProgress !== false && (
            <div className="flex gap-1.5">
              {tour.steps.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentStepIndex
                      ? "bg-brand-solid"
                      : i < currentStepIndex
                        ? "bg-brand-solid/50"
                        : "bg-tertiary"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-2 ml-auto">
            {!isFirstStep && (
              <Button
                color="tertiary"
                size="sm"
                onClick={handlePrevious}
                iconLeading={ChevronLeft}
              >
                {step.prevButtonText || "Back"}
              </Button>
            )}
            <Button size="sm" onClick={handleNext} iconTrailing={!isLastStep ? ChevronRight : undefined}>
              {step.nextButtonText || (isLastStep ? "Done" : "Next")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTooltipPosition(
  targetRect: DOMRect | null,
  placement: TourStep["placement"]
): React.CSSProperties {
  if (!targetRect || placement === "center") {
    return {
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)",
    };
  }

  const padding = 16;
  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1024;
  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 768;

  let styles: React.CSSProperties = {};

  switch (placement) {
    case "top":
      styles = {
        left: Math.min(Math.max(targetRect.left + targetRect.width / 2, 200), viewportWidth - 200),
        top: targetRect.top - padding,
        transform: "translate(-50%, -100%)",
      };
      break;
    case "bottom":
      styles = {
        left: Math.min(Math.max(targetRect.left + targetRect.width / 2, 200), viewportWidth - 200),
        top: targetRect.bottom + padding,
        transform: "translate(-50%, 0)",
      };
      break;
    case "left":
      styles = {
        left: targetRect.left - padding,
        top: Math.min(Math.max(targetRect.top + targetRect.height / 2, 100), viewportHeight - 200),
        transform: "translate(-100%, -50%)",
      };
      break;
    case "right":
      styles = {
        left: targetRect.right + padding,
        top: Math.min(Math.max(targetRect.top + targetRect.height / 2, 100), viewportHeight - 200),
        transform: "translate(0, -50%)",
      };
      break;
  }

  return styles;
}
