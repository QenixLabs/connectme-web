export interface ExtractVideoThumbnailOptions {
  time?: number;
  maxWidth?: number;
  quality?: number;
}

export function extractVideoThumbnail(
  file: File,
  options: ExtractVideoThumbnailOptions = {},
): Promise<File> {
  const {
    time = 0.1,
    maxWidth = 640,
    quality = 0.92,
  } = options;

  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const objectUrl = URL.createObjectURL(file);

    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = objectUrl;

    function cleanup() {
      URL.revokeObjectURL(objectUrl);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
    }

    function onError() {
      cleanup();
      reject(new Error("Failed to load video for thumbnail extraction"));
    }

    function onLoadedMetadata() {
      const seekTime = Number.isFinite(video.duration)
        ? Math.min(time, video.duration)
        : time;
      video.currentTime = seekTime;
    }

    function onSeeked() {
      try {
        const scale = maxWidth / video.videoWidth;
        const width = Math.min(maxWidth, video.videoWidth);
        const height =
          scale < 1 ? Math.round(video.videoHeight * scale) : video.videoHeight;

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          cleanup();
          reject(new Error("Canvas context not available"));
          return;
        }

        ctx.drawImage(video, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            cleanup();
            if (!blob) {
              reject(new Error("Thumbnail blob creation failed"));
              return;
            }
            resolve(
              new File([blob], "thumbnail.jpg", { type: "image/jpeg" }),
            );
          },
          "image/jpeg",
          quality,
        );
      } catch (err) {
        cleanup();
        reject(err);
      }
    }

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onError);

    video.load();
  });
}
