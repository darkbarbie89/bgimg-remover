import * as ort from "onnxruntime-web";
import { getU2NetSession } from "./u2net-loader";

/** resize image to 320×320 (U2Net-p input) and get tensor */
function imageToTensor(img: HTMLImageElement): ort.Tensor {
  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 320;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, 320, 320);

  const { data } = ctx.getImageData(0, 0, 320, 320);
  const floatArr = new Float32Array(1 * 3 * 320 * 320);

  for (let i = 0; i < 320 * 320; i++) {
    floatArr[i]                     = data[i * 4]     / 255; // R
    floatArr[i + 320 * 320]         = data[i * 4 + 1] / 255; // G
    floatArr[i + 2 * 320 * 320]     = data[i * 4 + 2] / 255; // B
  }
  return new ort.Tensor("float32", floatArr, [1, 3, 320, 320]);
}

export async function removeBg(img: HTMLImageElement): Promise<HTMLCanvasElement> {
  const session = await getU2NetSession();
  const inputTensor = imageToTensor(img);
  const output = await session.run({ input: inputTensor });
  const mask = output["output"]; // (1,1,320,320)

  // Convert mask→alpha canvas at original size
  const maskData = mask.data as Float32Array;
  const outCanvas = document.createElement("canvas");
  outCanvas.width = img.width;
  outCanvas.height = img.height;
  const octx = outCanvas.getContext("2d")!;
  octx.drawImage(img, 0, 0);
  const imgData = octx.getImageData(0, 0, img.width, img.height);

  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      const idx320 = Math.floor(y * 320 / img.height) * 320 + Math.floor(x * 320 / img.width);
      const alpha = maskData[idx320] * 255;
      const idx4 = (y * img.width + x) * 4 + 3;
      imgData.data[idx4] = alpha;
    }
  }
  octx.putImageData(imgData, 0, 0);
  return outCanvas;
}
