const MAX_BASE64_CHARS = 700_000;
const MAX_DIMENSION = 1280;

export function compressImage(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (dataUrl.length <= MAX_BASE64_CHARS) {
      resolve(dataUrl);
      return;
    }
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
      const width = Math.max(1, Math.round(img.width * scale));
      const height = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      let quality = 0.72;
      let out = canvas.toDataURL('image/jpeg', quality);
      let best = out;
      while (out.length > MAX_BASE64_CHARS && quality > 0.25) {
        quality -= 0.1;
        out = canvas.toDataURL('image/jpeg', quality);
        if (out.length < best.length) best = out;
      }
      resolve(best);
    };
    img.onerror = () => reject(new Error('Failed to read image'));
    img.src = dataUrl;
  });
}
