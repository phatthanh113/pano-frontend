import React from "react";
import "./GoogleMapModal.css";

export default function GoogleMapModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  // Tokai University Isehara Campus approx
  const src = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3247.5!2d139.29!3d35.42!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6018f1c5f5e5f5e5%3A0x0!2z5p2x5rW35a2m5a2m5a2m!5e1!3m2!1sja!2sjp!4v1&maptype=satellite";

  return (
    <div className="gmap-overlay" onClick={onClose}>
      <div className="gmap-modal" onClick={(e) => e.stopPropagation()}>
        <button className="gmap-close" onClick={onClose} aria-label="Close">×</button>
        <div className="gmap-topbar">
          <a
            href="https://www.google.com/maps/search/Tokai+University+Isehara+Campus"
            target="_blank"
            rel="noreferrer"
            className="gmap-open-link"
          >
            マップで開く ↗
          </a>
        </div>
        <iframe
          title="Google Map"
          src={src}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        <button className="gmap-fullscreen" title="Fullscreen" onClick={() => window.open("https://www.google.com/maps/search/Tokai+University+Isehara+Campus", "_blank")}>
          ⛶
        </button>
      </div>
    </div>
  );
}
