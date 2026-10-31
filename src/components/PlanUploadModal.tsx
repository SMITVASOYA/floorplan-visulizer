/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Sparkles,
  Upload,
  X,
  Compass,
  CheckCircle,
} from 'lucide-react';
import { FloorPlan } from '../types/architectural.ts';
import { synthesizeFloorPlan } from '../services/blueprintSynthesizer.ts';

interface PlanUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGeneratePlan: (newPlan: FloorPlan, imageBase64?: string) => void;
}

export const PlanUploadModal: React.FC<PlanUploadModalProps> = ({
  isOpen,
  onClose,
  onGeneratePlan,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageAspectRatio, setImageAspectRatio] = useState<number>(1.33);
  const [planName, setPlanName] = useState('Custom Residence Layout');
  const [category, setCategory] = useState<'Apartment' | 'Studio' | 'Penthouse' | 'Commercial'>('Apartment');
  const [totalSqFt, setTotalSqFt] = useState(1400);
  const [bedrooms, setBedrooms] = useState(2);
  const [orientation, setOrientation] = useState('East-Facing Balcony, North Master Suite');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const rawName = file.name.replace(/\.[^/.]+$/, '');
    const cleanLower = rawName.toLowerCase();

    // Auto-detect blueprint specifications from filename
    if (cleanLower.includes('30x40')) {
      setPlanName("30' x 40' 3-Bedroom Residence");
      setCategory('Apartment');
      setTotalSqFt(1200);
      setBedrooms(3);
      setOrientation('South-Facing Main Entry, North Bedrooms');
    } else if (cleanLower.includes('commercial') || cleanLower.includes('office')) {
      setPlanName(rawName.replace(/_/g, ' '));
      setCategory('Commercial');
      setTotalSqFt(2400);
      setBedrooms(1);
      setOrientation('North-Facing Entry Gallery');
    } else if (cleanLower.includes('penthouse') || cleanLower.includes('villa')) {
      setPlanName(rawName.replace(/_/g, ' '));
      setCategory('Penthouse');
      setTotalSqFt(2800);
      setBedrooms(4);
      setOrientation('Panoramic East & South Balcony');
    } else if (cleanLower.includes('studio') || cleanLower.includes('loft') || cleanLower.includes('1bhk') || cleanLower.includes('1 bedroom')) {
      setPlanName(rawName.replace(/_/g, ' '));
      setCategory('Studio');
      setBedrooms(1);
      setTotalSqFt(600);
      setOrientation('East-Facing Glazing');
    } else if (cleanLower.includes('2bhk') || cleanLower.includes('2 bedroom')) {
      setPlanName(rawName.replace(/_/g, ' '));
      setCategory('Apartment');
      setBedrooms(2);
      setTotalSqFt(1100);
      setOrientation('East-Facing Living, North Balcony');
    } else if (cleanLower.includes('4bhk') || cleanLower.includes('4 bedroom')) {
      setPlanName(rawName.replace(/_/g, ' '));
      setCategory('Apartment');
      setBedrooms(4);
      setTotalSqFt(2400);
      setOrientation('East-Facing Living, North Suites');
    } else if (cleanLower.includes('3bhk') || cleanLower.includes('3 bedroom')) {
      setPlanName(rawName.replace(/_/g, ' '));
      setCategory('Apartment');
      setBedrooms(3);
      setTotalSqFt(1500);
      setOrientation('East-Facing Living');
    } else {
      let detectedName = rawName.replace(/^[0-9a-f_]+/, '').replace(/_/g, ' ').trim();
      if (!detectedName) detectedName = 'Custom Architectural Plan';
      setPlanName(detectedName);
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      setPreviewImage(dataUrl);

      // Extract image aspect ratio for proportional 3D room extrusion
      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth && img.naturalHeight) {
          const ratio = img.naturalWidth / img.naturalHeight;
          setImageAspectRatio(ratio);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const generatedPlan = synthesizeFloorPlan({
        name: planName,
        category,
        totalSqFt,
        bedroomsCount: bedrooms,
        bathroomsCount: bedrooms >= 3 ? 2 : 1,
        orientation,
        previewImageBase64: previewImage || undefined,
        sourceFilename: planName,
        aspectRatio: imageAspectRatio,
      });

      setIsProcessing(false);
      onGeneratePlan(generatedPlan, previewImage || undefined);
      onClose();
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-[#121620] border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 bg-[#0e121a]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Upload 2D Floor Plan or Brochure</h3>
              <p className="text-xs text-slate-400">Generate an interactive 3D spatial model from your architectural layout</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Dropzone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
              dragActive
                ? 'border-amber-400 bg-amber-500/10'
                : previewImage
                ? 'border-amber-500/40 bg-slate-900/60'
                : 'border-slate-700 bg-slate-900/30 hover:border-slate-500 hover:bg-slate-900/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={(e) => e.target.files && e.target.files[0] && handleFile(e.target.files[0])}
            />

            {previewImage ? (
              <div className="flex flex-col items-center gap-3">
                <div className="relative max-h-48 max-w-full rounded-lg overflow-hidden border border-white/10 shadow-lg">
                  <img src={previewImage} alt="Uploaded Floor Plan" className="object-contain max-h-48" />
                </div>
                <div className="flex items-center gap-2 text-xs text-amber-300 font-mono">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Blueprint loaded · Click to replace</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-3 rounded-full bg-slate-800 text-slate-300">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div className="text-xs">
                  <span className="font-semibold text-amber-400">Click to upload</span> or drag and drop blueprint
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  Supports PNG, JPG, WebP, SVG architectural layouts (Up to 20MB)
                </p>
              </div>
            )}
          </div>

          {/* Quick Blueprint Load Helper for user's uploaded 30x40 blueprint */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Blueprint Available: <strong>30' x 40' 3-Bedroom Plan</strong></span>
            </div>
            <button
              type="button"
              onClick={() => {
                setPreviewImage('/6ab6a1ffa198a1a79ace61f2_67ca2328a5aebddb6989e0c8_30x4020Bedroom20Plan.webp');
                setPlanName("30' x 40' 3-Bedroom Residence");
                setTotalSqFt(1200);
                setBedrooms(3);
                setOrientation('South-Facing Main Entry, North Bedrooms');
              }}
              className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-[11px] transition-colors shadow-sm"
            >
              Load Blueprint
            </button>
          </div>

          {/* Architectural Metadata Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Layout Name</label>
              <input
                type="text"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Typology Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400"
              >
                <option value="Apartment">Residential Apartment</option>
                <option value="Studio">Urban Studio Loft</option>
                <option value="Penthouse">Skyline Penthouse</option>
                <option value="Commercial">Commercial Office</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Estimated Total Area (sq ft)</label>
              <input
                type="number"
                value={totalSqFt}
                onChange={(e) => setTotalSqFt(parseInt(e.target.value, 10) || 1000)}
                className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Bedrooms Count</label>
              <input
                type="number"
                min="1"
                max="6"
                value={bedrooms}
                onChange={(e) => setBedrooms(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-300 mb-1 font-medium">Solar Orientation / Exposure</label>
              <input
                type="text"
                value={orientation}
                onChange={(e) => setOrientation(e.target.value)}
                className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400"
                placeholder="e.g. East-facing living room, South terrace"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/8 bg-[#0e121a]">
          <span className="text-[11px] text-slate-400 font-mono">
            Procedural 3D meshing will synthesize beveled walls and furniture
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-300 hover:text-white rounded hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs shadow-lg transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isProcessing ? 'Synthesizing 3D Model...' : 'Generate 3D Layout'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
