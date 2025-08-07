import * as ort from "onnxruntime-web";

/** one global session to reuse */
let session: ort.InferenceSession | null = null;

/** call once, returns ready session */
export async function getU2NetSession() {
  if (session) return session;

  // tell ORT where its helper WASM lives
  ort.env.wasm.wasmPaths = "/ort/";
  ort.env.wasm.simd = true;          // use SIMD build
  ort.env.wasm.numThreads = 1;       // single-threaded to avoid cross-origin threads
  await ort.env.wasm.init();

  session = await ort.InferenceSession.create("/u2netp.onnx", {
    executionProviders: ["wasm"],
  });
  return session;
}
