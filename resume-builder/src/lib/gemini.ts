import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY 
});

export async function generateAiContent() {
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: "",
  });

  console.log(response.text);
}

