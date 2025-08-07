import * as ort from "onnxruntime-web";

let session: ort.InferenceSession | null = null;

export async function getU2NetSession() {
  if (session) return session;

  // --- configure flags *before* the first session is created ---
  ort.env.wasm.wasmPaths = "/ort/"; // where your .wasm files live
  ort.env.wasm.simd = true;         // enable SIMD build
  ort.env.wasm.numThreads = 1;      // single-threaded

  // ↓  REMOVE this line – it no longer exists
  // await ort.env.wasm.init();

  session = await ort.InferenceSession.create("/u2netp.onnx", {
    executionProviders: ["wasm"],
  });
  return session;
}
