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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                AI Smart Receipt & UPI Parser
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Upload bills, receipts, or Google Pay/PhonePe screenshots
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!previewUrl ? (
            /* Upload Dropzone */
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-8 text-center cursor-pointer transition bg-slate-50/50 dark:bg-slate-800/30 group"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Click or drag & drop receipt or UPI screenshot
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Supports JPG, PNG, WEBP, PhonePe/GPay/Paytm screenshots
              </p>
            </div>
          ) : (
            /* Image Preview & Scan Action */
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center max-h-52">
                <img
                  src={previewUrl}
                  alt="Receipt Preview"
                  className="max-h-52 object-contain w-full"
                />
                <button
                  onClick={handleReset}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-slate-900 transition"
                  title="Choose another image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!parsedData && (
                <button
                  onClick={handleScan}
                  disabled={isParsing}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md transition disabled:opacity-60"
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
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Successfully Extracted ({parsedData.confidence || "High"} Confidence)
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {formatCurrency(parsedData.amount)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-semibold uppercase">
                    Merchant / Payee
                  </label>
                  <input
                    type="text"
                    value={parsedData.merchant || ""}
                    onChange={(e) => setParsedData({ ...parsedData, merchant: e.target.value })}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-semibold uppercase">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={parsedData.amount || ""}
                    onChange={(e) => setParsedData({ ...parsedData, amount: Number(e.target.value) })}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-semibold uppercase">
                    Category
                  </label>
                  <input
                    type="text"
                    value={parsedData.category || ""}
                    onChange={(e) => setParsedData({ ...parsedData, category: e.target.value })}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-semibold uppercase">
                    Payment Mode
                  </label>
                  <input
                    type="text"
                    value={parsedData.paymentMode || ""}
                    onChange={(e) => setParsedData({ ...parsedData, paymentMode: e.target.value })}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                  />
                </div>
              </div>

              {parsedData.description && (
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-semibold uppercase">
                    Description / Items
                  </label>
                  <p className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700 mt-1">
                    {parsedData.description}
                  </p>
                </div>
              )}

              <button
                onClick={handleConfirmAdd}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition"
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
