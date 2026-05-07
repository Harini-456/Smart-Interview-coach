import axios from "axios";

export const callAI = async (prompt) => {
  console.log("KEY:", process.env.GEMINI_API_KEY);
  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages: [
          { role: "user", content: prompt }
        ]
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.GEMINI_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5000",
          "X-Title": "Smart Interview Coach"
        }
      }
    );

    let content = response.data.choices[0].message.content;

    // ✅ ADDED: clean JSON formatting (DO NOT REMOVE)
    content = content.replace(/```json|```/g, "").trim();

    return content;

  } catch (error) {
    console.error("AI Error:", error.response?.data || error.message);
    return "Error generating response";
  }
};