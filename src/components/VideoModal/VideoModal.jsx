import React, { useState, useEffect } from "react";
import "./VideoModal.css";

/** Helper: extract YouTube ID for thumbnail fallback */
function getYouTubeId(url) {
  if (!url) return null;
  const m1 = url.match(/youtube\.com\/embed\/([\w-]{11})/);
  if (m1) return m1[1];
  const m2 = url.match(/youtube\.com\/shorts\/([\w-]{11})/);
  if (m2) return m2[1];
  const m3 = url.match(/(?:youtu\.be\/|youtube\.com\/(?:v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (m3) return m3[1];
  try {
    const u = new URL(url);
    const v = u.searchParams.get("v");
    if (v && /^[\w-]{11}$/.test(v)) return v;
  } catch {}
  return null;
}

function getThumbUrl(video) {
  if (video?.thumbnail) return video.thumbnail;
  const url = video?.videoUrl || video?.link || video?.url || "";
  const ytId = getYouTubeId(url);
  if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  return "/images/pana1.jpg";
}

function getVideoUrl(video) {
  return video?.videoUrl || video?.link || video?.url || "";
}

/** Helper: Convert standard YouTube / Vimeo / Direct video URLs to valid embed URL */
function getEmbedUrl(url) {
  if (!url) return "";
  
  // YouTube watch format (https://www.youtube.com/watch?v=VIDEO_ID)
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1`;
  }
  
  // Shorts
  const shortsMatch = url.match(/youtube\.com\/shorts\/([\w-]{11})/);
  if (shortsMatch && shortsMatch[1]) {
    return `https://www.youtube.com/embed/${shortsMatch[1]}?autoplay=1&rel=0&modestbranding=1`;
  }

  // Already embed
  const embedMatch = url.match(/youtube\.com\/embed\/([\w-]{11})/);
  if (embedMatch) {
    return `https://www.youtube.com/embed/${embedMatch[1]}?autoplay=1&rel=0&modestbranding=1`;
  }

  // Fallback ?v=
  try {
    const u = new URL(url);
    const v = u.searchParams.get("v");
    if (v && /^[\w-]{11}$/.test(v)) return `https://www.youtube.com/embed/${v}?autoplay=1&rel=0&modestbranding=1`;
  } catch {}

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

  // Sync when videos prop changes (e.g. after API load or project switch)
  useEffect(() => {
    if (!videos || videos.length === 0) return;
    const exists = selectedVideo && videos.find((v) => String(v.id) === String(selectedVideo.id));
    if (!exists) setSelectedVideo(videos[0]);
  }, [videos]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeVideo = selectedVideo && videos.find((v) => String(v.id) === String(selectedVideo.id)) ? selectedVideo : videos[0];
  const activeUrl = getVideoUrl(activeVideo);
  const isDirectVideo = activeUrl?.match(/\.(mp4|webm|ogg|m4v|mov)(\?|$)/i);
  const embedUrl = getEmbedUrl(activeUrl);

  return (
    <div className="video-modal-backdrop" onClick={onClose}>
      <div className="video-modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Close Button at top-right */}
        <button className="video-modal-close-btn" onClick={onClose} title="Close (ESC)">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Left Side: Video Playlist Cards */}
        <div className="video-playlist-sidebar">
          <div className="video-playlist-header">
            <span>Video List</span>
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
                src={activeUrl}
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
