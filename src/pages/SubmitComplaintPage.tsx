import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { VillageMap } from '@/components/VillageMap';
import { LocationSearch } from '@/components/LocationSearch';
import { CATEGORY_OPTIONS, type ComplaintCategory, type ClassificationResult } from '@/lib/types';
import { createComplaint, uploadComplaintImage, classifyComplaint } from '@/lib/api';

import { Upload, MapPin, Loader2, Image as ImageIcon, Sparkles, CheckCircle, X, ArrowLeft, AlertCircle, Tag } from 'lucide-react';

export function SubmitComplaintPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('other');
  const [description, setDescription] = useState('');
  const [locationLabel, setLocationLabel] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<ClassificationResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleImageSelect(file: File | null) {
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    setAiResult(null);
  }

  async function handleClassify() {
    if (!imageFile) return;
    setAiLoading(true);
    setError(null);
    try {
      const result = await classifyComplaint(imageFile.name, category);
      setAiResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI classification failed');
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedLocation) {
      setError('Please select a location on the map');
      return;
    }
    if (!title.trim()) {
      setError('Please enter a complaint title');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      let imageUrl: string | null = null;
      if (imageFile) {
        imageUrl = await uploadComplaintImage(imageFile);
      }

      const priority = aiResult?.priority ?? 'medium';
      const aiCategory = aiResult?.category ?? null;
      const aiConfidence = aiResult?.confidence ?? null;

      await createComplaint({
        title: title.trim(),
        category,
        description: description.trim(),
        image_url: imageUrl,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        location_label: locationLabel.trim(),
        priority,
        ai_category: aiCategory,
        ai_confidence: aiConfidence,
      });

      navigate('/complaints');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl animate-fade-in">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-ghost -ml-2">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Submit a Complaint</h1>
          <p className="text-sm text-slate-500">Report a public issue with location and photo</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="card p-6">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Complaint Details</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Large pothole near the bus stop"
                className="input"
              />
            </div>

            <div>
              <label className="label">Category</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {CATEGORY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setCategory(opt.value)}
                    className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-all ${
                      category === opt.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Tag size={15} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe the issue in detail..."
                className="input resize-none"
              />
            </div>
          </div>
        </div>

        {/* Image upload + AI */}
        <div className="card p-6">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Photo & AI Classification</h2>
          <div className="space-y-4">
            <div
              className="relative flex min-h-[160px] cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition-all hover:border-blue-400 hover:bg-blue-50/50"
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <div className="relative w-full">
                  <img src={imagePreview} alt="Complaint preview" className="max-h-64 w-full rounded-xl object-contain" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageFile(null);
                      setImagePreview(null);
                      setAiResult(null);
                    }}
                    className="absolute right-2 top-2 rounded-lg bg-slate-900/70 p-1.5 text-white hover:bg-slate-900"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-6 text-slate-400">
                  <ImageIcon size={32} />
                  <p className="text-sm font-medium">Click to upload a photo</p>
                  <p className="text-xs text-slate-400">JPG, PNG up to 5MB</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageSelect(e.target.files?.[0] ?? null)}
              />
            </div>

            {imageFile && !aiResult && (
              <button type="button" onClick={handleClassify} disabled={aiLoading} className="btn-secondary w-full">
                {aiLoading ? (
                  <><Loader2 size={18} className="animate-spin" /> Analyzing image...</>
                ) : (
                  <><Sparkles size={18} /> Run AI Classification</>
                )}
              </button>
            )}

            {aiResult && (
              <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 animate-fade-in">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-700">
                  <Sparkles size={16} />
                  AI Analysis Result
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-xs text-slate-500">Predicted Category</p>
                    <p className="mt-1 text-sm font-bold text-slate-900 capitalize">
                      {aiResult.category.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Confidence</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {(aiResult.confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Suggested Priority</p>
                    <p className="mt-1 text-sm font-bold capitalize" style={{
                      color: aiResult.priority === 'high' ? '#ef4444' : aiResult.priority === 'medium' ? '#f59e0b' : '#10b981'
                    }}>
                      {aiResult.priority}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Map location */}
        <div className="card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
            <MapPin size={20} className="text-blue-600" />
            Select Location on Map
          </h2>
          <p className="mb-3 text-sm text-slate-500">
            Search for a location or click on the map to pin the exact location of the issue
          </p>
          <div className="mb-3">
            <LocationSearch
              variant="light"
              className="w-full"
              onSelect={(r) => {
                setSelectedLocation({ lat: r.lat, lng: r.lon });
                if (!locationLabel.trim()) setLocationLabel(r.name);
              }}
            />
          </div>
          <VillageMap
            selectable
            selectedLocation={selectedLocation}
            onLocationSelect={(lat, lng) => setSelectedLocation({ lat, lng })}
            height="350px"
          />
          {selectedLocation && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-green-50 px-4 py-2.5 text-sm text-green-700">
              <CheckCircle size={16} />
              Location selected: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
            </div>
          )}
          <div className="mt-3">
            <label className="label">Location Label (optional)</label>
            <input
              type="text"
              value={locationLabel}
              onChange={(e) => setLocationLabel(e.target.value)}
              placeholder="e.g., Near the bus stop on Main Street"
              className="input"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? (
              <><Loader2 size={18} className="animate-spin" /> Submitting...</>
            ) : (
              <><Upload size={18} /> Submit Complaint</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
