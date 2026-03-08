import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get('topic') || 'Algebra';
  let board = searchParams.get('board') || 'CBSE';
  let grade = searchParams.get('grade') || 'Class 8';
  const level = searchParams.get('level') || 'Rising Star';

  if (!board || board === 'N/A' || board === 'undefined') board = 'CBSE';
  if (!grade || grade === 'N/A' || grade === 'undefined') grade = 'Class 8';

  const fallbackQuestion = {
    id: `fb-${Date.now()}`,
    topic,
    question: `What is a basic concept of ${topic} for ${board} ${grade}?`,
    options: ["Alpha", "Beta", "Gamma", "Delta"],
    correct: 0,
    explanation: "Standard fallback explanation.",
    microLesson: "Keep practicing! The AI is refreshing.",
    hint: "Think simple.",
    difficulty: 'easy'
  };

  try {
    const apiKey = process.env.XAI_API_KEY;

    if (!apiKey) return NextResponse.json(fallbackQuestion);

    const systemPrompt = `You are a curriculum-aligned question generator. 
    Generate one MCQ for Board: ${board}, Grade: ${grade}, Topic: ${topic}.
    The student's ML-detected level is: ${level}. 
    Adjust question difficulty and complexity to match this level (${level === 'Elite' ? 'Hard' : level === 'At Risk' ? 'Easy' : 'Medium'}).
    Respond ONLY with valid JSON.`;

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
          { role: "user", content: `Generate one ${topic} question.` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      })
    });

    if (!response.ok) {
        console.error("Groq Question Error:", await response.text().catch(() => "Unknown"));
        return NextResponse.json(fallbackQuestion);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) return NextResponse.json(fallbackQuestion);

    try {
        return NextResponse.json(JSON.parse(content));
    } catch (e) {
        console.error("JSON Parse Error:", e);
        return NextResponse.json(fallbackQuestion);
    }

  } catch (error: any) {
    console.error("Generator API Critical Error:", error);
    return NextResponse.json(fallbackQuestion);
  }
}
