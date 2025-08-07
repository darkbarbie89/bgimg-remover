import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  Download,
  Sparkles,
  Check,
  Loader2,
  X,
  Zap,
  Shield,
  Clock,
  ArrowRight,
  Image as ImageIcon,
} from "lucide-react";
import { BackgroundRemover } from "../utils/onnx";

const remover = new BackgroundRemover();

export default function BackgroundRemoverApp() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    remover
      .loadModel()
      .then(() => setModelLoaded(true))
      .catch((e) => console.error("Model load fail", e));
  }, []);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) loadFile(file);
  }

  function loadFile(file: File) {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("Please upload an image smaller than 10MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string);
      setProcessedImage(null);
    };
    reader.readAsDataURL(file);
  }

  async function processImage() {
    if (!originalImage) return;
    setIsProcessing(true);

    const img = new Image();
    img.onload = async () => {
      try {
        const canvas = await remover.removeBackground(img);
        setProcessedImage(canvas.toDataURL("image/png"));
      } catch (err) {
        console.error(err);
        alert("Processing failed. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    };
    img.src = originalImage;
  }

  const downloadImage = () => {
    if (!processedImage) return;
    const a = document.createElement("a");
    a.href = processedImage;
    a.download = `removed-bg-${Date.now()}.png`;
    a.click();
  };

  const resetAll = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                }}
              >
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">BackgroundAI</span>
            </div>

            <div className="flex items-center gap-4">
              {!modelLoaded ? (
                <span className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading AI...
                </span>
              ) : (
                <span className="flex items-center gap-2 text-sm text-green-600">
                  <Check className="w-4 h-4" />
                  AI Ready
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {!originalImage ? (
        /* Landing Page */
        <>
          {/* Hero Section */}
          <section className="relative overflow-hidden bg-white pt-20 pb-12 lg:pt-32 lg:pb-20">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle, #3B82F6 0%, #8B5CF6 100%)' }}
            />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle, #8B5CF6 0%, #3B82F6 100%)' }}
            />
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
                {/* Left Content */}
                <div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                    Remove Backgrounds
                    <span 
                      className="block mt-2"
                      style={{
                        background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      Instantly with AI
                    </span>
                  </h1>
                  
                  <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                    Professional-quality background removal powered by advanced AI. 
                    No uploads, no waiting - everything happens instantly in your browser.
                  </p>

                  <div className="mt-8 flex flex-wrap gap-4">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-8 py-4 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center gap-2"
                      style={{ 
                        background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                      }}
                    >
                      Get Started Free
                      <ArrowRight className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-center gap-2 px-6 py-4">
                      <Shield className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600">100% Private & Secure</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mt-12 grid grid-cols-3 gap-8">
                    <div>
                      <div className="text-3xl font-bold text-gray-900">0ms</div>
                      <div className="text-sm text-gray-600 mt-1">Upload Time</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-gray-900">100%</div>
                      <div className="text-sm text-gray-600 mt-1">Private</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-gray-900">∞</div>
                      <div className="text-sm text-gray-600 mt-1">Images</div>
                    </div>
                  </div>
                </div>

                {/* Right Content - Upload Area */}
                <div className="mt-12 lg:mt-0">
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                    }}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                      relative rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer
                      transition-all duration-300 bg-gradient-to-br
                      ${isDragging 
                        ? 'border-blue-500 from-blue-50 to-purple-50 scale-[1.02]' 
                        : 'border-gray-300 from-gray-50 to-white hover:border-gray-400'
                      }
                    `}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    
                    <div 
                      className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center"
                      style={{ 
                        background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                      }}
                    >
                      <Upload className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Drop your image here
                    </h3>
                    <p className="text-gray-500 mb-4">or click to browse</p>
                    
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                      <span className="px-2 py-1 bg-white rounded border border-gray-200">PNG</span>
                      <span className="px-2 py-1 bg-white rounded border border-gray-200">JPG</span>
                      <span className="px-2 py-1 bg-white rounded border border-gray-200">WEBP</span>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute top-4 right-4 w-20 h-20 rounded-full opacity-10"
                      style={{ background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)' }}
                    />
                    <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full opacity-10"
                      style={{ background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900">Why Choose BackgroundAI?</h2>
                <p className="mt-4 text-lg text-gray-600">Everything you need for perfect background removal</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)' }}
                  >
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">100% Private</h3>
                  <p className="text-gray-600">Your images never leave your browser. All processing happens locally on your device.</p>
                </div>

                <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)' }}
                  >
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h3>
                  <p className="text-gray-600">Get results in seconds with our optimized AI model running directly in your browser.</p>
                </div>

                <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)' }}
                  >
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Unlimited Use</h3>
                  <p className="text-gray-600">Process as many images as you want. No limits, no subscriptions, completely free.</p>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : (
        /* Processing Screen */
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {isProcessing ? "Processing..." : processedImage ? "Complete!" : "Ready to Process"}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {isProcessing ? "AI is removing the background..." : processedImage ? "Your image is ready to download" : "Click below to start"}
                  </p>
                </div>
                
                <button
                  onClick={resetAll}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Original */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-700">Original</span>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">INPUT</span>
                  </div>
                  <div className="rounded-lg overflow-hidden border border-gray-200">
                    <img src={originalImage} alt="Original" className="w-full h-auto" />
                  </div>
                </div>

                {/* Result */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-700">Result</span>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">OUTPUT</span>
                  </div>
                  <div className="rounded-lg overflow-hidden border border-gray-200">
                    {!processedImage ? (
                      <div className="aspect-square bg-gray-50 flex items-center justify-center">
                        {isProcessing ? (
                          <div className="text-center">
                            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                            <p className="text-gray-700 font-medium">Removing background...</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Result will appear here</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="relative">
                        <div 
                          className="absolute inset-0"
                          style={{
                            backgroundImage: 'repeating-conic-gradient(#f3f4f6 0% 25%, white 0% 50%) 50% / 20px 20px'
                          }}
                        />
                        <img src={processedImage} alt="Result" className="relative w-full h-auto" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                {!processedImage ? (
                  <button
                    onClick={processImage}
                    disabled={isProcessing || !modelLoaded}
                    className={`
                      px-8 py-3 rounded-lg font-semibold text-white transition-all
                      flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                      ${isProcessing || !modelLoaded ? 'bg-gray-400 cursor-not-allowed' : ''}
                    `}
                    style={
                      !isProcessing && modelLoaded 
                        ? { background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)' }
                        : {}
                    }
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Remove Background
                      </>
                    )}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={downloadImage}
                      className="px-8 py-3 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center gap-2"
                      style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)' }}
                    >
                      <Download className="w-5 h-5" />
                      Download PNG
                    </button>
                    
                    <button
                      onClick={resetAll}
                      className="px-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                    >
                      Process Another
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-500">
            © 2024 BackgroundAI • Powered by Advanced AI • 100% Browser-Based
          </div>
        </div>
      </footer>
    </div>
  );
}