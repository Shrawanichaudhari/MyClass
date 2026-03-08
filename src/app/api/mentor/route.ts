import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const timestamp = new Date().toLocaleTimeString();
  const fallbackResponse = {
    role: 'ai',
    text: "I'm having a little trouble thinking clearly right now. 🧠 Let's try that again, or maybe ask a different question?",
    timestamp
  };

  try {
    const body = await request.json().catch(() => ({}));
    const { message, history = [] } = body;
    const apiKey = process.env.XAI_API_KEY; // Using the same env var name but with Groq logic

    if (!apiKey) {
      return NextResponse.json({
        role: 'ai',
        text: "I'm in offline mode. Please ensure your API key is correctly set in .env.local.",
        timestamp,
      });
    }

    if (!message) {
      return NextResponse.json({
        role: 'ai',
        text: "I didn't quite catch that. Could you repeat it?",
        timestamp,
      });
    }

    const systemPrompt = "You are 'MyClass AI Mentor', a helpful, encouraging learning assistant for class 3-12 students. Keep answers concise and use markdown.";

    // Using Groq Endpoint for Groq Key
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          ...history.map((m: { role: string; text: string }) => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.text || ''
          })).slice(-10).filter((m: { content: string }) => m.content),
          { role: "user", content: message }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Groq Mentor Error:", errorData);
        return NextResponse.json(fallbackResponse);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) return NextResponse.json(fallbackResponse);

    return NextResponse.json({
      role: 'ai',
      text: content,
      timestamp,
    });

  } catch (error: unknown) {
    console.error("Mentor API Critical Error:", error);
    return NextResponse.json(fallbackResponse);
  }
}
