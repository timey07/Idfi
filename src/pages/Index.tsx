import { useState, useRef } from "react";
import {
  Upload,
  Brain,
  X,
  Eye,
  Tag,
  Loader2,
  Download,
  Sparkles,
  Zap,
  Clipboard,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface AnalysisResult {
  tags: Array<{ name: string; confidence: number }>;
  objects: Array<{ object: string; confidence: number; rectangle: any }>;
  description: { captions: Array<{ text: string; confidence: number }> };
  categories: Array<{ name: string; score: number }>;
}

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [progress, setProgress] = useState(0);
  const [copiedResults, setCopiedResults] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image size should be less than 10MB");
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setAnalysisResult(null);
      setProgress(0);
    }
  };

 const handlePaste = async (event: React.ClipboardEvent) => {
  const items = event.clipboardData?.items;
  if (!items) return;

  let imageFound = false;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type.indexOf("image") !== -1) {
      const file = item.getAsFile();
      if (file) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error("Image size should be less than 10MB");
          return;
        }

        setSelectedImage(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
        setAnalysisResult(null);
        setProgress(0);
        toast.success("Image pasted successfully!");
        imageFound = true;
        break;
      }
    }
  }

  if (!imageFound) {
    toast.error("No image detected. Only image pasting is supported.");
  }
};


  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview("");
    setAnalysisResult(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

 const analyzeImage = async () => {
  if (!selectedImage) {
    toast.error("Please select an image first");
    return;
  }

  setIsAnalyzing(true);
  setProgress(0);

  try {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 20;
      });
    }, 300);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const arrayBuffer = reader.result;

     const response = await fetch(`${import.meta.env.VITE_API_URL}/analyze`, {
  method: "POST",
  headers: {
    "Content-Type": "application/octet-stream",
  },
  body: arrayBuffer,
});

        clearInterval(progressInterval);
        setProgress(100);

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        // Check if result is empty
        const isEmpty =
          (!data.description?.captions || data.description.captions.length === 0) &&
          (!data.tags || data.tags.length === 0) &&
          (!data.objects || data.objects.length === 0);

        if (isEmpty) {
          toast.error("Image not recognized or contains no detectable content.");
          setAnalysisResult(null);
        } else {
          setAnalysisResult(data);
          toast.success("Image analyzed successfully!");
        }
      } catch (error) {
        console.error("Analysis error:", error);
        toast.error("Failed to analyze image. Please try again.");
      } finally {
        setIsAnalyzing(false);
        setProgress(0);
      }
    };

    reader.readAsArrayBuffer(selectedImage);
  } catch (error) {
    setIsAnalyzing(false);
    setProgress(0);
    toast.error("Failed to process image");
  }
};


  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-100 text-green-800";
    if (confidence >= 0.6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const downloadResults = () => {
    if (!analysisResult) return;

    const results = {
      description:
        analysisResult.description?.captions?.[0]?.text ||
        "No description available",
      tags:
        analysisResult.tags?.map((tag) => ({
          name: tag.name,
          confidence: Math.round(tag.confidence * 100),
        })) || [],
      objects:
        analysisResult.objects?.map((obj) => ({
          object: obj.object,
          confidence: Math.round(obj.confidence * 100),
        })) || [],
      categories:
        analysisResult.categories?.map((cat) => ({
          name: cat.name,
          score: Math.round(cat.score * 100),
        })) || [],
    };

    const blob = new Blob([JSON.stringify(results, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "image-analysis-results.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Results downloaded!");
  };

  const copyResults = async () => {
    if (!analysisResult) return;

    const results = {
      description:
        analysisResult.description?.captions?.[0]?.text ||
        "No description available",
      tags:
        analysisResult.tags
          ?.map((tag) => `${tag.name} (${Math.round(tag.confidence * 100)}%)`)
          .join(", ") || "No tags detected",
      objects:
        analysisResult.objects
          ?.map((obj) => `${obj.object} (${Math.round(obj.confidence * 100)}%)`)
          .join(", ") || "No objects detected",
    };

    const textResults = `AI Description: ${results.description}\n\nTags: ${results.tags}\n\nObjects: ${results.objects}`;

    try {
      await navigator.clipboard.writeText(textResults);
      setCopiedResults(true);
      toast.success("Results copied to clipboard!");
      setTimeout(() => setCopiedResults(false), 2000);
    } catch (error) {
      toast.error("Failed to copy results");
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4"
      onPaste={handlePaste}
      tabIndex={0}
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Idfi-2.0
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Advanced AI-powered image analysis. Upload or paste images to detect objects and tags.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card className="border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="imageInput"
              />

              {!imagePreview ? (
                <div className="space-y-4">
                  <label
                    htmlFor="imageInput"
                    className="flex flex-col items-center justify-center h-48 cursor-pointer rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors"
                  >
                    <Upload className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-600">
                      Choose an image
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </label>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      toast.info("Press Ctrl+V to paste an image from clipboard")
                    }
                  >
                    <Clipboard className="w-4 h-4 mr-2" />
                    Paste Image
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <Button
                    onClick={removeImage}
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {selectedImage && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{selectedImage.name}</span>
                    <span>
                      {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>

                  {isAnalyzing && (
                    <div className="space-y-2">
                      <Progress value={progress} className="w-full" />
                      <p className="text-sm text-gray-600 text-center">
                        Analyzing image...
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={analyzeImage}
                    disabled={isAnalyzing}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        Analyze Image
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Analysis Results
                </CardTitle>
                {analysisResult && (
                  <div className="flex gap-2">
                    <Button onClick={copyResults} size="sm" variant="outline">
                      {copiedResults ? (
                        <Check className="w-4 h-4 mr-2" />
                      ) : (
                        <Copy className="w-4 h-4 mr-2" />
                      )}
                      Copy
                    </Button>
                    <Button
                      onClick={downloadResults}
                      size="sm"
                      variant="outline"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!analysisResult ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <Eye className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-lg">
                    Upload and analyze an image to see results
                  </p>
                  <p className="text-sm mt-2">
                    You can also paste images with Ctrl+V
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {analysisResult.description?.captions?.[0] && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        AI Description
                      </h3>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-gray-700">
                          {analysisResult.description.captions[0].text}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Confidence:{" "}
                          {Math.round(
                            analysisResult.description.captions[0].confidence *
                              100
                          )}
                          %
                        </p>
                      </div>
                    </div>
                  )}

                  <Separator />

                  {analysisResult.tags && analysisResult.tags.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        Detected Tags ({analysisResult.tags.length})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.tags.slice(0, 12).map((tag, index) => (
                          <Badge
                            key={index}
                            className={`${getConfidenceColor(
                              tag.confidence
                            )} border-0`}
                          >
                            {tag.name} ({Math.round(tag.confidence * 100)}%)
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  {analysisResult.objects &&
                    analysisResult.objects.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          Detected Objects ({analysisResult.objects.length})
                        </h3>
                        <div className="space-y-2">
                          {analysisResult.objects.map((obj, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                            >
                              <span className="font-medium">{obj.object}</span>
                              <Badge
                                className={getConfidenceColor(obj.confidence)}
                              >
                                {Math.round(obj.confidence * 100)}%
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="text-center p-4 border-blue-200 bg-blue-50">
            <Brain className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-blue-800">Advanced AI</h3>
            <p className="text-sm text-blue-600">
              Powered by Azure Cognitive Services
            </p>
          </Card>
          <Card className="text-center p-4 border-green-200 bg-green-50">
            <Zap className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-green-800">Fast Analysis</h3>
            <p className="text-sm text-green-600">Get results in seconds</p>
          </Card>
          <Card className="text-center p-4 border-purple-200 bg-purple-50">
            <Upload className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold text-purple-800">Multiple Input</h3>
            <p className="text-sm text-purple-600">Upload or paste</p>
          </Card>
          <Card className="text-center p-4 border-orange-200 bg-orange-50">
            <Copy className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <h3 className="font-semibold text-orange-800">Easy Export</h3>
            <p className="text-sm text-orange-600">Copy or download results</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;