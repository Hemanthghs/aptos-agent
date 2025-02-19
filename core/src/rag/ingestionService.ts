import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import { Document } from '../rag';
import { EmbeddingService } from './embeddingService';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

/**
 * Service for ingesting knowledge from text, URLs, and PDF files.
 */
export class IngestionService {
    private embeddingService: EmbeddingService;
    private chunkSize: number = 512;

    constructor(embeddingService: EmbeddingService) {
        this.embeddingService = embeddingService;
    }

    /**
     * Ingests documents from text or file paths.
     * @param inputs - Array of strings containing either text or file paths.
     * @returns An array of documents with embeddings.
     */
    async ingest(inputs: string[]): Promise<Document[]> {
        const documents: Document[] = [];

        for (const input of inputs) {
            try {
                let content: string;

                if (input.startsWith('/') || input.startsWith('./') || input.startsWith('../')) {
                    const filePath = path.resolve(input);
                    content = await fs.readFile(filePath, 'utf-8');
                    console.log(`Read file: ${filePath}`);
                } else {
                    content = input;
                }

                // Generate full-text embedding
                const fullEmbedding = await this.embeddingService.getEmbedding(content);
                const documentId = crypto.randomUUID();

                // Store full document
                documents.push({
                    id: documentId,
                    content,
                    embedding: fullEmbedding,
                    created_at: new Date(),
                    isFullText: true,
                    parentId: null,
                });

                console.log(`[ingest] Stored full-text embedding for document ${documentId}`);

                // ignore chunk embedding if text length is smaller than chunk size
                if (content.length <= this.chunkSize) {
                    continue
                }

                // Split content into chunks
                const chunks = await this.splitChunks(content, this.chunkSize);

                // Generate embeddings for each chunk
                for (const chunk of chunks) {
                    const chunkEmbedding = await this.embeddingService.getEmbedding(chunk);
                    documents.push({
                        id: crypto.randomUUID(),
                        content: chunk,
                        embedding: chunkEmbedding,
                        created_at: new Date(),
                        parentId: documentId, // Track parent document
                        isFullText: false,
                    });
                }

                console.log(`[ingest] Processed input with ${chunks.length} chunks.`);
            } catch (error) {
                console.log(`Failed to process input "${input}":`, error);
            }
        }

        return documents;
    }

    /**
     * Splits content into chunks of specified size with optional overlapping bleed sections
     * @param content - The text content to split into chunks
     * @param chunkSize - The maximum size of each chunk in tokens
     * @param bleed - Number of characters to overlap between chunks (default: 20)
     * @returns Promise resolving to array of text chunks with bleed sections
     */
    async splitChunks(content: string, chunkSize = 512, bleed = 20): Promise<string[]> {
        console.log(`[splitChunks] Starting text split`);

        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: Number(chunkSize),
            chunkOverlap: Number(bleed),
        });

        const chunks = await textSplitter.splitText(content);

        console.log(`[splitChunks] Split complete`, {
            numberOfChunks: chunks.length,
            averageChunkSize:
                chunks.reduce((acc: number, chunk: string) => acc + chunk.length, 0) / chunks.length,
        });

        return chunks;
    }
}
