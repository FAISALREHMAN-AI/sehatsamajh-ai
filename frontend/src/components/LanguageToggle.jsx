import React from 'react';
import { Languages } from 'lucide-react';

export default function LanguageToggle({ currentLang, onChange }) {
  const languages = [
    { code: 'en', label: 'English', sub: 'English' },
    { code: 'roman_ur', label: 'Roman Urdu', sub: 'Aasan Urdu' },
    { code: 'ur', label: 'اردو', sub: 'اردو رسم الخط' },
  ];

  return (
    <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
      <div className="flex items-center gap-1 pl-2 pr-1 text-slate-500">
        <Languages className="w-4 h-4 text-emerald-600" />
        <span className="text-xs font-semibold uppercase tracking-wider hidden sm:inline">Lang:</span>
      </div>
      <div className="flex gap-1">
        {languages.map((lang) => {
          const isActive = currentLang === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => onChange(lang.code)}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all flex items-center gap-1 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              } ${lang.code === 'ur' ? 'font-urdu pt-1 pb-1' : ''}`}
              aria-pressed={isActive}
            >
              <span>{lang.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
