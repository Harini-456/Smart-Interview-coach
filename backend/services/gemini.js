import axios from "axios";
import https from "https";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Bypass SSL issues on corporate/college networks
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// ── Try Google Gemini first (generativelanguage.googleapis.com) ──
const tryGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("No GEMINI_API_KEY set");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent(
    `You are an expert interview question generator. Always respond with valid JSON only. Never include markdown, code blocks, or explanations outside the JSON.\n\n${prompt}`
  );

  const text = result.response.text();
  if (!text) throw new Error("Empty Gemini response");
  return text;
};

// ── Try OpenRouter as fallback ──
const tryOpenRouter = async (prompt, model) => {
  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model,
      messages: [
        {
          role: "system",
          content: "You are an expert interview question generator. Always respond with valid JSON only. Never include markdown, code blocks, or explanations outside the JSON."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 2000
    },
    {
      httpsAgent,
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Smart Interview Coach"
      },
      timeout: 30000
    }
  );

  const text = response.data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty OpenRouter response");
  return text;
};

export const callAI = async (prompt) => {
  const attempts = [
    { name: "Google Gemini", fn: () => tryGemini(prompt) },
    { name: "OpenRouter gpt-3.5-turbo", fn: () => tryOpenRouter(prompt, "openai/gpt-3.5-turbo") },
    { name: "OpenRouter mistral-7b", fn: () => tryOpenRouter(prompt, "mistralai/mistral-7b-instruct") },
    { name: "OpenRouter gemma-3b (free)", fn: () => tryOpenRouter(prompt, "google/gemma-3-4b-it:free") },
  ];

  for (const attempt of attempts) {
    try {
      console.log(`🔄 Trying: ${attempt.name}`);
      const text = await attempt.fn();
      console.log(`✅ Success with: ${attempt.name}`);
      console.log("🧠 RAW AI OUTPUT:\n", text.substring(0, 300));
      return text;
    } catch (err) {
      console.error(`❌ ${attempt.name} failed:`, err.message);
    }
  }

  throw new Error("All AI providers failed. Please check your API keys or try on a different network.");
};
