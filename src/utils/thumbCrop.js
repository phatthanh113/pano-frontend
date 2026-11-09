/**
 * Crop ảnh "mặt chính diện" từ ảnh 360 equirectangular để làm thumbnail.
 * - Ảnh equirect (tỉ lệ ~>=1.8:1): cắt dải ngang tại hướng nhìn mặc định (yaw, đơn vị độ;
 *   yaw 0 = tâm ngang của ảnh, sang phải dương).
 * - Ảnh thường: cover-fit vào khung.
 *
 * @param {string} url Đường dẫn ảnh (cùng origin)
 * @param {number} yawDeg
 * @param {number} width Kích thước output (2.25:1)
 * @param {number} height
 * @returns {Promise<string|null>} dataURL JPEG hoặc null
 */
export function frontViewThumbFromImage(url, yawDeg = 0, width = 270, height = 120) {
  if (!url || width <= 0 || height <= 0) return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onerror = () => resolve(null);
    img.onload = () => {
      try {
        resolve(catchCrop(img, yawDeg, width, height));
      } catch {
        resolve(null);
      }
    };
    img.src = url;
  });
}

function catchCrop(img, yawDeg, outW, outH) {
  const srcW = img.naturalWidth || img.width;
  const srcH = img.naturalHeight || img.height;
  if (!srcW || !srcH) return null;

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, outW, outH);

  const isEquirect = srcW / srcH >= 1.8;
  if (isEquirect) {
    const fov = 100;
    const bandW = Math.max(1, Math.round((srcW * fov) / 360));
    const bandH = Math.min(srcH, Math.max(1, Math.round((bandW * outH) / outW)));
    const centerX = srcW / 2 + srcW * ((yawDeg || 0) / 360);
    let x0 = Math.floor(((centerX - bandW / 2) % srcW + srcW) % srcW);
    const srcY = Math.max(0, Math.min(srcH - bandH, Math.round((srcH - bandH) / 2)));

    if (x0 + bandW <= srcW) {
      ctx.drawImage(img, x0, srcY, bandW, bandH, 0, 0, outW, outH);
    } else {
      // Dải tràn mép trái => ghép 2 phần (wrap-around 360°)
      const first = srcW - x0;
      const firstOut = Math.max(1, Math.round((outW * first) / bandW));
      ctx.drawImage(img, x0, srcY, first, bandH, 0, 0, firstOut, outH);
      ctx.drawImage(img, 0, srcY, bandW - first, bandH, firstOut, 0, outW - firstOut, outH);
      x0 = 0;
    }
  } else {
    const ratio = srcW / srcH;
    const outRatio = outW / outH;
    let cropW = ratio > outRatio ? Math.max(1, Math.round(srcH * outRatio)) : srcW;
    let cropH = ratio > outRatio ? srcH : Math.max(1, Math.round(srcW / outRatio));
    const cropX = Math.round((srcW - cropW) / 2);
    const cropY = Math.round((srcH - cropH) / 2);
    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, outW, outH);
  }

  try {
    return canvas.toDataURL("image/jpeg", 0.85);
  } catch {
    return null;
  }
}
