import React from 'react';
import { Pill, Clock, Info } from 'lucide-react';
import { t } from '../i18n';

export default function MedicineList({ medicines, language }) {
  if (!medicines || medicines.length === 0) return null;

  const isUrdu = language === 'ur';

  return (
    <section className="mb-10" dir={isUrdu ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2 ${isUrdu ? 'font-urdu' : ''}`}>
            <Pill className="w-6 h-6 text-emerald-600" />
            <span>{t('medGuideTitle', language)}</span>
          </h3>
          <p className={`text-xs sm:text-sm text-slate-500 mt-1 ${isUrdu ? 'font-urdu' : ''}`}>
            {t('medGuideSubtitle', language)}
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg">
          {medicines.length} {t('medCount', language)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {medicines.map((med, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <span className="inline-block text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mb-1">
                    Rx #{idx + 1}
                  </span>
                  <h4 className="text-lg font-bold text-slate-900">{med.name}</h4>
                  {med.dose && (
                    <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-0.5">
                      {t('doseLabel', language)} <span className="text-slate-900">{med.dose}</span>
                    </p>
                  )}
                </div>
                <div className="p-2 bg-emerald-100/60 rounded-xl text-emerald-700">
                  <Pill className="w-5 h-5" />
                </div>
              </div>

              {med.frequency && (
                <div className="mt-3 flex items-start gap-2 text-xs sm:text-sm text-slate-700 bg-slate-50 p-2.5 rounded-xl">
                  <Clock className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">{t('frequencyLabel', language)} </strong>
                    <span className={isUrdu ? 'font-urdu' : ''}>{med.frequency}</span>
                  </div>
                </div>
              )}

              {med.purpose && (
                <div className="mt-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">
                    {t('purposeLabel', language)}
                  </span>
                  <p className={`text-sm text-slate-800 leading-relaxed ${isUrdu ? 'font-urdu' : ''}`}>
                    {med.purpose}
                  </p>
                </div>
              )}
            </div>

            {med.notes && (
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-start gap-2 text-xs text-amber-800 bg-amber-50/60 p-2.5 rounded-xl">
                <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span className={isUrdu ? 'font-urdu' : ''}>
                  <strong>{t('notesLabel', language)} </strong>
                  {med.notes}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
