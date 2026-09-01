import React, { useState } from "react";
import settingsData from "../data/settings.json";

export default function SettingsPanel({ isOpen, onClose }) {
  const { settings } = settingsData;
  const [isMuted, setIsMuted] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  const handleAction = (item) => {
    switch (item.action) {
      case "toggle-settings":
        onClose();
        break;
      case "toggle-music":
        setIsMusicPlaying(!isMusicPlaying);
        // TODO: Implement music toggle
        break;
      case "toggle-mute":
        setIsMuted(!isMuted);
        // TODO: Implement mute toggle
        break;
      case "open-video":
        // TODO: Implement video modal
        alert("Mở video");
        break;
      case "open-floorplan":
        // TODO: Implement floorplan modal
        alert("Mở sơ đồ");
        break;
      case "open-contact":
        // TODO: Implement contact modal
        alert("Liên hệ: 0123 456 789");
        break;
      case "open-website":
        if (item.url) {
          window.open(item.url, "_blank");
        }
        break;
      default:
        break;
    }
  };

  const getIconStyle = (item) => {
    if (item.action === "toggle-music" && isMusicPlaying) {
      return "active";
    }
    if (item.action === "toggle-mute" && isMuted) {
      return "active";
    }
    return "";
  };

  if (!isOpen) return null;

  return (
    <div className="settings-panel">
      <div className="settings-list">
        {settings.map((item) => (
          <button
            key={item.id}
            className={`settings-btn ${getIconStyle(item)}`}
            onClick={() => handleAction(item)}
            title={item.label}
          >
            <span className="settings-icon">{item.icon}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
