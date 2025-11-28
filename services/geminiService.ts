import { GoogleGenAI } from "@google/genai";
import { GeminiModel } from "../types";

// Ensure API key is present
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("API_KEY is missing from environment variables");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });

export const streamMessage = async (
  modelId: string,
  message: string,
  history: { role: string; content: string }[] = []
) => {
  try {
    const chat = ai.chats.create({
      model: modelId,
      history: history.map(h => ({
        role: h.role === 'model' ? 'model' : 'user',
        parts: [{ text: h.content }],
      })),
    });

    const result = await chat.sendMessageStream({
      message: message,
    });

    return result;
  } catch (error) {
    console.error("Error streaming message:", error);
    throw error;
  }
};