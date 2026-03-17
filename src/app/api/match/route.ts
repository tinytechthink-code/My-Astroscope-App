interface MatchRequest {
  groom: string;
  bride: string;
  groomDOB: string;
  groomTime: string;
  groomPlace: string;
  brideDOB: string;
  brideTime: string;
  bridePlace: string;
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

  const { groom, bride, groomDOB, groomTime, groomPlace, brideDOB, brideTime, bridePlace } = body;
  if (!groom || !bride || !groomDOB || !groomTime || !groomPlace || !brideDOB || !brideTime || !bridePlace) {
    return new Response(JSON.stringify({ error: "groom, bride, and birth details are required" }), { status: 400 });
  }

  const prompt = `Horoscope compatibility of the following bride and groom using Vedic astrology principles.
Provide a detailed analysis including:
Compatibility of Moon signs (Rashi) and Nakshatras
Mangal Dosha (Kuja Dosha) presence and its effects
Planetary positions and their impact on married life
Overall marital harmony, emotional compatibility, financial stability, and longevity of marriage

Bride Details:
  Name: ${bride}
  Date of Birth: ${brideDOB}
  Time of Birth: ${brideTime}
  Place of Birth: ${bridePlace}

Groom Details:
  Name: ${groom}
  Date of Birth: ${groomDOB}
  Time of Birth: ${groomTime}
  Place of Birth: ${groomPlace}

Give compatibility score out of 100 and conclude with a clear compatibility verdict (Excellent / Good / Average / Needs Remedies) and suggest remedies if any doshas are present.`;

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
    console.error("OpenAI failed", response.status, errorText);
    return new Response(JSON.stringify({ error: "OpenAI request failed", status: response.status, detail: errorText }), { status: 502 });
  }

  const data: OpenAIResponse = await response.json();

  return Response.json({
    reply: data.choices?.[0]?.message?.content ?? "No message returned",
  });
}