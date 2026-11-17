import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { askQuestion } from '../api';

export default function ChatBox({ context, language }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const isUrdu = language === 'ur';

  const quickQuestions = isUrdu
    ? [
        'یہ رپورٹ مجموعی طور پر کیا بتاتی ہے؟',
        'کیا کوئی ایسی چیز ہے جس پر مجھے ڈاکٹر سے بات کرنی چاہیے؟',
        'ان ادویات کے عام استعمال کیا ہیں؟',
      ]
    : language === 'roman_ur'
    ? [
        'Yeh report aasan alfaz mein kya batati hai?',
        'Kya koi test ya dawai doctor se discuss karni chahiye?',
        'Mujhe doctor se kya sawal poochna chahiye?',
      ]
    : [
        'Can you summarize this in one simple sentence?',
        'Which results should I discuss first with my doctor?',
        'What are the general instructions for these medicines?',
      ];

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
            {isUrdu ? 'رپورٹ کے بارے میں مزید سوال پوچھیں' : language === 'roman_ur' ? 'Report Ke Baray Mein Sawal Poochein' : 'Ask Questions About This Document'}
          </h3>
          <p className={`text-xs sm:text-sm text-slate-500 ${isUrdu ? 'font-urdu' : ''}`}>
            {isUrdu
              ? 'اے آئی صرف اس رپورٹ کی معلومات کے اندر سے جواب دے گا اور کوئی تشخیص نہیں کرے گا۔'
              : language === 'roman_ur'
              ? 'AI sirf is report ki hadd tak wazahat day ga aur koi bimari diagnose nahi karay ga.'
              : 'Answers strictly from this report. Refuses diagnosis and dosage changes.'}
          </p>
        </div>
      </div>

      {/* Suggested Quick Questions */}
      {messages.length === 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{isUrdu ? 'تجویز کردہ سوالات:' : language === 'roman_ur' ? 'Suggested sawalat:' : 'Suggested Quick Questions:'}</span>
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

      {/* Messages Thread */}
      <div className="mt-5 space-y-4 max-h-[380px] overflow-y-auto pr-1">
        {messages.map((m, idx) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${isUser ? (isUrdu ? 'flex-row' : 'flex-row-reverse') : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isUser ? 'bg-slate-700 text-white' : 'bg-emerald-600 text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm sm:text-base leading-relaxed ${
                  isUser
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'bg-emerald-50/60 border border-emerald-100 text-slate-800'
                } ${isUrdu ? 'font-urdu' : ''}`}
              >
                {m.text}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-100 rounded-2xl px-4 py-3 text-slate-600 text-sm flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
              <span>{isUrdu ? 'جواب تیار ہو رہا ہے...' : 'Thinking safe response...'}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="mt-5 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            isUrdu
              ? 'مثال: اس ٹیسٹ کا کیا مطلب ہے؟'
              : language === 'roman_ur'
              ? 'Misaal: Is dawai ka kya faida hai?'
              : 'Ask a question about this report...'
          }
          disabled={loading}
          className={`flex-1 px-4 py-3 rounded-2xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-sm sm:text-base transition-all ${
            isUrdu ? 'font-urdu' : ''
          }`}
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold flex items-center gap-2 shadow-sm transition-all flex-shrink-0"
        >
          <span className="hidden sm:inline">{isUrdu ? 'ارسال کریں' : 'Send'}</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </section>
  );
}
