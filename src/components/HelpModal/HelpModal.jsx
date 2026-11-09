import React from "react";
import "./HelpModal.css";

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="help-modal-backdrop" onClick={onClose}>
      <div className="help-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="help-modal-header">
          <h3>User Manual</h3>
          <button className="help-close-btn" onClick={onClose}>×</button>
        </div>
        <div className="help-modal-body">
          <div className="help-item">
            <span className="help-icon">🏠</span>
            <div>
              <strong>Home / 外構:</strong> Return to the overall panaromic view of the project.
            </div>
          </div>
          <div className="help-item">
            <span className="help-icon">📹</span>
            <div>
              <strong>View Video (ムービー):</strong> Open detailed introduction videos for each area.
            </div>
          </div>
          <div className="help-item">
            <span className="help-icon">🖼</span>
            <div>
              <strong>Change View Mode:</strong> Switch between 2D Floor Plan and 360° Panaroma.
            </div>
          </div>
          <div className="help-item">
            <span className="help-icon">🗺</span>
            <div>
              <strong>MiniMap:</strong> Shown on each floor for easy location of viewing points.
            </div>
          </div>
          <div className="help-item">
            <span className="help-icon">∨</span>
            <div>
              <strong>Hide/Show Image Bar:</strong> Click the down arrow button at the bottom corner to hide/show the thumbnail image list.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
