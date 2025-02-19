import { Tool, generateText as aiGenerateText } from "ai";
import { BaseAgentRuntime } from "./runtime";
import { createOpenAI } from "@ai-sdk/openai";

export async function generateMessageResponse({
  runtime,
  context,
}: {
  runtime: BaseAgentRuntime;
  context: string;
}): Promise<any> {
  const provider = "chat_akash_api";

  let retryLength = 1000; // Initial retry delay in milliseconds
  let maxRetries = 5; // Maximum number of retries
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      console.info("Generating message response via Akash...");

      const response = await generateText({
        runtime,
        context,
      });

      return response;
    } catch (error) {
      console.error("Error generating message response:", error);

      retryCount++;
      if (retryCount >= maxRetries) {
        throw new Error(
          `Failed to generate valid response after ${maxRetries} attempts`
        );
      }
      // Exponential backoff
      retryLength *= 2;
      console.debug(
        `Retrying in ${retryLength}ms... (Attempt ${
          retryCount + 1
        }/${maxRetries})`
      );
      await new Promise((resolve) => setTimeout(resolve, retryLength));
    }
  }
  // This should never be reached due to the throw in the catch block
  throw new Error("Failed to generate message response");
}

export async function generateText({
  runtime,
  context,
}: {
  runtime: BaseAgentRuntime;
  context: string;
  tools?: Record<string, Tool>;
  maxSteps?: number;
  stop?: string[];
  customSystemPrompt?: string;
}): Promise<string> {
  if (!context) {
    console.error("generateText context is empty");
    return "";
  }

  const modelId = "Meta-Llama-3-3-70B-Instruct";

  try {
    // Trim context to max length

    // Initialize OpenAI client with Akash endpoint
    const openai = createOpenAI({
      apiKey: "sk-RZZcjuRddXPpXQWfWs-YrA",
      baseURL: "https://chatapi.akash.network/api/v1",
    });

    // Generate text using the configured model
    const { text: response } = await aiGenerateText({
      model: openai.languageModel(modelId),
      prompt: context,
    });
    return response;
  } catch (error) {
    console.error("Error generating text with Akash:", error);
    throw error;
  }
}

export function parseResponse(response: any) {
  try {
    // Check for backticks and extract JSON content
    const backtickPattern = /^```(?:json\n)?([\s\S]+?)\n?```$/;
    const match = response.match(backtickPattern);

    // If backticks are found, extract the JSON part
    let jsonString = match ? match[1] : response;

    // Attempt to find JSON content if there is extra text
    if (!match) {
      const jsonMatch = jsonString.match(/{[\s\S]*}/);
      if (jsonMatch) {
        jsonString = jsonMatch[0];
      } else {
        throw new Error("No valid JSON found in the response");
      }
    }

    // Parse and return the JSON object
    return JSON.parse(jsonString);
  } catch (error) {
    return null; // Handle the error gracefully
  }
}
