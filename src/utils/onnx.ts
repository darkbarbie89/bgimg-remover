import * as ort from "onnxruntime-web";

/** One global ORT session so we don’t reload the model every time */
let globalSession: ort.InferenceSession | null = null;

/** Utility class the UI can call */
export class BackgroundRemover {
  /** Load model + WASM helpers once */
  async loadModel() {
    if (globalSession) return; // already loaded

    // Tell ORT where the helper .wasm files live
    ort.env.wasm.wasmPaths = "/ort/";
    ort.env.wasm.simd = true;   // ok in 1.14
    // numThreads flag not available in 1.14 – omit

  

    globalSession = await ort.InferenceSession.create("/silueta.onnx", {
  executionProviders: ["wasm"],
});

  }

  /** Remove background and return a canvas with transparency */
  async removeBackground(img: HTMLImageElement): Promise<HTMLCanvasElement> {
    if (!globalSession) throw new Error("Model not loaded");

    // -------- 1. PRE-PROCESS ------------
    const W = 320, H = 320; // input size for u2netp
    const tmp = document.createElement("canvas");
    tmp.width = W;
    tmp.height = H;
    const tctx = tmp.getContext("2d")!;
    tctx.drawImage(img, 0, 0, W, H);
    const { data } = tctx.getImageData(0, 0, W, H);

    const float = new Float32Array(1 * 3 * W * H);
    for (let i = 0; i < W * H; i++) {
      float[i]             = data[i * 4]     / 255; // R
      float[i + W * H]     = data[i * 4 + 1] / 255; // G
      float[i + 2 * W * H] = data[i * 4 + 2] / 255; // B
    }
    const inputTensor = new ort.Tensor("float32", float, [1, 3, H, W]);

    // -------- 2. INFERENCE -------------
    // --- inference ---
const feeds: Record<string, ort.Tensor> = {};
feeds[globalSession.inputNames[0]] = inputTensor; // use actual input name
const outputMap = await globalSession.run(feeds);
const mask = outputMap[globalSession.outputNames[0]] as ort.Tensor;

    // -------- 3. POST-PROCESS ----------
   // -------- 3. POST-PROCESS ----------
// Replace your current post-processing with this:
const maskArr = mask.data as Float32Array;

const out = document.createElement("canvas");
out.width = img.width;
out.height = img.height;
const octx = out.getContext("2d")!;
octx.drawImage(img, 0, 0);

const imgData = octx.getImageData(0, 0, img.width, img.height);

// Better interpolation for upscaling mask
for (let y = 0; y < img.height; y++) {
  for (let x = 0; x < img.width; x++) {
    // Bilinear interpolation instead of nearest neighbor
    const sx = x * 320 / img.width;
    const sy = y * 320 / img.height;
    
    const x0 = Math.floor(sx);
    const x1 = Math.min(x0 + 1, 319);
    const y0 = Math.floor(sy);
    const y1 = Math.min(y0 + 1, 319);
    
    const fx = sx - x0;
    const fy = sy - y0;
    
    const v00 = maskArr[y0 * 320 + x0];
    const v10 = maskArr[y0 * 320 + x1];
    const v01 = maskArr[y1 * 320 + x0];
    const v11 = maskArr[y1 * 320 + x1];
    
    const v0 = v00 * (1 - fx) + v10 * fx;
    const v1 = v01 * (1 - fx) + v11 * fx;
    const alpha = (v0 * (1 - fy) + v1 * fy) * 255;
    
    imgData.data[(y * img.width + x) * 4 + 3] = alpha;
  }
}

// Gentler edge smoothing
for (let pass = 0; pass < 1; pass++) { // Reduced to 1 pass
  for (let y = 1; y < img.height - 1; y++) {
    for (let x = 1; x < img.width - 1; x++) {
      const idx = (y * img.width + x) * 4 + 3;
      const a = imgData.data[idx] * 0.6 + // Give more weight to original
        (imgData.data[idx - img.width * 4] +
         imgData.data[idx + img.width * 4] +
         imgData.data[idx - 4] +
         imgData.data[idx + 4]) * 0.1;
      imgData.data[idx] = a;
    }
  }
}

// Softer threshold - keep more of the person
for (let i = 3; i < imgData.data.length; i += 4) {
  const a = imgData.data[i];
  imgData.data[i] = a > 240 ? 255 : a < 15 ? 0 : a; // Changed from 200/30
}

/* ----- hard threshold to kill stray speckles ----- */
for (let i = 3; i < imgData.data.length; i += 4) {
  const a = imgData.data[i];
  imgData.data[i] = a > 200 ? 255 : a < 30 ? 0 : a;
}
/* -------------------------------------------------- */

octx.putImageData(imgData, 0, 0);
return out;

  }
}
