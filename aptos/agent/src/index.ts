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
    setTimeout(async () => {
      console.info("Beginning knowledge ingestion process...");

      // Define multiple URL patterns to crawl
      const mainUrlPatterns = [
        "https://aptos.dev/en/build/*",
        "https://aptos.dev/en/network/blockchain/*",
        // "https://aptos.dev/en/network/blockchain/events",
        // "https://aptos.dev/en/network/nodes/configure/state-sync"
      ];

      const crawler = new WebCrawler();
      const allResults: Array<{ url: string, content: string }> = [];

      try {
        // Manually add known important URLs for each section
        // This ensures we at least get the main pages even if discovery fails
        const knownImportantUrls = {
          "https://aptos.dev/en/build/*": [
            "https://aptos.dev/en/build/",
            "https://aptos.dev/en/build/smart-contracts",
            "https://aptos.dev/en/build/sdks",
            "https://aptos.dev/en/build/indexer",
            "https://aptos.dev/en/build/apis/fullnode-rest-api-reference"
          ],
          "https://aptos.dev/en/network/blockchain/*": [
            "https://aptos.dev/en/network/blockchain/",
            "https://aptos.dev/en/network/blockchain/blocks",
            "https://aptos.dev/en/network/blockchain/txns"
          ]
        };

        // Process each pattern sequentially
        for (let i = 0; i < mainUrlPatterns.length; i++) {
          const pattern = mainUrlPatterns[i];
          const baseUrl = pattern.replace("*", "");

          console.info(`[${i + 1}/${mainUrlPatterns.length}] Starting crawl with pattern: ${pattern}`);

          // Reset crawler state before processing a new pattern
          crawler.resetCrawlerState();

          // First try automatic discovery
          const results = await crawler.crawlRecursively(baseUrl, 3);
          console.info(`Automatically crawled ${results.length} pages for pattern: ${pattern}`);

          // If few or no pages were discovered, use the known important URLs
          if (results.length <= 1 && knownImportantUrls[pattern]) {
            console.info(`Using fallback list of known URLs for pattern: ${pattern}`);

            for (const knownUrl of knownImportantUrls[pattern]) {
              if (!results.some(r => r.url === knownUrl)) {
                try {
                  console.info(`Manually processing known URL: ${knownUrl}`);
                  const content = await crawler.crawl(knownUrl);
                  results.push({ url: knownUrl, content });
                } catch (err) {
                  console.warn(`Failed to crawl known URL ${knownUrl}: ${(err as Error).message}`);
                }
              }
            }
          }

          console.info(`Total pages for pattern ${pattern}: ${results.length}`);

          // Add results to the combined collection
          allResults.push(...results);
        }

        // Remove potential duplicates based on URL
        const uniqueResults = Array.from(
          new Map(allResults.map(item => [item.url, item])).values()
        );

        console.info(`Total unique pages crawled: ${uniqueResults.length}`);
        if (uniqueResults.length === 0) {
          throw new Error("No content was successfully crawled. Check network connectivity and URL patterns.");
        }

        // Extract content for knowledge ingestion
        const knowledges: string[] = uniqueResults.map(result => {
          return `[Source: ${result.url}]\n${result.content}`;
        });

        // Add the crawled knowledge to the runtime
        if (runtime) {
          console.info(`Adding ${knowledges.length} knowledge items to runtime...`);
          await runtime.addKnowledge(knowledges);
          console.info("Knowledge successfully added to runtime.");
        } else {
          console.error("Runtime is not initialized. Skipping knowledge ingestion.");
          // For debugging without runtime
          console.info(`Crawled ${knowledges.length} documents successfully`);
          // Print first 100 chars of first few documents for debugging
          knowledges.slice(0, 3).forEach((doc, i) => {
            console.info(`Document ${i + 1} preview: ${doc.substring(0, 100)}...`);
          });
        }

        console.info("Knowledge ingestion complete!");
      } catch (error) {
        console.error(`Knowledge ingestion failed: ${(error as Error).message}`);
      }
    }, 60_000); // / 60 second delay for tensorflow loading
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
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.info(`Server running on http://localhost:${PORT}`);

  // Auto-start the runtime when server starts
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
