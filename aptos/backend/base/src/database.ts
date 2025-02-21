
import { Document } from "./rag";

export interface DatabaseAdapter {
    init(): Promise<void>;
    /**
       * Adds an array of documents (knowledge) to the database.
       * 
       * This method stores the provided documents.
       * It assumes that each document already includes the necessary vector embeddings.
       * 
       * @param documents - An array of `Document` objects containing content and precomputed embeddings.
       * @returns A promise that resolves when the documents have been successfully added.
       */
    addKnowledge(documents: Document[]): Promise<void>;

    /**
     * Searches the knowledge base for documents relevant to the given query.
     * 
     * This method retrieves the most relevant documents based on vector similarity search,
     * using the precomputed embeddings stored in the database.
     * 
     * @param query - The query string to search for relevant knowledge.
     * @param topK - The maximum number of relevant documents to return (default is 10).
     * @returns A promise that resolves with an array of `Document` objects ranked by relevance.
     */
    searchKnowledge(query: string, topK?: number): Promise<Document[]>;

    /**
     * Searches the knowledge base using vector embeddings.
     * 
     * This method calculates cosine similarity between the provided query embedding
     * and each document's embedding. It returns the topK documents with the highest similarity.
     * 
     * @param queryEmbedding - The embedding vector to search with.
     * @param topK - The number of results to return.
     * @returns An array of documents sorted by similarity.
     */
    searchByEmbedding(queryEmbedding: number[], topK: number): Promise<Document[]>
}
