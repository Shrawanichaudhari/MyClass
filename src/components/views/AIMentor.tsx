'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';

interface Message { id: string; role: 'user' | 'ai'; text: string; timestamp: string; }

const AI_RESPONSES: Record<string, string> = {
  default: "Great question! Let me help you understand this concept step by step. 🧠",
  algebra: "**Algebra Tips!**\n\n**Linear Equations:**\n• Move all x terms to one side\n• Move constants to the other side\n• Divide by the coefficient\n\nExample: 2x + 5 = 13\n→ 2x = 8\n→ x = 4 ✅",
  geometry: "**Geometry Key Formulas:**\n\n📐 Triangle: Area = ½ × base × height\n⬛ Rectangle: Area = l × w\n⭕ Circle: Area = πr²\n\n**Pythagorean Theorem:** a² + b² = c²",
  fractions: "**Fractions Made Easy!**\n\n**Adding fractions:**\n1. Find LCM of denominators\n2. Convert both fractions\n3. Add numerators\n\nExample: 1/2 + 1/3\n→ LCM = 6\n→ 3/6 + 2/6 = **5/6** ✅",
  pythagoras: "**Pythagorean Theorem:**\n\nIn a right-angled triangle:\n`a² + b² = c²`\n\nWhere c is the hypotenuse (longest side).\n\n**Example:** a=3, b=4\n→ 9 + 16 = c²\n→ c = √25 = **5** ✅",
  newton: "**Newton's Laws of Motion:**\n\n1️⃣ **First Law (Inertia):** An object stays at rest or in motion unless acted upon by a force.\n2️⃣ **Second Law:** F = ma (Force = mass × acceleration)\n3️⃣ **Third Law:** Every action has an equal and opposite reaction! 🚀",
  weak: "**Your Weak Topics:**\n\nBased on your performance, I recommend focusing on:\n\n1. 📐 **Algebra** (42%) – Practice solving linear equations\n2. 🔺 **Trigonometry** (30%) – Start with basic ratios (sin, cos, tan)\n3. 🔢 **Fractions** (55%) – Practice LCM and equivalent fractions\n\nWant me to generate practice questions for any of these? 📚",
  study: "**Your Personalized Study Plan:**\n\n🌅 **Morning (15 min):**\n• 5 Algebra questions (weak topic)\n• Review yesterday's mistakes\n\n☀️ **Afternoon (10 min):**\n• Fractions practice\n• 1 concept video\n\n🌙 **Evening (5 min):**\n• 1 quiz attempt\n• Review scorecard\n\nConsistency is key! 🔑",
};

async function getAIResponse(query: string, history: Message[]): Promise<string> {
  try {
    const res = await fetch('/api/mentor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: query, history })
    });
    const data = await res.json();
    return data.text;
  } catch (error) {
    return "I'm having trouble connecting to my AI core. Please check your internet connection! 🌐";
  }
}

const SUGGESTIONS = [
  'What are my weak topics?',
  'Explain Pythagorean theorem',
  'Create my study plan',
  'Help with Algebra',
  'Fractions tips',
  'Newton\'s laws explained',
];

export default function AIMentor() {
  const { user } = useStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0', role: 'ai', timestamp: new Date().toLocaleTimeString(),
      text: `Hello ${user?.name?.split(' ')[0] || 'Student'}! 👋 I'm your AI Mentor — available 24/7 to help you learn.\n\nYou can ask me about any subject, request concept explanations, get your personalized study plan, or find your weak areas. What would you like to explore today? 🚀`,
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: msg, timestamp: new Date().toLocaleTimeString() };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setLoading(true);
    
    const responseText = await getAIResponse(msg, messages);
    const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'ai', text: responseText, timestamp: new Date().toLocaleTimeString() };
    setMessages(m => [...m, aiMsg]);
    setLoading(false);
  };

  const renderText = (text: string) =>
    text.split('\n').map((line, i) => {
      const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      const code = bold.replace(/`(.*?)`/g, '<code class="bg-white/10 px-1 rounded text-purple-300 text-xs">$1</code>');
      return <p key={i} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: code || '&nbsp;' }} />;
    });

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-xl glow animate-float">🤖</div>
        <div>
          <h1 className="font-black text-white" style={{fontFamily:'Outfit,sans-serif'}}>AI Mentor</h1>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /><span className="text-xs text-green-400">Online 24/7</span></div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((m, idx) => (
          <motion.div key={m.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.05*idx}}
            className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${m.role === 'ai' ? 'gradient-primary' : 'bg-white/10'}`}>
              {m.role === 'ai' ? '🤖' : user?.avatar || '👤'}
            </div>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm space-y-1 ${
              m.role === 'ai' ? 'glass text-slate-200 rounded-tl-sm' : 'gradient-primary text-white rounded-tr-sm'
            }`}>
              {renderText(m.text)}
              <div className="text-xs opacity-40 mt-1">{m.timestamp}</div>
            </div>
          </motion.div>
        ))}
        {loading && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center gradient-primary">🤖</div>
            <div className="glass px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1">
              {[0,1,2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-purple-400" style={{animation:`bounce 1s infinite ${i*0.2}s`}} />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick suggestions */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {SUGGESTIONS.map(s => (
          <button key={s} onClick={() => send(s)}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border border-purple-500/40 text-purple-400 hover:bg-purple-500/20 transition-all whitespace-nowrap">
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask me anything… (e.g. 'Explain quadratic equations')"
          className="flex-1 px-4 py-3 rounded-xl glass text-white placeholder-slate-500 text-sm outline-none border border-white/10 focus:border-purple-500/50 transition-all"
        />
        <button onClick={() => send()} disabled={!input.trim() || loading}
          className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-xl disabled:opacity-40 transition-all hover:scale-105 active:scale-95 glow">
          ➤
        </button>
      </div>
    </div>
  );
}
