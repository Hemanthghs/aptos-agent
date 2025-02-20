import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { BaseAgentRuntime, SQLiteAdapter, WebCrawler } from "@aptos/base";

dotenv.config();

// Global state tracking
let isRunning = false;
let runtime: BaseAgentRuntime | null = null;

// Create database adapter
const dbAdapter = new SQLiteAdapter("./bot.db");

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Chat endpoint interface
interface ChatRequest {
  message: string;
}

// Auto-initialize agent runtime on app startup
async function initializeRuntime() {
  if (isRunning) {
    console.info("Agent runtime is already running");
    return;
  }

  try {
    console.info("Initializing agent runtime...");

    // Create runtime
    runtime = new BaseAgentRuntime(dbAdapter);
    await runtime.initialize();
    isRunning = true;
    console.info("Agent runtime initialized successfully!");

    // Load knowledge after tensorflow embedding models are loaded
    // setTimeout(async () => {
    //   console.info("Beginning knowledge ingestion process...");
    //   const urls = [
    //     "https://aptos.dev/en/build/smart-contracts",
    //     "https://aptos.dev/en/build/sdks",
    //     "https://aptos.dev/en/build/indexer",
    //   ];

    //   const knowledges: string[] = [];
    //   const crawler = new WebCrawler();

    //   for (let index = 0; index < urls.length; index++) {
    //     const url = urls[index];
    //     console.info(
    //       `Processing knowledge source ${index + 1}/${urls.length}: ${url}`
    //     );

    //     if (isValidUrl(url)) {
    //       const result = await crawler.crawl(url);
    //       knowledges.push(result);
    //     } else {
    //       knowledges.push(url);
    //     }
    //   }

    //   if (runtime) {
    //     await runtime.addKnowledge(knowledges);
    //   } else {
    //     console.error(
    //       "Runtime is not initialized. Skipping knowledge ingestion."
    //     );
    //   }

    //   console.info("Knowledge ingestion complete!");
    // }, 60_000); // 60 second delay for tensorflow loading
  } catch (error: any) {
    isRunning = false;
    console.error("Runtime initialization failed:", error);
  }
}

// Add chat endpoint to handle user messages
app.post("/chat", async (req: Request, res: Response) => {
  // Check if runtime is initialized
  if (!runtime || !isRunning) {
    res.status(503).json({
      error: "Agent runtime is not ready yet. Please try again in a moment.",
    });
  }

  // Validate request body
  const chatRequest = req.body as ChatRequest;
  if (!chatRequest.message || typeof chatRequest.message !== "string") {
    res.status(400).json({
      error:
        "Invalid request. 'message' field is required and must be a string.",
    });
  }

  try {
    // Generate response using the runtime
    console.info(
      "Processing chat message:",
      chatRequest.message.substring(0, 50) +
        (chatRequest.message.length > 50 ? "..." : "")
    );
    let responseText = "";
    if (runtime) {
      responseText = await runtime.generateResponse(chatRequest.message);
    } else {
      console.error(
        "Runtime is not initialized. Skipping knowledge ingestion."
      );
    }

    // Return the response
    res.status(200).json({
      response: responseText,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error processing chat request:", error);
    res.status(500).json({
      error: "Failed to generate response",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Add a status endpoint to check if runtime is initialized
app.get("/status", (req: Request, res: Response) => {
  res.status(200).json({
    running: isRunning,
    initialized: runtime !== null,
    knowledgeLoaded: isRunning && runtime !== null,
  });
});

// Start the server
const PORT = process.env.PORT || 3000; // Render provides PORT dynamically

app.listen(PORT, '0.0.0.0', () => {  // Ensure it listens on all network interfaces
  console.info(`Server running on port ${PORT}`);
  initializeRuntime();
});

function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return /^https?:/.test(url.protocol);
  } catch {
    return false;
  }
}
