export function resizeImage(
  canvas: HTMLCanvasElement,
  targetWidth: number = 320,
  targetHeight: number = 320
): ImageData {
  // Create temporary canvas for resizing
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d')!;
  
  tempCanvas.width = targetWidth;
  tempCanvas.height = targetHeight;
  
  // Draw resized image
  tempCtx.drawImage(canvas, 0, 0, targetWidth, targetHeight);
  
  return tempCtx.getImageData(0, 0, targetWidth, targetHeight);
}

export function imageDataToTensor(imageData: ImageData): Float32Array {
  const { data, width, height } = imageData;
  const tensor = new Float32Array(3 * width * height);
  
  // Convert RGBA to RGB and normalize to [0, 1]
  for (let i = 0; i < width * height; i++) {
    const pixelIndex = i * 4;
    const tensorIndex = i;
    
    // Normalize RGB values to [0, 1]
    tensor[tensorIndex] = data[pixelIndex] / 255.0; // R
    tensor[tensorIndex + width * height] = data[pixelIndex + 1] / 255.0; // G
    tensor[tensorIndex + 2 * width * height] = data[pixelIndex + 2] / 255.0; // B
  }
  
  return tensor;
}

export function loadImageFromFile(file: File): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      resolve(canvas);
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}