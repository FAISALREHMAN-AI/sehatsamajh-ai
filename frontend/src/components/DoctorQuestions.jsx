import React, { useState } from 'react';
import { HelpCircle, Copy, Check, MessageSquareQuote } from 'lucide-react';

export default function DoctorQuestions({ questions, language }) {
  const [copiedIdx, setCopiedIdx] = useState(null);

  if (!questions || questions.length === 0) return null;

  const isUrdu = language === 'ur';

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2500);
  };

  return (
    <section className="mb-10" dir={isUrdu ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2 ${isUrdu ? 'font-urdu' : ''}`}>
            <MessageSquareQuote className="w-6 h-6 text-emerald-600" />
            <span>
              {isUrdu
                ? 'ڈاکٹر سے پوچھنے کے لیے اہم سوالات'
                : language === 'roman_ur'
                ? 'Doctor Se Poochnay Ke Sawalat'
                : 'Questions to Ask Your Doctor'}
            </span>
          </h3>
          <p className={`text-xs sm:text-sm text-slate-500 mt-1 ${isUrdu ? 'font-urdu' : ''}`}>
            {isUrdu
              ? 'جب آپ اگلی بار ڈاکٹر کے پاس جائیں تو یہ سوالات اپنے ساتھ لے جا سکتے ہیں۔'
              : language === 'roman_ur'
              ? 'Agli checkup par aap doctor se yeh sawalat aasaani se pooch saktay hain.'
              : 'Empower yourself during your clinic visit by asking these focused questions.'}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {questions.map((q, idx) => {
          const isCopied = copiedIdx === idx;
          return (
            <div
              key={idx}
              className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-4 flex items-start justify-between gap-3 hover:bg-emerald-50 transition-colors"
            >
              <div className="flex items-start gap-3 flex-1">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  {idx + 1}
                </span>
                <p className={`text-sm sm:text-base font-medium text-slate-800 leading-relaxed ${isUrdu ? 'font-urdu' : ''}`}>
                  {q}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(q, idx)}
                title="Copy question"
                aria-label="Copy question"
                className="flex-shrink-0 p-2 text-slate-500 hover:text-emerald-700 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all"
              >
                {isCopied ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="hidden sm:inline">Copied</span>
                  </span>
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
