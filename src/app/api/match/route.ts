interface MatchRequest {
  groom: string;
  bride: string;
}

interface OpenAIMessage {
  role: "user" | "assistant";
  content: string;
}

interface OpenAIChoice {
  message: {
    content: string;
  };
}

interface OpenAIResponse {
  choices: OpenAIChoice[];
}



export async function POST(req: Request): Promise<Response> {
  const apiKey = process.env.OPENAI_API_KEY;
  console.log("KEY", apiKey?.startsWith("sk-"));
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY" }), { status: 500 });
  }

  let body: MatchRequest;
  try {
    body = await req.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
  }

  const { groom, bride } = body;
  if (!groom || !bride) {
    return new Response(JSON.stringify({ error: "groom and bride are required" }), { status: 400 });
  }

  const prompt = `
  Horoscope compatibility for Groom: ${groom}
  Bride: ${bride}
  Give compatibility score out of 100 and explanation.
  `;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }] as OpenAIMessage[],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return new Response(JSON.stringify({ error: "OpenAI request failed", status: response.status, detail: errorText }), { status: 502 });
  }

  const data: OpenAIResponse = await response.json();

  return Response.json({
    reply: data.choices?.[0]?.message?.content ?? "No message returned",
  });
}