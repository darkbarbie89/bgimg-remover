import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  Download,
  Sparkles,
  Check,
  Loader2,
  X,
  ArrowRight,
  Image as ImageIcon,
  Crown,
  Lock,
  CheckCircle,
} from "lucide-react";
import { BackgroundRemover } from "../utils/onnx";

const remover = new BackgroundRemover();

// Monetization constants
const FREE_LIMIT = 5;
const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/demo-link";

export default function BackgroundRemoverApp() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  
  // Monetization states
  const [usageCount, setUsageCount] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isPro, setIsPro] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load AI model
    remover
      .loadModel()
      .then(() => setModelLoaded(true))
      .catch((e) => console.error("Model load fail", e));

    // Check usage count
    const count = localStorage.getItem('bgRemoveCount');
    setUsageCount(count ? parseInt(count) : 0);
    
    // Check if user is pro
    const proStatus = localStorage.getItem('bgRemovePro');
    setIsPro(proStatus === 'true');
  }, []);

  const getRemainingUses = () => {
    if (isPro) return Infinity;
    return Math.max(0, FREE_LIMIT - usageCount);
  };

  const incrementUsage = () => {
    if (isPro) return;
    const newCount = usageCount + 1;
    setUsageCount(newCount);
    localStorage.setItem('bgRemoveCount', newCount.toString());
    
    if (newCount >= FREE_LIMIT) {
      setShowUpgradeModal(true);
    }
  };

  const handleUpgrade = () => {
    window.open(STRIPE_PAYMENT_LINK, '_blank');
  };

  const simulateProUpgrade = () => {
    setIsPro(true);
    localStorage.setItem('bgRemovePro', 'true');
    setShowUpgradeModal(false);
  };

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
    if (!isPro && usageCount >= FREE_LIMIT) {
      setShowUpgradeModal(true);
      return;
    }

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
    
    if (!isPro && usageCount >= FREE_LIMIT) {
      setShowUpgradeModal(true);
      return;
    }

    setIsProcessing(true);

    const img = new Image();
    img.onload = async () => {
      try {
        const canvas = await remover.removeBackground(img);
        setProcessedImage(canvas.toDataURL("image/png"));
        incrementUsage();
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
      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div 
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' }}
              >
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Upgrade to Pro
              </h3>
              <p className="text-gray-600">
                You've used all {FREE_LIMIT} free background removals
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                $9.99<span className="text-lg font-normal text-gray-600">/month</span>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Unlimited background removals</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>High resolution exports</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Batch processing</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Priority support</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleUpgrade}
                className="flex-1 px-6 py-3 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)' }}
              >
                Upgrade Now
              </button>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all"
              >
                Maybe Later
              </button>
            </div>

            <button
              onClick={simulateProUpgrade}
              className="w-full mt-3 text-xs text-gray-500 hover:text-gray-700"
            >
              (Demo: Click to simulate pro upgrade)
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)' }}
              >
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">BackgroundAI</span>
              {isPro && (
                <span className="ml-2 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full">
                  PRO
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              {!isPro && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
                  <span className="text-sm font-medium text-gray-700">
                    {getRemainingUses()}/{FREE_LIMIT} free uses left
                  </span>
                </div>
              )}
              
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
        <>
          {/* Hero Section */}
          <section className="relative overflow-hidden bg-white pt-20 pb-12 lg:pt-32 lg:pb-20">
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle, #3B82F6 0%, #8B5CF6 100%)' }}
            />
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
                <div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                    Remove Backgrounds
                    <span 
                      className="block mt-2"
                      style={{
                        background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      Instantly with AI
                    </span>
                  </h1>
                  
                  <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                    Professional-quality background removal powered by advanced AI. 
                    Start with {FREE_LIMIT} free images, then upgrade for unlimited access.
                  </p>

                  <div className="mt-8 flex flex-wrap gap-4">
                    <button
                      onClick={() => {
                        if (!isPro && usageCount >= FREE_LIMIT) {
                          setShowUpgradeModal(true);
                        } else {
                          fileInputRef.current?.click();
                        }
                      }}
                      className="px-8 py-4 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center gap-2"
                      style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)' }}
                    >
                      {!isPro && usageCount >= FREE_LIMIT ? (
                        <>
                          <Lock className="w-5 h-5" />
                          Upgrade to Continue
                        </>
                      ) : (
                        <>
                          Get Started Free
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>

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
                      <div className="text-3xl font-bold text-gray-900">
                        {isPro ? '∞' : getRemainingUses()}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {isPro ? 'Unlimited' : 'Free Uses'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 lg:mt-0">
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (!isPro && usageCount >= FREE_LIMIT) return;
                      setIsDragging(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                    }}
                    onDrop={handleDrop}
                    onClick={() => {
                      if (!isPro && usageCount >= FREE_LIMIT) {
                        setShowUpgradeModal(true);
                      } else {
                        fileInputRef.current?.click();
                      }
                    }}
                    className={`
                      relative rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer
                      transition-all duration-300 bg-gradient-to-br
                      ${isDragging 
                        ? 'border-blue-500 from-blue-50 to-purple-50 scale-[1.02]' 
                        : 'border-gray-300 from-gray-50 to-white hover:border-gray-400'}
                      ${!isPro && usageCount >= FREE_LIMIT ? 'opacity-75' : ''}
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
                      style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)' }}
                    >
                      {!isPro && usageCount >= FREE_LIMIT ? (
                        <Lock className="w-8 h-8 text-white" />
                      ) : (
                        <Upload className="w-8 h-8 text-white" />
                      )}
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {!isPro && usageCount >= FREE_LIMIT 
                        ? "Upgrade to Continue"
                        : "Drop your image here"}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {!isPro && usageCount >= FREE_LIMIT 
                        ? "You've used all free removals"
                        : "or click to browse"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900">Simple Pricing</h2>
                <p className="mt-4 text-lg text-gray-600">Start free, upgrade when you need more</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900">Free</h3>
                  <div className="mt-2 mb-6">
                    <span className="text-4xl font-bold">$0</span>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <span>{FREE_LIMIT} background removals</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <span>Basic quality</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 shadow-lg border-2 border-blue-500">
                  <h3 className="text-2xl font-bold text-gray-900">Pro</h3>
                  <div className="mt-2 mb-6">
                    <span className="text-4xl font-bold">$9.99</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <span className="font-semibold">Unlimited removals</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <span>High resolution export</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <span>Priority support</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {isProcessing ? "Processing..." : processedImage ? "Complete!" : "Ready to Process"}
                  </h2>
                </div>
                <button
                  onClick={resetAll}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">Original</h3>
                  <div className="rounded-lg overflow-hidden border border-gray-200">
                    <img src={originalImage} alt="Original" className="w-full h-auto" />
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-3">Result</h3>
                  <div className="rounded-lg overflow-hidden border border-gray-200">
                    {!processedImage ? (
                      <div className="aspect-square bg-gray-50 flex items-center justify-center">
                        {isProcessing ? (
                          <div className="text-center">
                            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                            <p className="text-gray-700">Removing background...</p>
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
                          style={{ backgroundImage: 'repeating-conic-gradient(#f3f4f6 0% 25%, white 0% 50%) 50% / 20px 20px' }}
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
                    disabled={isProcessing || !modelLoaded || (!isPro && usageCount >= FREE_LIMIT)}
                    className={`
                      px-8 py-3 rounded-lg font-semibold text-white transition-all
                      flex items-center gap-2 shadow-lg
                      ${isProcessing || !modelLoaded || (!isPro && usageCount >= FREE_LIMIT) 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'hover:shadow-xl transform hover:-translate-y-0.5'}
                    `}
                    style={
                      !isProcessing && modelLoaded && (isPro || usageCount < FREE_LIMIT)
                        ? { background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)' }
                        : {}
                    }
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (!isPro && usageCount >= FREE_LIMIT) ? (
                      <>
                        <Lock className="w-5 h-5" />
                        Upgrade to Continue
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

      <footer className="bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-500">
            © 2024 BackgroundAI • 100% Browser-Based
          </div>
        </div>
      </footer>
    </div>
  );
}