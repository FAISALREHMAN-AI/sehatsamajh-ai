import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { askQuestion } from '../api';
import { t, translations } from '../i18n';

export default function ChatBox({ context, language }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const isUrdu = language === 'ur';

  const quickQuestions =
    translations[language]?.quickQuestions || translations.en.quickQuestions;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (questionText) => {
    const q = (questionText || input).trim();
    if (!q || loading) return;

    setInput('');
    setError(null);

    const userMessage = { sender: 'user', text: q };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await askQuestion({
        context,
        question: q,
        language,
      });

      const aiMessage = { sender: 'ai', text: res.answer };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setError(err.message || 'Failed to get answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mb-12 bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm" dir={isUrdu ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-sm">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h3 className={`text-lg sm:text-xl font-bold text-slate-900 ${isUrdu ? 'font-urdu' : ''}`}>
            {t('chatTitle', language)}
          </h3>
          <p className={`text-xs sm:text-sm text-slate-500 ${isUrdu ? 'font-urdu' : ''}`}>
            {t('chatSubtitle', language)}
          </p>
        </div>
      </div>

      {/* Suggested Quick Questions */}
      {messages.length === 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{t('quickQuestionsLabel', language)}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(q)}
                className={`text-xs sm:text-sm bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 text-slate-700 px-3.5 py-2 rounded-xl border border-slate-200 transition-all text-left ${isUrdu ? 'font-urdu' : ''}`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="mt-5 space-y-4 max-h-96 overflow-y-auto pr-1">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs ${
                msg.sender === 'user' ? 'bg-slate-700' : 'bg-emerald-600'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`p-4 rounded-2xl max-w-xl text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white rounded-br-none'
                  : 'bg-emerald-50 border border-emerald-200 text-slate-800 rounded-bl-none shadow-xs'
              } ${isUrdu ? 'font-urdu' : ''}`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-100 text-slate-600 text-xs sm:text-sm flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
              <span className={isUrdu ? 'font-urdu' : ''}>{t('chatThinking', language)}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Input Field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="mt-5 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('chatPlaceholder', language)}
          disabled={loading}
          className="flex-1 px-4 py-3 rounded-2xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm transition"
        />

        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm shadow flex items-center justify-center gap-1.5 transition"
        >
          <span>{t('chatSend', language)}</span>
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Safety Notice */}
      <p className="mt-3 text-center text-slate-400 text-2xs">
        {t('chatDisclaimer', language)}
      </p>
    </section>
  );
}
