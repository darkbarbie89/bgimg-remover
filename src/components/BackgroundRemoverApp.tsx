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

// Demo images data
const demoImages = [
  { src: "/demos/cosmetic.jpg", alt: "Cosmetics" },
  { src: "/demos/potrait.png", alt: "Portrait" },
  { src: "/demos/product.png", alt: "Product" },
  { src: "/demos/product2.jpg", alt: "Product 2" },
  { src: "/demos/potrait2.jpg", alt: "Portrait 2" }
];

// Function to load demo images
const loadDemoImage = async (imagePath: string) => {
  try {
    const response = await fetch(imagePath);
    const blob = await response.blob();
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string);
      setProcessedImage(null);
    };
    reader.readAsDataURL(blob);
  } catch (error) {
    console.error("Failed to load demo image:", error);
  }
};

  useEffect(() => {
    // Load AI model
    remover
      .loadModel()
      .then(() => setModelLoaded(true))
      .catch((e) => console.error("Model load fail", e));

      

    // Check usage count
    const count = localStorage.getItem("bgRemoveCount");
    setUsageCount(count ? parseInt(count) : 0);

    // Check if user is pro
    const proStatus = localStorage.getItem("bgRemovePro");
    setIsPro(proStatus === "true");

    // Check for lifetime access
  if (localStorage.getItem("bgimg_lifetime") === "true") {
    // Lifetime users bypass all limits but keep pricing visible
  }
  }, []);

// Auto-process image when uploaded
useEffect(() => {
  if (originalImage && !processedImage && !isProcessing && modelLoaded) {
    // Small delay to ensure UI updates
    const timer = setTimeout(() => {
      processImage();
    }, 100);
    
    return () => clearTimeout(timer);
  }
}, [originalImage, modelLoaded]); // Run when image is loaded or model is ready

