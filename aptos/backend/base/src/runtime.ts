import { DatabaseAdapter } from "./database";
import { EmbeddingService } from "./rag/embeddingService";
import { IngestionService } from "./rag/ingestionService";
import { Document } from "./rag";
import { generateMessageResponse, parseResponse } from "./generation";

export interface AgentRuntime {
  database: DatabaseAdapter;
  initialize(): Promise<void>;
  generateResponse(userText: string): Promise<string>;
}

export class BaseAgentRuntime implements AgentRuntime {
  database: DatabaseAdapter;
  private embeddingService: EmbeddingService;
  private ingestionService: IngestionService;

  constructor(database: DatabaseAdapter) {
    this.database = database;
    this.embeddingService = new EmbeddingService(""); // TODO : provide openai key
    this.ingestionService = new IngestionService(this.embeddingService);
  }

  async initialize(): Promise<void> {
    await this.database.init();
  }

  /**
   * Generates a response based on user input using RAG
   * @param userText - The user's input text
   * @returns A response string
   */
  async generateResponse(userText: string, recentMessagses?: any[]): Promise<string> {
    try {
      // Search for relevant documents using embeddings
      const documents = await this.searchByEmbedding(userText, 20);

      // Summarize the found documents
      const summary = await this.summarize(documents);

      // Format the context for LLM
      const messageHandlerTemplate = this.createMessageTemplate(
        userText,
        summary, recentMessagses
      );
      // Generate response using external function
      const response = await generateMessageResponse({
        runtime: this,
        context: messageHandlerTemplate,
      });

      // Parse the response
      //   const parsedResponse = parseResponse(response);
      //   if (!parsedResponse || !parsedResponse.text) {
      //     throw new Error("Failed to generate valid response");
      //   }

      return response;
    } catch (error) {
      console.error("Error generating response:", error);
      return "I encountered an error while processing your request. Please try again.";
    }
  }

  /**
   * Creates a message template with user input and context summary
   * @param userText - The user's input text
   * @param summary - The summary of relevant documents
   * @returns A formatted context string
   */
  private createMessageTemplate(userText: string, summary: string, recentMessagses?: any[]): string {
    return `
  You are an expert assistant providing accurate and insightful responses.
  
  ### User Query:
  ${userText}

  ### Recent Conversation
  ${JSON.stringify(recentMessagses)}
  
  ### Context & Relevant Information:
  ${summary}
  
  ### Instructions:
  - Use the provided context to craft a precise and well-structured response.
  - If additional clarification is needed, make reasonable assumptions.
  - Keep the response clear, concise, and informative.
  
  Now, generate the best possible response:
  `;
  }


  /**
   * Searches the knowledge base using a text query.
   * @param query - The query string to search for.
   * @param topK - The maximum number of results to return.
   * @returns An array of documents.
   */
  async searchByText(query: string, topK = 10): Promise<Document[]> {
    return this.database.searchKnowledge(query, topK);
  }

  /**
   * Searches the knowledge base using an embedding.
   * @param query - The embedding text to search with.
   * @param topK - The maximum number of results to return.
   * @returns An array of documents.
   */
  async searchByEmbedding(query: string, topK = 10): Promise<Document[]> {
    if (!this.embeddingService) {
      console.warn("embedding service is not available");
      return [];
    }
    try {
      const embedding = await this.embeddingService.getEmbedding(query);
      return await this.database.searchByEmbedding(embedding, topK);
    } catch (error: any) {
      console.warn("failed to generate embedding", error);
      return [];
    }
  }

  /**
   * Adds knowledge items to the database.
   *
   * Ingests the given list of knowledge items and stores the resulting documents.
   *
   * @param knowledgeList - Array of knowledge items to add.
   * @throws Error if ingestion or database operations fail.
   */
  async addKnowledge(knowledgeList: string[]): Promise<void> {
    // Check if ingestion service is available
    if (!this.ingestionService) {
      console.error("Ingestion service is not initialized");
      return;
    }

    // Check if embedding service is available
    if (!this.embeddingService) {
      console.error("Embedding service is not initialized");
      return;
    }

    if (knowledgeList.length === 0) {
      console.warn("Knowledge list is empty. No action taken.");
      return;
    }

    try {
      const documents = await this.ingestionService.ingest(knowledgeList);
      await this.database.addKnowledge(documents);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Failed to add knowledge:", err.message);
        throw err;
      } else {
        console.error("Failed to add knowledge: Unknown error", err);
        throw new Error("Unknown error occurred while adding knowledge");
      }
    }
  }

  /**
   * Summarizes the content of the given documents.
   *
   * If `embeddingService` is available, the documents are joined and summarized.
   * Otherwise, returns the first 5000 characters of the joined content.
   * Logs a warning if summarization fails.
   *
   * @param documents - An array of documents to summarize.
   * @returns A summary of the document content.
   */
  async summarize(documents: Document[]): Promise<string> {
    if (!this.embeddingService) {
      return this.truncateContent(documents);
    }

    try {
      // Join document contents and summarize
      const fullText = this.embeddingService.joinDocumentContents(documents);
      const summary = await this.embeddingService.summarize(fullText);
      return summary;
    } catch (error: unknown) {
      console.warn("Failed to summarize text.", { error });
      return this.truncateContent(documents);
    }
  }

  /**
   * Truncates document content to the first 5000 characters.
   * Ensures truncation doesn't cut in the middle of a word.
   */
  private truncateContent(documents: Document[]): string {
    const fullText = documents.map((d) => d.content).join("\n");
    if (fullText.length <= 5000) return fullText;

    // Truncate at a word boundary
    const truncated = fullText.slice(0, 5000);
    const lastSpaceIndex = truncated.lastIndexOf(" ");
    return truncated.slice(0, lastSpaceIndex !== -1 ? lastSpaceIndex : 5000);
  }
}
