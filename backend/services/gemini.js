import axios from "axios";

export const callAI = async (prompt) => {
  try {
    console.log("🔄 Calling OpenRouter AI...");

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",  // Use the model your key supports
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const text = response.data?.choices?.[0]?.message?.content;

    console.log("🧠 RAW AI OUTPUT:\n", text);

    if (!text) {
      throw new Error("Empty AI response");
    }

    // Extract JSON array from AI output
    const jsonMatch = text.match(/\[[\s\S]*\]/);

    if (!jsonMatch) {
      throw new Error("No JSON found in AI response");
    }

    return jsonMatch[0];

  } catch (error) {
    console.error("❌ OpenRouter ERROR:");
    console.error(error.response?.data || error.message);
    throw new Error("AI API failed");
  }
};