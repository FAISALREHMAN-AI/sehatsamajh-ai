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
import { t } from '../i18n';

const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.pdf'];
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB

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

    const filename = selected.name.toLowerCase();
    const ext = filename.slice(filename.lastIndexOf('.'));
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setErrorMsg(
        isUrdu
          ? 'برائے مہربانی صرف PNG، JPG، JPEG، WEBP یا PDF فائل منتخب کریں۔'
          : language === 'roman_ur'
          ? 'Sirf PNG, JPG, JPEG, WEBP ya PDF file select karein.'
          : 'Please select only PNG, JPG, JPEG, WEBP, or PDF files.'
      );
      return;
    }

    if (selected.size > MAX_FILE_SIZE_BYTES) {
      setErrorMsg(
        isUrdu
          ? 'فائل کا سائز 8 ایم بی سے کم ہونا چاہیے۔'
          : language === 'roman_ur'
          ? 'File size 8 MB se kam hona chahiye.'
          : 'File size must be under 8 MB.'
      );
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
          ? 'برائے مہربانی دستاویز کی فائل اپلوڈ کریں یا رپورٹ کا متن درج کریں۔'
          : language === 'roman_ur'
          ? 'Baraye meharbani file upload karein ya text paste karein.'
          : 'Please provide either a document file or paste the report text.'
      );
      return;
    }

    onAnalyze({
      file,
      text: text.trim(),
      language,
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden" dir={isUrdu ? 'rtl' : 'ltr'}>
      {/* Top Header & Language Toggle */}
      <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className={`text-sm sm:text-base font-bold text-slate-800 ${isUrdu ? 'font-urdu' : ''}`}>
            {t('appName', language)}
          </span>
          <span className="text-xs text-slate-500 hidden sm:inline">• {t('appTagline', language)}</span>
        </div>

        <LanguageToggle currentLang={language} onChange={onLanguageChange} />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white">
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-3.5 px-4 text-sm sm:text-base font-bold flex items-center justify-center gap-2 transition-colors border-b-2 ${
            activeTab === 'upload'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          } ${isUrdu ? 'font-urdu' : ''}`}
        >
          <UploadCloud className="w-5 h-5" />
          <span>{t('tabUpload', language)}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('text')}
          className={`flex-1 py-3.5 px-4 text-sm sm:text-base font-bold flex items-center justify-center gap-2 transition-colors border-b-2 ${
            activeTab === 'text'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          } ${isUrdu ? 'font-urdu' : ''}`}
        >
          <FileText className="w-5 h-5" />
          <span>{t('tabPaste', language)}</span>
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-5 sm:p-8">
        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMsg}</div>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="text-red-500 hover:text-red-800 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tab 1: Upload (File / Camera) */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !file && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-6 sm:p-10 text-center transition-all cursor-pointer ${
                dragActive
                  ? 'border-emerald-500 bg-emerald-50'
                  : file
                  ? 'border-emerald-300 bg-emerald-50/30'
                  : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.pdf,image/png,image/jpeg,image/webp,application/pdf"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleSelectedFile(e.target.files[0])}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleSelectedFile(e.target.files[0])}
              />

              {!file ? (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 shadow-inner">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <h3 className={`text-base sm:text-lg font-bold text-slate-900 mb-1 ${isUrdu ? 'font-urdu' : ''}`}>
                    {t('dragDropText', language)}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mb-4">{t('dragDropSub', language)}</p>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition shadow"
                    >
                      {isUrdu ? 'فائل براؤز کریں' : 'Browse Files'}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        cameraInputRef.current?.click();
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition shadow"
                    >
                      <Camera className="w-4 h-4" />
                      <span>{t('cameraButton', language)}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  {previewUrl ? (
                    <div className="relative mb-4">
                      <img
                        src={previewUrl}
                        alt="Document preview"
                        className="max-h-48 rounded-xl object-contain shadow-md border border-slate-200"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-3 shadow">
                      <FileCheck className="w-8 h-8" />
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-bold text-slate-800 truncate max-w-xs">{file.name}</span>
                    <span className="text-xs text-slate-500">
                      ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFile();
                    }}
                    className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-800 font-semibold px-3 py-1 rounded-lg bg-red-50 hover:bg-red-100 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>{t('removeFile', language)}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Quick Synthetic Demo Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
              <span className={`text-slate-500 font-medium ${isUrdu ? 'font-urdu' : ''}`}>
                {isUrdu ? 'یا فوری ڈیمو ٹیسٹ آزمائیں:' : 'Or try a synthetic sample:'}
              </span>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleLoadSample('lab')}
                  className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 border border-slate-200 transition font-semibold flex items-center justify-center gap-1.5"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>{t('loadSampleLab', language)}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSample('rx')}
                  className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 border border-slate-200 transition font-semibold flex items-center justify-center gap-1.5"
                >
                  <Pill className="w-4 h-4 text-emerald-600" />
                  <span>{t('loadSampleRx', language)}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Paste Text */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={`block text-xs sm:text-sm font-bold text-slate-700 ${isUrdu ? 'font-urdu' : ''}`}>
                  {t('pasteLabel', language)}
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleLoadSample('lab')}
                    className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md transition"
                  >
                    + {t('loadSampleLab', language)}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSample('rx')}
                    className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md transition"
                  >
                    + {t('loadSampleRx', language)}
                  </button>
                </div>
              </div>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={9}
                dir="auto"
                placeholder={t('pastePlaceholder', language)}
                className="w-full p-4 rounded-2xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 font-mono text-xs sm:text-sm text-slate-800 resize-y transition shadow-inner"
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className={isUrdu ? 'font-urdu' : ''}>
              {isUrdu
                ? 'اے آئی چھٹی جماعت کے سادہ الفاظ میں سمجھائے گا اور کوئی تشخیص نہیں کرے گا۔'
                : language === 'roman_ur'
                ? 'AI grade-6 ki aasan zuban mein wazahat day ga aur bimari diagnose nahi karega.'
                : 'Explains in simple Grade-6 language. Never diagnoses.'}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 transition-all flex items-center justify-center gap-2 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className={isUrdu ? 'font-urdu' : ''}>{t('analyzingProgress', language)}</span>
              </>
            ) : (
              <>
                <span className={isUrdu ? 'font-urdu' : ''}>{t('analyzeButton', language)}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
