/** Largest side we keep before diagnosis. Phone photos can exceed browser memory. */
export const MAX_IMAGE_DIMENSION = 1600;

const toJpeg = (source: CanvasImageSource, width: number, height: number): string => {
  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  canvas.getContext('2d')?.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.85);
};

/** Reads an image file and returns a resized JPEG data URL. */
export const shrinkImage = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(toJpeg(img, img.width, img.height));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read image'));
    };
    img.src = url;
  });

/** Grabs the current frame of a playing video as a resized JPEG data URL. */
export const captureFrame = (video: HTMLVideoElement): string | null => {
  if (!video.videoWidth || !video.videoHeight) return null;
  return toJpeg(video, video.videoWidth, video.videoHeight);
};
