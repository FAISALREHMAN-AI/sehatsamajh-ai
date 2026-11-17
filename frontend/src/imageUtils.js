/**
 * Image compression and resizing utility using HTML5 Canvas.
 * Requirements:
 * - Resize any image larger than 2000 px on its longest side (maintains aspect ratio).
 * - Compress as JPEG so it is under 3 MB.
 * - Quality about 0.85 for clear medical document readability.
 * - PDFs are not compressed and sent as-is.
 * - Uses native browser canvas with zero external libraries.
 */

export const MAX_PDF_SIZE_BYTES = 4 * 1024 * 1024; // 4 MB
export const MAX_IMAGE_SIZE_BYTES = 3 * 1024 * 1024; // 3 MB
export const MAX_IMAGE_DIMENSION = 2000; // 2000 px

export async function compressImage(imageFile) {
  if (!imageFile || !imageFile.type || !imageFile.type.startsWith('image/')) {
    return imageFile;
  }

  // If already under 3 MB and not needing resize, fast return
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(imageFile);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      const needsResize = width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION;
      const needsCompress = imageFile.size > MAX_IMAGE_SIZE_BYTES || imageFile.type !== 'image/jpeg';

      if (!needsResize && !needsCompress) {
        resolve(imageFile);
        return;
      }

      // Preserve aspect ratio; cap longest dimension at 2000 px
      if (needsResize) {
        if (width > height) {
          height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
          width = MAX_IMAGE_DIMENSION;
        } else {
          width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
          height = MAX_IMAGE_DIMENSION;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // Fill white background for clean text readability (especially transparent PNGs)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Start with quality about 0.85 as specified
      const attemptCompression = (quality) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(imageFile);
              return;
            }

            // If still over 3 MB, reduce quality step-wise down to 0.4
            if (blob.size > MAX_IMAGE_SIZE_BYTES && quality > 0.45) {
              attemptCompression(Math.max(0.4, quality - 0.15));
            } else {
              const baseName = imageFile.name.replace(/\.[^/.]+$/, '');
              const compressedFile = new File([blob], `${baseName}.jpg`, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            }
          },
          'image/jpeg',
          quality
        );
      };

      attemptCompression(0.85);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(imageFile);
    };

    img.src = objectUrl;
  });
}
