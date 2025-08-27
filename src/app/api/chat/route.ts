import { NextRequest, NextResponse } from "next/server";

interface GrokChoice {
  message: { role: "assistant"; content: string };
}

interface GrokResponse {
  choices: GrokChoice[];
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json(); // extract message

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: message }],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Grok API Error:", text);
      return NextResponse.json({ error: "Grok API request failed", details: text }, { status: 500 });
    }

    const data: GrokResponse = await response.json();

    if (!data.choices || !data.choices[0]?.message?.content) {
      return NextResponse.json({ error: "Invalid response from Grok API" }, { status: 500 });
    }

    return NextResponse.json({ reply: data.choices[0].message.content });
  } catch (err: any) {
    console.error("Server Error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}