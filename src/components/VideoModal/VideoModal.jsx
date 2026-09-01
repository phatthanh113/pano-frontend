import React, { useState } from "react";
import "./VideoModal.css";

/** Helper: Convert standard YouTube / Vimeo / Direct video URLs to valid embed URL */
function getEmbedUrl(url) {
  if (!url) return "";
  
  // YouTube watch format (https://www.youtube.com/watch?v=VIDEO_ID)
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1`;
  }
  
  // Vimeo format
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  }

  // Already embed or direct URL
  return url;
}

export default function VideoModal({
  isOpen,
  onClose,
  videos = [],
  floorName = ""
}) {
  if (!isOpen || !videos || videos.length === 0) return null;

  const [selectedVideo, setSelectedVideo] = useState(videos[0]);

  const activeVideo = selectedVideo || videos[0];
  const isDirectVideo = activeVideo?.videoUrl?.match(/\.(mp4|webm|ogg)$/i);
  const embedUrl = getEmbedUrl(activeVideo?.videoUrl);

  return (
    <div className="video-modal-backdrop" onClick={onClose}>
      <div className="video-modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Close Button at top-right */}
        <button className="video-modal-close-btn" onClick={onClose} title="Đóng (ESC)">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Left Side: Video Playlist Cards */}
        <div className="video-playlist-sidebar">
          <div className="video-playlist-header">
            <span>ムービー一覧</span>
          </div>
          <div className="video-playlist-scroll">
            {videos.map((vid) => {
              const isActive = activeVideo.id === vid.id;
              return (
                <div
                  key={vid.id}
                  className={`video-playlist-card ${isActive ? "active" : ""}`}
                  onClick={() => setSelectedVideo(vid)}
                >
                  <div className="video-card-thumb-wrap">
                    <img
                      src={vid.thumbnail || "/images/pana1.jpg"}
                      alt={vid.title}
                      className="video-card-thumb"
                    />
                    <div className="video-card-play-icon">▶</div>
                  </div>
                  <div className="video-card-title-bar">
                    {vid.title || vid.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center / Right: Video Player Screen */}
        <div className="video-player-main">
          <div className="video-player-frame-wrapper">
            {isDirectVideo ? (
              <video
                key={activeVideo.id}
                src={activeVideo.videoUrl}
                controls
                autoPlay
                className="video-player-element"
              />
            ) : (
              <iframe
                key={activeVideo.id}
                src={embedUrl}
                title={activeVideo.title || activeVideo.label}
                className="video-player-iframe"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            )}

            {/* Bottom-left big title badge (e.g. トラックヤード) */}
            <div className="video-player-label-badge">
              {activeVideo.label || activeVideo.title}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
