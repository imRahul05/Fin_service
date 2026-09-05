import { useState, useRef } from "react";
import { parseReceiptOrUpiImage } from "../../services/AIService";
import { formatCurrency } from "../../utils/financialUtils";
import { UploadCloud, Image as ImageIcon, Sparkles, CheckCircle2, AlertCircle, X, ArrowRight, Loader2 } from "lucide-react";

export default function ReceiptScannerModal({
  isOpen,
  onClose,
  onAddTransaction,
}) {
  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState(null);
  const [parsedData, setParsedData] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPEG, WEBP, or screenshot).");
      return;
    }

    if (file.size > 4.5 * 1024 * 1024) {
      setError("File size exceeds 4.5MB limit. Please choose a smaller or compressed image.");
      return;
    }

    setError(null);
    setParsedData(null);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      setPreviewUrl(result);
      // Strip data:image/...;base64, prefix
      const base64Clean = result.split(",")[1];
      setSelectedImage({
        base64: base64Clean,
        mimeType: file.type,
      });
    };
    reader.onerror = () => {
      setError("Failed to read image file. Please select another image.");
    };
    reader.readAsDataURL(file);
  };

  const handleScan = async () => {
    if (!selectedImage) return;

    setIsParsing(true);
    setError(null);

    try {
      const extracted = await parseReceiptOrUpiImage(
        selectedImage.base64,
        selectedImage.mimeType
      );
      setParsedData(extracted);
    } catch (err) {
      console.error("Scan error:", err);
      setError(err.message || "Failed to parse receipt. Please verify image quality.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmAdd = () => {
    if (!parsedData) return;

    const tx = {
      title: `${parsedData.merchant} (${parsedData.category || "Expense"})`,
      amount: Number(parsedData.amount || 0),
      type: "expense",
      category: parsedData.category || "Other",
      merchant: parsedData.merchant || "Merchant",
      paymentMode: parsedData.paymentMode || "UPI",
      date: parsedData.date || new Date().toISOString().split("T")[0],
      description: parsedData.description || "",
    };

    onAddTransaction(tx);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setParsedData(null);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-card rounded-3xl border border-border/80 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-foreground text-background shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                AI Smart Receipt & UPI Parser
              </h3>
              <p className="text-xs text-muted-foreground">
                Upload bills, receipts, or Google Pay/PhonePe screenshots
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!previewUrl ? (
            /* Upload Dropzone */
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-foreground/40 rounded-3xl p-8 text-center cursor-pointer transition bg-muted/20 group"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <div className="mx-auto w-12 h-12 rounded-2xl bg-muted text-foreground flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-foreground">
                Click or drag & drop receipt or UPI screenshot
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports JPG, PNG, WEBP, PhonePe/GPay/Paytm screenshots
              </p>
            </div>
          ) : (
            /* Image Preview & Scan Action */
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-border bg-muted/30 flex items-center justify-center max-h-52">
                <img
                  src={previewUrl}
                  alt="Receipt Preview"
                  className="max-h-52 object-contain w-full"
                />
                <button
                  onClick={handleReset}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 text-foreground hover:bg-background transition cursor-pointer shadow-xs"
                  title="Choose another image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!parsedData && (
                <button
                  onClick={handleScan}
                  disabled={isParsing}
                  className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-foreground hover:opacity-90 text-background text-xs font-semibold shadow-xs transition disabled:opacity-60 cursor-pointer"
                >
                  {isParsing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Gemini Vision Parsing OCR...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Extract Transaction Data with AI</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Parsed Result Form */}
          {parsedData && (
            <div className="p-5 rounded-3xl bg-muted/30 border border-border space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Successfully Extracted ({parsedData.confidence || "High"} Confidence)
                </span>
                <span className="text-sm font-black text-foreground">
                  {formatCurrency(parsedData.amount)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-muted-foreground text-2xs font-semibold uppercase">
                    Merchant / Payee
                  </label>
                  <input
                    type="text"
                    value={parsedData.merchant || ""}
                    onChange={(e) => setParsedData({ ...parsedData, merchant: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-2xl border border-border bg-background text-foreground font-medium text-xs focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground text-2xs font-semibold uppercase">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={parsedData.amount || ""}
                    onChange={(e) => setParsedData({ ...parsedData, amount: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 rounded-2xl border border-border bg-background text-foreground font-medium text-xs focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground text-2xs font-semibold uppercase">
                    Category
                  </label>
                  <input
                    type="text"
                    value={parsedData.category || ""}
                    onChange={(e) => setParsedData({ ...parsedData, category: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-2xl border border-border bg-background text-foreground font-medium text-xs focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground text-2xs font-semibold uppercase">
                    Payment Mode
                  </label>
                  <input
                    type="text"
                    value={parsedData.paymentMode || ""}
                    onChange={(e) => setParsedData({ ...parsedData, paymentMode: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-2xl border border-border bg-background text-foreground font-medium text-xs focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>
              </div>

              {parsedData.description && (
                <div>
                  <label className="block text-muted-foreground text-2xs font-semibold uppercase">
                    Description / Items
                  </label>
                  <p className="text-xs text-foreground bg-background p-3 rounded-2xl border border-border mt-1">
                    {parsedData.description}
                  </p>
                </div>
              )}

              <button
                onClick={handleConfirmAdd}
                className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-foreground hover:opacity-90 text-background text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <span>Confirm & Log Transaction</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
