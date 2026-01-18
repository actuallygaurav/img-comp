import React, { useState, useRef, useEffect } from "react";

const ImagePicker = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [quality, setQuality] = useState(0.8);
  const [compressedSize, setCompressedSize] = useState(null);
  const fileInputRef = useRef(null);

  // This function calculates the REAL size by creating a temporary Blob
  const updateCompressedPreview = (previewUrl, quality) => {
    const img = new Image();
    img.src = previewUrl;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            setCompressedSize((blob.size / 1024).toFixed(1));
          }
        },
        "image/jpeg",
        quality,
      );
    };
  };

  useEffect(() => {
    if (previewUrl) {
      updateCompressedPreview(previewUrl, quality);
    }
  }, [previewUrl, quality]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const downloadImage = () => {
    const img = new Image();
    img.src = previewUrl;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `compressed_${Math.round(quality * 100)}pct_${selectedImage.name.split(".")[0]}.jpg`;
          link.click();

          // Clean up memory
          URL.revokeObjectURL(url);
        },
        "image/jpeg",
        quality,
      );
    };
  };

  return (
    <div className="flex flex-col items-center p-6 border border-gray-200 rounded-2xl bg-white shadow-xl max-w-md mx-auto">
      {!previewUrl ? (
        <button
          onClick={() => fileInputRef.current.click()}
          className="w-full py-16 border-2 border-dashed border-blue-300 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors"
        >
          Select Image
        </button>
      ) : (
        <div className="w-full space-y-6">
          <div className="relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="square-box w-full h-auto rounded-lg"
            />
            <br/>
            <button
              onClick={() => {
                setPreviewUrl(null);
                setSelectedImage(null);
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white w-7 h-7 rounded-full text-xs"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-2 bg-gray-50 rounded-lg">
              <p className="text-[10px] text-gray-400 font-bold uppercase">
                <strong>Original : </strong> {(selectedImage.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <div className="p-2 bg-indigo-50 rounded-lg">
              <p className="text-[10px] text-indigo-400 font-bold uppercase">
                <strong>Compressed : </strong> {compressedSize} KB
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-medium"><strong>Compression Level : </strong>{Math.round(quality * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1.0"
              step="0.05"
              value={quality}
              onChange={(e) => setQuality(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <button
            onClick={downloadImage}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-md active:scale-95"
          >
            Download Compressed Image
          </button>
        </div>
      )}

      <input
        hidden
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};

export default ImagePicker;
