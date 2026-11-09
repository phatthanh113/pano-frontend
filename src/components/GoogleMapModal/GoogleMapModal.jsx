import React from "react";
import "./GoogleMapModal.css";

function extractSrc(raw) {
  if (!raw) return "";
  const s = String(raw).trim();
  if (!s) return "";
  const m = s.match(/src=["']([^"']+)["']/i);
  if (m) return m[1];
  return s;
}

export default function GoogleMapModal({ isOpen, onClose, mapUrl }) {
  if (!isOpen) return null;
  const fallbackSrc = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3247.5!2d139.29!3d35.42!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6018f1c5f5e5f5e5%3A0x0!2z5p2x5rW35a2m5a2m5a2m!5e1!3m2!1sja!2sjp!4v1&maptype=satellite";
  const rawSrc = extractSrc(mapUrl);
  const src = rawSrc || fallbackSrc;
  return (
    <div className="gmap-overlay" onClick={onClose}>
      <div className="gmap-modal" onClick={(e) => e.stopPropagation()}>
        <button className="gmap-close" onClick={onClose} aria-label="Close">×</button>
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
      </div>
    </div>
  );
}
