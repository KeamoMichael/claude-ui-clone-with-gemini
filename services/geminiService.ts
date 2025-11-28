import { GoogleGenAI } from "@google/genai";
import { GeminiModel, SearchResult, FetchedUrl } from "../types";

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

/**
 * Stream a message with web search context
 */
export const streamMessageWithSearch = async (
  modelId: string,
  message: string,
  searchResults: SearchResult[],
  fetchedUrls: FetchedUrl[],
  history: { role: string; content: string }[] = []
) => {
  try {
    // Build context from search results
    let searchContext = "\n\n--- Web Search Results ---\n";

    if (searchResults.length > 0) {
      searchContext += "I found the following relevant information:\n\n";
      searchResults.forEach((result, index) => {
        searchContext += `${index + 1}. ${result.title}\n`;
        searchContext += `   URL: ${result.url}\n`;
        searchContext += `   ${result.snippet}\n\n`;
      });
    }

    if (fetchedUrls.length > 0) {
      searchContext += "\n--- Fetched Content ---\n";
      fetchedUrls.forEach((fetched, index) => {
        searchContext += `\nContent from ${fetched.title} (${fetched.url}):\n`;
        searchContext += `${fetched.content.slice(0, 2000)}...\n\n`;
      });
    }

    searchContext += "--- End of Web Search Results ---\n\n";
    searchContext += "Please use the above web search results to answer the user's question. Cite sources when relevant.\n\n";
    searchContext += `User's question: ${message}`;

    const chat = ai.chats.create({
      model: modelId,
      history: history.map(h => ({
        role: h.role === 'model' ? 'model' : 'user',
        parts: [{ text: h.content }],
      })),
    });

    const result = await chat.sendMessageStream({
      message: searchContext,
    });

    return result;
  } catch (error) {
    console.error("Error streaming message with search:", error);
    throw error;
  }
};