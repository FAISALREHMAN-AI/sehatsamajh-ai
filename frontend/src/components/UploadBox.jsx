import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Camera,
  X,
  FileCheck,
  Sparkles,
  AlertCircle,
  FileSpreadsheet,
  Pill,
  ArrowRight,
} from 'lucide-react';
import LanguageToggle from './LanguageToggle';
import { SAMPLE_LAB_REPORT, SAMPLE_PRESCRIPTION } from '../sampleData';

export default function UploadBox({
  onAnalyze,
  loading,
  language,
  onLanguageChange,
  initialText = '',
}) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [text, setText] = useState(initialText);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'text'
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const isUrdu = language === 'ur';

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectedFile = (selected) => {
    setErrorMsg(null);
    if (!selected) return;

    // Check size (< 15MB)
    if (selected.size > 15 * 1024 * 1024) {
      setErrorMsg('File size must be under 15 MB.');
      return;
    }

    setFile(selected);
    if (selected.type.startsWith('image/')) {
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const clearFile = () => {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleLoadSample = (sampleType) => {
    clearFile();
    setActiveTab('text');
    setErrorMsg(null);
    if (sampleType === 'lab') {
      setText(SAMPLE_LAB_REPORT);
    } else {
      setText(SAMPLE_PRESCRIPTION);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg(null);

    const hasFile = !!file;
    const hasText = !!(text && text.trim());

    if (!hasFile && !hasText) {
      setErrorMsg(
        isUrdu
          ? 'برائے مہربانی کوئی تصویر / پی ڈی ایف فائل اپلوڈ کریں یا رپورٹ کا متن درج کریں۔'
          : language === 'roman_ur'
          ? 'Meharbani farma kar file upload karein ya text paste karein.'
          : 'Please upload a medical report file (image/PDF) or paste the report text.'
      );
      return;
    }

    onAnalyze({ file, text: text.trim(), language });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden" dir={isUrdu ? 'rtl' : 'ltr'}>
      {/* Top Bar with Language Selector and Tabs */}
      <div className="bg-slate-50/80 px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'upload'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="w-4 h-4 text-emerald-600" />
            <span>{isUrdu ? 'فائل یا تصویر اپلوڈ' : language === 'roman_ur' ? 'File / Photo Upload' : 'Upload File / Photo'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'text'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>{isUrdu ? 'متن لکھیں / پیسٹ کریں' : language === 'roman_ur' ? 'Paste Report Text' : 'Paste Document Text'}</span>
          </button>
        </div>

        <LanguageToggle currentLang={language} onChange={onLanguageChange} />
      </div>

      <div className="p-6 sm:p-8">
        {/* Error notification banner */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tab 1: File Upload */}
        {activeTab === 'upload' && (
          <div>
            {!file ? (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all ${
                  dragActive
                    ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]'
                    : 'border-slate-300 hover:border-emerald-400 bg-slate-50/50'
                }`}
              >
                <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center mb-4 shadow-xs">
                  <UploadCloud className="w-8 h-8" />
                </div>

                <h3 className={`text-base sm:text-lg font-bold text-slate-800 mb-1 ${isUrdu ? 'font-urdu' : ''}`}>
                  {isUrdu
                    ? 'اپنی لیب رپورٹ یا نسخہ کی تصویر یہاں رکھیں'
                    : language === 'roman_ur'
                    ? 'Apni report ya prescription yahan drag karein ya browse karein'
                    : 'Drag & drop your lab report or prescription here'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mb-6">
                  {isUrdu
                    ? 'JPG، PNG، WEBP یا PDF (زیادہ سے زیادہ 15 ایم بی)'
                    : 'Supports JPG, PNG, WEBP or PDF (up to 15 MB)'}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-all flex items-center gap-2"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>{isUrdu ? 'فائل منتخب کریں' : 'Browse Files'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-sm font-semibold border border-slate-300 shadow-2xs transition-all flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <span>{isUrdu ? 'کیمرہ استعمال کریں' : 'Take Photo'}</span>
                  </button>
                </div>

                {/* Hidden Inputs */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => handleSelectedFile(e.target.files?.[0])}
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handleSelectedFile(e.target.files?.[0])}
                />
              </div>
            ) : (
              <div className="border border-emerald-200 bg-emerald-50/40 rounded-3xl p-5 sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Report Preview"
                        className="w-16 h-16 object-cover rounded-xl border border-emerald-300 shadow-2xs"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                        <FileCheck className="w-8 h-8" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate max-w-xs">
                        {file.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {(file.size / 1024).toFixed(1)} KB • {file.type || 'Document'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={clearFile}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-xl transition-all"
                    title="Remove file"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Paste Text */}
        {activeTab === 'text' && (
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">
              {isUrdu
                ? 'رپورٹ یا نسخہ کی تحریر درج کریں:'
                : language === 'roman_ur'
                ? 'Report ya Dawaiyon ka text yahan paste karein:'
                : 'Paste Report or Prescription Text:'}
            </label>
            <textarea
              rows={8}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                isUrdu
                  ? 'یہاں ٹیسٹ کے نتائج لکھیں یا چسپاں کریں، مثال کے طور پر:\nہیموگلوبن: 13.8 (13.0 - 17.0)\nبلڈ شوگر: 184 (70 - 99)...'
                  : language === 'roman_ur'
                  ? 'Yahan report ka text likhein, misaal ke taur par:\nHemoglobin: 13.8 (13.0 - 17.0)\nBlood Glucose: 184 (70 - 99)...'
                  : 'Paste lab values or prescription details, e.g.:\nHemoglobin: 13.8 g/dL (13.0 - 17.0)\nFasting Blood Glucose: 184 mg/dL (70 - 99)...'
              }
              className={`w-full p-4 rounded-2xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-sm font-mono text-slate-800 transition-all ${
                isUrdu ? 'font-urdu' : ''
              }`}
            />
          </div>
        )}

        {/* Synthetic Sample Quick Buttons */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{isUrdu ? 'نمونہ رپورٹس آزمائیں (ڈیمو کے لیے):' : language === 'roman_ur' ? 'Demo reports try karein:' : 'Try a synthetic demo report:'}</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => handleLoadSample('lab')}
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200 flex items-center gap-2 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-sky-600" />
              <span>{isUrdu ? 'نمونہ 1: لیب بلڈ ٹیسٹ' : language === 'roman_ur' ? 'Sample 1: Lab Blood Report' : 'Sample 1: Blood Lab Report'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleLoadSample('prescription')}
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-2 transition-all"
            >
              <Pill className="w-4 h-4 text-emerald-600" />
              <span>{isUrdu ? 'نمونہ 2: ڈاکٹر کا نسخہ (Rx)' : language === 'roman_ur' ? 'Sample 2: Doctor Prescription' : 'Sample 2: Doctor Prescription'}</span>
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-base shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{isUrdu ? 'تجزیہ کیا جا رہا ہے...' : language === 'roman_ur' ? 'Analyze ho raha hai...' : 'Analyzing with Gemini AI...'}</span>
              </>
            ) : (
              <>
                <span>{isUrdu ? 'رپورٹ کی آسان وضاحت دیکھیں' : language === 'roman_ur' ? 'Aasan Wazahat Dekhein' : 'Explain My Medical Document'}</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
