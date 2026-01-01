"use client";

import { useState } from "react";
import { HelpCircle, X, SearchMd, BookOpen01, MessageChatCircle, RefreshCcw01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import type { ContextualHelp } from "@/lib/ftue/types";

interface HelpWidgetProps {
  currentPage: string;
  contextualHelp?: ContextualHelp;
  onStartTour: (tourId: string) => void;
  onRestartOnboarding?: () => void;
}

export function HelpWidget({
  currentPage,
  contextualHelp,
  onStartTour,
  onRestartOnboarding,
}: HelpWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-brand-solid text-white rounded-full 
                   shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center z-30"
        data-tour="help-button"
        aria-label="Open help"
      >
        <HelpCircle className="h-6 w-6" />
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 bg-primary rounded-xl shadow-2xl border border-secondary overflow-hidden z-40 animate-in slide-in-from-bottom-4 fade-in duration-200">
          {/* Header */}
          <div className="bg-brand-solid px-4 py-3 flex items-center justify-between">
            <h3 className="text-white font-semibold">Help & Resources</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white"
              aria-label="Close help"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-secondary">
            <div className="relative">
              <SearchMd className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-quaternary" />
              <input
                type="text"
                placeholder="Search help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-primary bg-primary text-primary placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-b border-secondary">
            <h4 className="text-xs font-semibold text-quaternary uppercase mb-3">
              Quick Actions
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onStartTour("dashboard_intro");
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 p-3 rounded-lg bg-secondary hover:bg-tertiary transition-colors text-left"
              >
                <span>🎯</span>
                <span className="text-sm font-medium text-secondary">Take a tour</span>
              </button>
              <a
                href="/docs"
                className="flex items-center gap-2 p-3 rounded-lg bg-secondary hover:bg-tertiary transition-colors text-left"
              >
                <BookOpen01 className="h-4 w-4 text-quaternary" />
                <span className="text-sm font-medium text-secondary">View docs</span>
              </a>
              <a
                href="mailto:support@tokentra.com"
                className="flex items-center gap-2 p-3 rounded-lg bg-secondary hover:bg-tertiary transition-colors text-left"
              >
                <MessageChatCircle className="h-4 w-4 text-quaternary" />
                <span className="text-sm font-medium text-secondary">Contact us</span>
              </a>
              {onRestartOnboarding && (
                <button
                  onClick={() => {
                    onRestartOnboarding();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-secondary hover:bg-tertiary transition-colors text-left"
                >
                  <RefreshCcw01 className="h-4 w-4 text-quaternary" />
                  <span className="text-sm font-medium text-secondary">Restart setup</span>
                </button>
              )}
            </div>
          </div>

          {/* Related Articles */}
          {contextualHelp && contextualHelp.articles.length > 0 && (
            <div className="p-4 border-b border-secondary">
              <h4 className="text-xs font-semibold text-quaternary uppercase mb-3">
                Related Articles
              </h4>
              <div className="space-y-2">
                {contextualHelp.articles.map((article) => (
                  <a
                    key={article.id}
                    href={article.url}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary"
                  >
                    <BookOpen01 className="h-4 w-4 text-quaternary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-secondary">
                        {article.title}
                      </p>
                      <p className="text-xs text-tertiary">{article.summary}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* FAQ */}
          {contextualHelp && contextualHelp.faq.length > 0 && (
            <div className="p-4 border-b border-secondary">
              <h4 className="text-xs font-semibold text-quaternary uppercase mb-3">
                FAQ
              </h4>
              <div className="space-y-3">
                {contextualHelp.faq.map((item, i) => (
                  <details key={i} className="group">
                    <summary className="text-sm font-medium text-secondary cursor-pointer list-none flex items-center justify-between">
                      {item.question}
                      <span className="text-quaternary group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <p className="text-sm text-tertiary mt-2 pl-4">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="p-4 bg-secondary">
            <p className="text-xs text-tertiary text-center">
              Need more help?{" "}
              <a href="/support" className="text-brand-secondary hover:underline">
                Contact support
              </a>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
