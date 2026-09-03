import React, { useState, useRef } from 'react';
import { Upload, X, Check, Image as ImageIcon, Link as LinkIcon, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../lib/api.js';

interface ImageUploadProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label = 'Image',
  value,
  onChange,
  placeholder = 'https://...',
  helperText = 'Supports PNG, JPG, WEBP, GIF, SVG up to 5MB',
  required = false
}) => {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setError(null);

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setError('Unsupported file type. Please select JPEG, PNG, WEBP, GIF, or SVG.');
      return;
    }

    // Validate size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File exceeds maximum 5MB size limit.');
      return;
    }

    setUploading(true);
    setUploadProgress(20);

    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 60);
        setUploadProgress(20 + percent);
      }
    };

    reader.onload = async () => {
      try {
        setUploadProgress(85);
        const base64Data = reader.result as string;
        const res = await api.admin.uploadImage(base64Data, file.name);
        setUploadProgress(100);
        onChange(res.url);
        setTimeout(() => {
          setUploading(false);
          setUploadProgress(0);
        }, 400);
      } catch (err: any) {
        console.error('Upload failed:', err);
        setError(err.message || 'Failed to upload image to server.');
        setUploading(false);
        setUploadProgress(0);
      }
    };

    reader.onerror = () => {
      setError('Failed to read selected file.');
      setUploading(false);
      setUploadProgress(0);
    };

    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemove = () => {
    onChange('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B]">
          {label} {required && <span className="text-[#C9A227]">*</span>}
        </label>
        <div className="flex items-center space-x-2 text-[10px]">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2 py-0.5 rounded transition-all ${
              mode === 'upload'
                ? 'bg-[#1F1F1F] text-[#E0B84F] font-semibold'
                : 'text-[#888888] hover:text-[#D5D2CA]'
            }`}
          >
            Upload File
          </button>
          <span className="text-[#333333]">|</span>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2 py-0.5 rounded transition-all ${
              mode === 'url'
                ? 'bg-[#1F1F1F] text-[#E0B84F] font-semibold'
                : 'text-[#888888] hover:text-[#D5D2CA]'
            }`}
          >
            Direct URL
          </button>
        </div>
      </div>

      {error && (
        <div className="p-2.5 rounded bg-red-950/40 border border-red-800/60 text-red-200 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => setError(null)} className="text-red-300 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {value ? (
        /* Image Preview State */
        <div className="relative group bg-[#111111] border border-[#2B2B2B] rounded overflow-hidden flex items-center p-3 space-x-4">
          <div className="w-16 h-16 rounded bg-[#0A0A0A] border border-[#222222] overflow-hidden shrink-0 flex items-center justify-center">
            <img
              src={value}
              alt="Uploaded preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=400&q=80';
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-[#F5F2EA] truncate">Image Attached</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 text-[10px] font-mono flex items-center space-x-1">
                <Check size={10} />
                <span>Ready</span>
              </span>
            </div>
            <p className="text-[11px] font-mono text-[#888888] truncate mt-0.5" title={value}>
              {value}
            </p>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (mode === 'upload') fileInputRef.current?.click();
                else onChange('');
              }}
              className="px-2.5 py-1.5 rounded bg-[#1C1C1C] hover:bg-[#282828] text-xs text-[#D5D2CA] transition-all flex items-center space-x-1"
              title="Replace image"
            >
              <RefreshCw size={12} />
              <span className="hidden sm:inline">Replace</span>
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 rounded bg-red-950/40 hover:bg-red-900/60 border border-red-900/50 text-red-300 transition-all"
              title="Remove image"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : mode === 'upload' ? (
        /* Drag & Drop Upload Zone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer border-2 border-dashed rounded-lg p-6 text-center transition-all ${
            isDragging
              ? 'border-[#C9A227] bg-[#C9A227]/5'
              : 'border-[#262626] hover:border-[#C9A227]/60 bg-[#0E0E0E]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />

          {uploading ? (
            <div className="space-y-3 py-2">
              <div className="w-8 h-8 rounded-full border-2 border-[#C9A227] border-t-transparent animate-spin mx-auto" />
              <div className="text-xs text-[#E0B84F] font-semibold">Uploading to Atelier Media Storage...</div>
              <div className="w-48 bg-[#222222] rounded-full h-1.5 mx-auto overflow-hidden">
                <div
                  className="bg-[#C9A227] h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#181818] border border-[#2B2B2B] flex items-center justify-center text-[#C9A227] mx-auto">
                <Upload size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#F5F2EA]">
                  Click to browse <span className="text-[#888888]">or drag & drop image</span>
                </p>
                <p className="text-[10px] text-[#666666] mt-0.5">{helperText}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Direct URL Input */
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-[#141414] border border-[#2B2B2B] focus:border-[#C9A227] rounded p-2 text-xs text-[#F5F2EA] outline-none pl-8"
          />
          <LinkIcon size={14} className="absolute left-2.5 top-2.5 text-[#666666]" />
        </div>
      )}
    </div>
  );
};