async function processImage() {
    if (!originalImage) return;

    if (!isPro && !localStorage.getItem("bgimg_lifetime") && usageCount >= FREE_LIMIT) {
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

  const getRemainingUses = () => {
  if (localStorage.getItem("bgimg_lifetime") === "true") return Infinity;
  if (isPro) return Infinity;
  return Math.max(0, FREE_LIMIT - usageCount);
};

  const incrementUsage = () => {
  if (localStorage.getItem("bgimg_lifetime") === "true") return;
  if (isPro) return;
  const newCount = usageCount + 1;
  setUsageCount(newCount);
  localStorage.setItem("bgRemoveCount", newCount.toString());

  if (newCount >= FREE_LIMIT) {
    setShowUpgradeModal(true);
  }
};

  const handleUpgrade = () => {
    // Placeholder until payments wired
    alert(
      'Payment integration coming soon! For demo purposes, click "simulate pro upgrade" below.'
    );
  };

  const simulateProUpgrade = () => {
    setIsPro(true);
    localStorage.setItem("bgRemovePro", "true");
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
  if (!isPro && !localStorage.getItem("bgimg_lifetime") && usageCount >= FREE_LIMIT) {
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
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1">
        {/* Upgrade Modal */}
        {showUpgradeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
              <div className="text-center mb-6">
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                  }}
                >
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Upgrade to Pro
                </h3>
                <p className="text-gray-600">
                  You&apos;ve used all {FREE_LIMIT} free background removals
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  $9.99
                  <span className="text-lg font-normal text-gray-600">
                    /month
                  </span>
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
                  style={{
                    background:
                      "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
                  }}
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
  <a href="/" className="cursor-pointer">
    <img
      src="/logo-black.png"
      alt="BgImg Logo"
      className="h-12 w-auto object-contain hover:opacity-80 transition-opacity"
    />
  </a>
        
        {(isPro || localStorage.getItem("bgimg_lifetime") === "true") && (
  <span className="ml-2 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full">
    {localStorage.getItem("bgimg_lifetime") === "true" ? "LIFETIME" : "PRO"}
  </span>
)}
        
      </div>

      <div className="flex items-center gap-4">
        {!isPro && localStorage.getItem("bgimg_lifetime") !== "true" && (
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


        {/* Hero Section (shown when no image yet) */}
        {!originalImage ? (
          <>
            <section className="relative overflow-hidden bg-white pt-20 pb-12 lg:pt-32 lg:pb-20">
              <div
                className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 rounded-full opacity-10"
                style={{
                  background:
                    "radial-gradient(circle, #3B82F6 0%, #8B5CF6 100%)",
                }}
              />

              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
                  <div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                      Remove Backgrounds
                      <span
                        className="block mt-2"
                        style={{
                          background:
                            "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        Instantly with AI
                      </span>
                    </h1>

                    <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                      Professional-quality background removal powered by advanced
                      AI. Start with {FREE_LIMIT} free images, then upgrade for
                      unlimited access.
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
                        style={{
                          background:
                            "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
                        }}
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
                        <div className="text-3xl font-bold text-gray-900">
                          0ms
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Upload Time
                        </div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-gray-900">
                          100%
                        </div>
                        <div className="text-sm text-gray-600 mt-1">Private</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-gray-900">
                          {isPro ? "∞" : getRemainingUses()}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {isPro ? "Unlimited" : "Free Uses"}
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
                      className={`relative rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-300 bg-gradient-to-br ${
                        isDragging
                          ? "border-blue-500 from-blue-50 to-purple-50 scale-[1.02]"
                          : "border-gray-300 from-gray-50 to-white hover:border-gray-400"
                      } ${!isPro && usageCount >= FREE_LIMIT ? "opacity-75" : ""}`}
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
                          background:
                            "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
                        }}
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
    ? "You&apos;ve used all free removals"
    : "or click to browse"}
</p>
</div>

{/* Demo Images Section */}
<div className="mt-8 text-center">
  <p className="text-sm text-gray-600 mb-3">No image? Try one of these:</p>
  <div className="flex justify-center gap-3">
    {demoImages.map((demo, index) => (
      <button
        key={index}
        onClick={() => loadDemoImage(demo.src)}
        className="group relative"
      >
        <img
          src={demo.src}
          alt={demo.alt}
          className="w-20 h-20 object-cover rounded-lg shadow-md group-hover:shadow-xl transition-all transform group-hover:scale-105"
        />
        <span className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all" />
      </button>
    ))}
  </div>
</div>

</div>
</div>
</div>
</section>

            {/* Pricing Section */}
            <section className="py-20 bg-gray-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900">
                    Simple, Transparent Pricing
                  </h2>
                  <p className="mt-4 text-lg text-gray-600">
                    Choose the perfect plan for your needs
                  </p>
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
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        Free Forever
                      </h3>
                      <div className="flex items-baseline">
                        <span className="text-5xl font-extrabold text-gray-900">
                          $0
                        </span>
                        <span className="ml-2 text-gray-500">/month</span>
                      </div>
                      <p className="mt-4 text-gray-600">
                        Perfect for trying out our service
                      </p>
                    </div>

                    <ul className="space-y-4 mb-8">
                      <li className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-gray-700">
                          {FREE_LIMIT} background removals per month
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-gray-700">
                          Standard quality exports
                        </span>
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
                        <span className="text-gray-400 line-through">
                          High resolution exports
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center mt-0.5">
                          <X className="w-3 h-3 text-gray-400" />
                        </div>
                        <span className="text-gray-400 line-through">
                          Batch processing
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center mt-0.5">
                          <X className="w-3 h-3 text-gray-400" />
                        </div>
                        <span className="text-gray-400 line-through">
                          Priority support
                        </span>
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
                  {/* Pro Plan */}
<div className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow border-2 border-blue-500 transform hover:scale-105">
  <div className="absolute -top-4 left-8">
    <span className="px-4 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold rounded-full">
      RECOMMENDED
    </span>
  </div>

  <div className="absolute top-4 right-4">
    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center">
      <Crown className="w-6 h-6 text-white" />
    </div>
  </div>

  <div className="mb-8">
    <h3 className="text-2xl font-bold text-gray-900 mb-4">
      Professional
    </h3>
    <div className="flex items-baseline">
      <span className="text-5xl font-extrabold text-gray-900">
        $9
      </span>
      <span className="text-2xl font-bold text-gray-900">
        .99
      </span>
      <span className="ml-2 text-gray-500">/month</span>
    </div>
    <p className="mt-4 text-gray-600">
      Perfect for professionals and businesses
    </p>
  </div>

  <ul className="space-y-4 mb-8">
    <li className="flex items-start gap-3">
      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
        <Check className="w-3 h-3 text-blue-600" />
      </div>
      <span className="text-gray-700">
        <strong>Unlimited</strong> background removals
      </span>
    </li>
    <li className="flex items-start gap-3">
      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
        <Check className="w-3 h-3 text-blue-600" />
      </div>
      <span className="text-gray-700">
        Full resolution exports (original quality)
      </span>
    </li>
    <li className="flex items-start gap-3">
      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
        <Check className="w-3 h-3 text-blue-600" />
      </div>
      <span className="text-gray-700">
        No watermarks on exports
      </span>
    </li>
    <li className="flex items-start gap-3">
      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
        <Check className="w-3 h-3 text-blue-600" />
      </div>
      <span className="text-gray-700">
        Commercial usage rights
      </span>
    </li>
    <li className="flex items-start gap-3">
      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
        <Check className="w-3 h-3 text-blue-600" />
      </div>
      <span className="text-gray-700">
        Priority processing queue
      </span>
    </li>
    <li className="flex items-start gap-3">
      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
        <Check className="w-3 h-3 text-blue-600" />
      </div>
      <span className="text-gray-700">
        Download history & re-download
      </span>
    </li>
  </ul>

                    <button
                      onClick={handleUpgrade}
                      className="w-full py-3 px-6 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all relative overflow-hidden group"
                      style={{
                        background:
                          "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
                      }}
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
          // Processing / Result screen
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
  {processedImage 
    ? "Complete!" 
    : (originalImage && !processedImage) 
    ? "Processing..." 
    : "Ready to Process"}
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
                      <img
                        src={originalImage || ""}
                        alt="Original"
                        className="w-full h-auto"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-700 mb-3">Result</h3>
                    <div className="rounded-lg overflow-hidden border border-gray-200">
                      {!processedImage ? (
  <div className="aspect-square bg-gray-50 flex items-center justify-center">
    {originalImage ? (
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-700">
          Removing background...
        </p>
        <p className="text-sm text-gray-500 mt-2">
          This may take a few seconds
        </p>
      </div>
    ) : (
      <div className="text-center">
        <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">
          Result will appear here
        </p>
      </div>
    )}
  </div>
                          
                      ) : (
                        <div className="relative">
                          <div
                            className="absolute inset-0"
                            style={{
                              backgroundImage:
                                "repeating-conic-gradient(#f3f4f6 0% 25%, white 0% 50%) 50% / 20px 20px",
                            }}
                          />
                          <img
                            src={processedImage}
                            alt="Result"
                            className="relative w-full h-auto"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4">
                  {!processedImage ? (
                    <button
                      onClick={processImage}
                      disabled={
                        isProcessing ||
                        !modelLoaded ||
                        (!isPro && usageCount >= FREE_LIMIT)
                      }
                      className={`px-8 py-3 rounded-lg font-semibold text-white transition-all flex items-center gap-2 shadow-lg ${
                        isProcessing ||
                        !modelLoaded ||
                        (!isPro && usageCount >= FREE_LIMIT)
                          ? "bg-gray-400 cursor-not-allowed"
                          : "hover:shadow-xl transform hover:-translate-y-0.5"
                      }`}
                      style={
                        !isProcessing &&
                        modelLoaded &&
                        (isPro || usageCount < FREE_LIMIT)
                          ? {
                              background:
                                "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
                            }
                          : {}
                      }
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing Automatically...
                        </>
                      ) : !isPro && usageCount >= FREE_LIMIT ? (
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
                        style={{
                          background:
                            "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
                        }}
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
      </main>

      {/* Footer (forced dark background that works in Tailwind v4) */}
     <footer
  className="text-white relative overflow-hidden"
  style={{
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  }}
>
  {/* Decorative circles */}
  <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
  <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2" />

  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    {/* Top Row */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      {/* Logo & Description */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <img
            src="/logo-white.png"
            alt="BackgroundAI Logo"
            className="h-12 w-auto object-contain"
          />
        </div>
        <p className="text-sm text-white/80">
          Professional background removal powered by advanced AI technology.
        </p>
      </div>

      <div>
        <h4 className="font-semibold mb-4 text-white">Product</h4>
        <ul className="space-y-2 text-sm">
          <li>
            <div className="text-white/70 hover:text-white transition-colors">Features</div>
          </li>
          <li>
            <div className="text-white/70 hover:text-white transition-colors">Pricing</div>
          </li>
          <li>
            <div className="text-white/70 hover:text-white transition-colors">API Access</div>
          </li>
          <li>
            <div className="text-white/70 hover:text-white transition-colors">Enterprise</div>
          </li>
        </ul>
      </div>

      <div>
        <h4 className="font-semibold mb-4 text-white">Support</h4>
        <ul className="space-y-2 text-sm">
          <li>
            <div className="text-white/70 hover:text-white transition-colors">Help Center</div>
          </li>
          <li>
            <div className="text-white/70 hover:text-white transition-colors">Terms of Service</div>
          </li>
          <li>
            <div className="text-white/70 hover:text-white transition-colors">Privacy Policy</div>
          </li>
          <li>
            <div className="text-white/70 hover:text-white transition-colors">Contact Us</div>
          </li>
        </ul>
      </div>

      <div>
        <h4 className="font-semibold mb-4 text-white">Get in Touch</h4>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2 text-white/70">
            <span>📧</span>
            <a
              href="mailto:support@backgroundai.com"
              className="hover:text-white transition-colors"
            >
              support@bgimg.com
            </a>
          </li>
          <li className="flex items-center gap-2 text-white/70">
            <span>📞</span>
            <span>1-800-BGREMOVE</span>
          </li>
          <li className="flex gap-3 mt-4">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg flex items-center justify-center transition-all transform hover:scale-110">
              <span className="text-white font-bold">f</span>
            </div>
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg flex items-center justify-center transition-all transform hover:scale-110">
              <span className="text-white font-bold">𝕏</span>
            </div>
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg flex items-center justify-center transition-all transform hover:scale-110">
              <span className="text-white text-xs font-bold">IG</span>
            </div>
          </li>
        </ul>
      </div>
    </div>

    {/* Bottom Row */}
    <div className="mt-12 pt-8 border-t border-white/20 flex flex-col md:flex-row justify-between items-center text-sm">
      <p className="text-white/80">© 2024 BgImg. All rights reserved.</p>
      <p className="text-white/80 mt-4 md:mt-0">Made with ❤️ by the BgImg Team</p>
    </div>
  </div>
</footer>




    </div>
  );
}