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
    // Show coming soon message instead of broken link
    alert('Payment integration coming soon! For demo purposes, click "simulate pro upgrade" below.');
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
                <h2 className="text-3xl font-bold text-gray-900">Simple, Transparent Pricing</h2>
                <p className="mt-4 text-lg text-gray-600">Choose the perfect plan for your needs</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Free Plan */}
                <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="absolute -top-4 left-8">
                    <span className="px-4 py-1 bg-gray-600 text-white text-sm font-semibold rounded-full">
                      STARTER
                    </span>
                  </div>
                  
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Free Forever</h3>
                    <div className="flex items-baseline">
                      <span className="text-5xl font-extrabold text-gray-900">$0</span>
                      <span className="ml-2 text-gray-500">/month</span>
                    </div>
                    <p className="mt-4 text-gray-600">Perfect for trying out our service</p>
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-gray-700">{FREE_LIMIT} background removals per month</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-gray-700">Standard quality exports</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-gray-700">No signup required</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center mt-0.5">
                        <X className="w-3 h-3 text-gray-400" />
                      </div>
                      <span className="text-gray-400 line-through">High resolution exports</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center mt-0.5">
                        <X className="w-3 h-3 text-gray-400" />
                      </div>
                      <span className="text-gray-400 line-through">Batch processing</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center mt-0.5">
                        <X className="w-3 h-3 text-gray-400" />
                      </div>
                      <span className="text-gray-400 line-through">Priority support</span>
                    </li>
                  </ul>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                  >
                    Get Started
                  </button>
                </div>

                {/* Pro Plan */}
                <div className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow border-2 border-blue-500 transform hover:scale-105">
                  <div className="absolute -top-4 left-8">
                    <span className="px-4 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold rounded-full">
                      MOST POPULAR
                    </span>
                  </div>
                  
                  <div className="absolute top-4 right-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Professional</h3>
                    <div className="flex items-baseline">
                      <span className="text-5xl font-extrabold text-gray-900">$9</span>
                      <span className="text-2xl font-bold text-gray-900">.99</span>
                      <span className="ml-2 text-gray-500">/month</span>
                    </div>
                    <p className="mt-4 text-gray-600">Everything you need for professional work</p>
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-blue-600" />
                      </div>
                      <span className="text-gray-700"><strong>Unlimited</strong> background removals</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-blue-600" />
                      </div>
                      <span className="text-gray-700">Ultra HD quality exports (4K)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-blue-600" />
                      </div>
                      <span className="text-gray-700">Batch processing (up to 100 images)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-blue-600" />
                      </div>
                      <span className="text-gray-700">Priority AI processing</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-blue-600" />
                      </div>
                      <span className="text-gray-700">24/7 priority support</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-blue-600" />
                      </div>
                      <span className="text-gray-700">Commercial license included</span>
                    </li>
                  </ul>

                  <button
                    onClick={handleUpgrade}
                    className="w-full py-3 px-6 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all relative overflow-hidden group"
                    style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)' }}
                  >
                    <span className="relative z-10">Upgrade to Pro</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>

                  <p className="text-center text-sm text-gray-500 mt-4">
                    No credit card required • Cancel anytime
                  </p>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-16 flex flex-wrap justify-center items-center gap-8">
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="font-medium">30-Day Money Back</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="font-medium">Secure Payment</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="font-medium">Instant Activation</span>
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

      <footer className="bg-gray-900 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)' }}
                >
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-xl">BackgroundAI</span>
              </div>
              <p className="text-gray-400 text-sm">
                Professional background removal powered by advanced AI technology.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Access</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Enterprise</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">Get in Touch</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:support@backgroundai.com" className="hover:text-white transition-colors">
                    support@backgroundai.com
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>1-800-BGREMOVE</span>
                </li>
              </ul>

              <div className="flex gap-4 mt-6">
                <a href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2024 BackgroundAI. All rights reserved.
              </p>
              <p className="text-gray-400 text-sm mt-4 md:mt-0">
                Made with ❤️ by the BackgroundAI Team
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}