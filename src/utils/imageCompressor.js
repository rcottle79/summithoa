/**
 * Compresses an image file on the client side before uploading to Firestore.
 * Resizes the image to fit within maximum dimensions and converts it to a compressed JPEG.
 * 
 * @param {File} file The uploaded image File object
 * @param {number} maxWidth Maximum width in pixels (default 800)
 * @param {number} maxHeight Maximum height in pixels (default 800)
 * @param {number} quality JPEG quality factor from 0.0 to 1.0 (default 0.7)
 * @returns {Promise<string>} A promise that resolves to the compressed base64 Data URL
 */
export const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    // If the browser doesn't support FileReader or Canvas, return original uncompressed
    if (!window.FileReader || !window.HTMLCanvasElement) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target.result); // Fallback to original
          return;
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Export as compressed base64 JPEG
        try {
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        } catch (e) {
          // Fallback to original if canvas export fails (e.g. security block or format error)
          resolve(event.target.result);
        }
      };
      img.onerror = () => {
        // Fallback to original file read
        resolve(event.target.result);
      };
    };
    reader.onerror = (err) => reject(err);
  });
};
