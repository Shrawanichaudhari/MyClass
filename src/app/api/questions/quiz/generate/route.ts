import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const count = parseInt(searchParams.get('count') || '5');
  const subject = searchParams.get('subject') || 'Mathematics';
  let board = searchParams.get('board') || 'CBSE';
  let grade = searchParams.get('grade') || 'Class 8';

  const level = searchParams.get('level') || 'Rising Star';

  if (!board || board === 'N/A' || board === 'undefined') board = 'CBSE';
  if (!grade || grade === 'N/A' || grade === 'undefined') grade = 'Class 8';

  const mockQuestions = Array.from({ length: count }, (_, i) => ({
    id: `mock-${Date.now()}-${i}`,
    topic: subject,
    question: `General question #${i+1} about ${subject}?`,
    options: ["A", "B", "C", "D"],
    correct: 0,
    explanation: "Practice makes perfect.",
    hint: "Basic concept.",
    difficulty: 'medium'
  }));

  try {
    const apiKey = process.env.XAI_API_KEY;

    if (!apiKey) return NextResponse.json(mockQuestions);

    const systemPrompt = `You are a curriculum-aligned quiz generator. 
    Generate a JSON array of ${count} MCQs for Board: ${board}, Grade: ${grade}, Subject: ${subject}.
    The student's ML-detected level is: ${level}.
    Adjust complexity to match this level (${level === 'Elite' ? 'Hard' : level === 'At Risk' ? 'Easy' : 'Medium'}).
    Respond ONLY with valid JSON array of objects.`;

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
          { role: "user", content: `Generate ${count} questions.` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.8
      })
    });

    if (!response.ok) {
        console.error("Groq Quiz Error:", await response.text().catch(() => "Unknown"));
        return NextResponse.json(mockQuestions);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) return NextResponse.json(mockQuestions);

    try {
        const parsed = JSON.parse(content);
        const questions = Array.isArray(parsed) ? parsed : (parsed.questions || []);
        return NextResponse.json(questions.slice(0, count));
    } catch (e) {
        console.error("Quiz Parse Error:", e);
        return NextResponse.json(mockQuestions);
    }

  } catch (error: any) {
    console.error("Quiz API Critical Error:", error);
    return NextResponse.json(mockQuestions);
  }
}
