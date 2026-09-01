import React from "react";
import "./RotatePrompt.css";

export default function RotatePrompt() {
  return (
    <div className="rotate-overlay" aria-hidden="true">
      <div className="rotate-content">
        <div className="phone-rotate-anim">
          <svg viewBox="0 0 120 80" width="140" height="80" fill="none" stroke="#fff" strokeWidth="1.6">
            {/* phone vertical */}
            <rect x="12" y="8" width="36" height="64" rx="6" />
            <rect x="22" y="14" width="16" height="28" rx="1" fill="#fff" stroke="none" opacity="0.9" />
            {/* arrow */}
            <path d="M56 18 A 28 28 0 0 1 86 38" markerEnd="url(#arrow)" />
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#fff" />
              </marker>
            </defs>
            {/* phone horizontal */}
            <rect x="62" y="34" width="48" height="28" rx="4" />
            <rect x="68" y="38" width="28" height="16" rx="1" fill="#fff" stroke="none" opacity="0.9" />
            <circle cx="106" cy="48" r="1.2" fill="#fff" />
          </svg>
        </div>
        <p className="rotate-text">画面 横向き利用推奨</p>
      </div>
    </div>
  );
}
