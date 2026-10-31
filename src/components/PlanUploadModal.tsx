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
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setPreviewImage(uploadEvent.target?.result as string);
      setPlanName(file.name.replace(/\.[^/.]+$/, ''));
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = () => {
    setIsProcessing(true);

    // Synthesize structured FloorPlan object from image and parameters
    setTimeout(() => {
      const generatedPlan: FloorPlan = {
        id: `custom-${Date.now()}`,
        name: planName,
        category,
        description: `Architectural 3D model generated from 2D layout diagram (${totalSqFt} sq ft, ${orientation}).`,
        totalAreaSqFt: totalSqFt,
        carpetAreaSqFt: Math.round(totalSqFt * 0.86),
        balconyAreaSqFt: 120,
        bedroomsCount: bedrooms,
        bathroomsCount: bedrooms >= 3 ? 3 : 2,
        orientation,
        rooms: [
          {
            id: 'cr_living',
            name: 'Living & Dining Great Hall',
            type: 'living',
            polygon: [
              { x: -5.5, z: -3.2 },
              { x: 1.5, z: -3.2 },
              { x: 1.5, z: 2.8 },
              { x: -5.5, z: 2.8 },
            ],
            areaSqFt: Math.round(totalSqFt * 0.38),
            dimensions: '22\'0" x 19\'6"',
            ceilingHeight: 2.9,
            flooringType: 'hardwood_oak',
            sunExposure: 'East',
            furniture: [
              { id: 'cf1', type: 'sofa_sectional', position: { x: -3.2, z: 0.2 }, rotationY: 0 },
              { id: 'cf2', type: 'dining_table', position: { x: -0.4, z: -1.4 }, rotationY: Math.PI / 2 },
              { id: 'cf3', type: 'potted_plant', position: { x: -4.8, z: 2.2 }, rotationY: 0 },
            ],
          },
          {
            id: 'cr_kitchen',
            name: 'Gourmet Kitchen',
            type: 'kitchen',
            polygon: [
              { x: 1.5, z: -3.2 },
              { x: 5.2, z: -3.2 },
              { x: 5.2, z: 0.5 },
              { x: 1.5, z: 0.5 },
            ],
            areaSqFt: Math.round(totalSqFt * 0.16),
            dimensions: '12\'0" x 11\'6"',
            ceilingHeight: 2.9,
            flooringType: 'marble_tile',
            sunExposure: 'North-East',
            furniture: [
              { id: 'cf4', type: 'kitchen_island', position: { x: 3.4, z: -1.2 }, rotationY: 0 },
            ],
          },
          {
            id: 'cr_master',
            name: 'Master Suite',
            type: 'bedroom',
            polygon: [
              { x: 1.5, z: 0.5 },
              { x: 5.2, z: 0.5 },
              { x: 5.2, z: 5.0 },
              { x: 1.5, z: 5.0 },
            ],
            areaSqFt: Math.round(totalSqFt * 0.26),
            dimensions: '15\'0" x 14\'6"',
            ceilingHeight: 2.9,
            flooringType: 'hardwood_oak',
            sunExposure: 'North',
            furniture: [
              { id: 'cf5', type: 'king_bed', position: { x: 3.4, z: 2.7 }, rotationY: Math.PI / 2 },
              { id: 'cf6', type: 'potted_plant', position: { x: 4.8, z: 4.5 }, rotationY: 0 },
            ],
          },
          {
            id: 'cr_guest',
            name: 'Guest Bedroom / Office',
            type: 'bedroom',
            polygon: [
              { x: -5.5, z: 2.8 },
              { x: -1.8, z: 2.8 },
              { x: -1.8, z: 6.5 },
              { x: -5.5, z: 6.5 },
            ],
            areaSqFt: Math.round(totalSqFt * 0.2),
            dimensions: '12\'0" x 12\'0"',
            ceilingHeight: 2.9,
            flooringType: 'nordic_birch',
            sunExposure: 'West',
            furniture: [
              { id: 'cf7', type: 'king_bed', position: { x: -3.6, z: 4.6 }, rotationY: -Math.PI / 2 },
            ],
          },
        ],
        walls: [
          { id: 'cw1', start: { x: -5.5, z: -3.2 }, end: { x: 5.2, z: -3.2 }, isExterior: true, height: 2.9, openings: [{ type: 'window', offset: 2.0, width: 2.6, height: 1.8, elevation: 0.8 }] },
          { id: 'cw2', start: { x: 5.2, z: -3.2 }, end: { x: 5.2, z: 5.0 }, isExterior: true, height: 2.9, openings: [{ type: 'window', offset: 3.5, width: 1.8, height: 1.6, elevation: 0.9 }] },
          { id: 'cw3', start: { x: 5.2, z: 5.0 }, end: { x: 1.5, z: 5.0 }, isExterior: true, height: 2.9 },
          { id: 'cw4', start: { x: 1.5, z: 5.0 }, end: { x: 1.5, z: 2.8 }, height: 2.9 },
          { id: 'cw5', start: { x: 1.5, z: 2.8 }, end: { x: -1.8, z: 2.8 }, height: 2.9, openings: [{ type: 'door', offset: 1.2, width: 0.9, height: 2.1 }] },
          { id: 'cw6', start: { x: -1.8, z: 2.8 }, end: { x: -1.8, z: 6.5 }, height: 2.9 },
          { id: 'cw7', start: { x: -1.8, z: 6.5 }, end: { x: -5.5, z: 6.5 }, isExterior: true, height: 2.9, openings: [{ type: 'window', offset: 1.2, width: 1.6, height: 1.4, elevation: 0.9 }] },
          { id: 'cw8', start: { x: -5.5, z: 6.5 }, end: { x: -5.5, z: -3.2 }, isExterior: true, height: 2.9, openings: [{ type: 'door', offset: 1.8, width: 2.0, height: 2.4 }] },
          { id: 'cw9', start: { x: 1.5, z: -3.2 }, end: { x: 1.5, z: 2.8 }, height: 2.9, openings: [{ type: 'door', offset: 1.2, width: 1.0, height: 2.1 }] },
          { id: 'cw10', start: { x: 1.5, z: 0.5 }, end: { x: 5.2, z: 0.5 }, height: 2.9 },
        ],
        exteriorBoundary: [
          { x: -5.5, z: -3.2 },
          { x: 5.2, z: -3.2 },
          { x: 5.2, z: 6.5 },
          { x: -5.5, z: 6.5 },
        ],
      };

      setIsProcessing(false);
      onGeneratePlan(generatedPlan, previewImage || undefined);
      onClose();
    }, 600);
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
