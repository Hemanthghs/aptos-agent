import * as use from '@tensorflow-models/universal-sentence-encoder';
import { OpenAIEmbeddings } from "@langchain/openai";
import * as tf from '@tensorflow/tfjs-node';
import { OpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Document } from '../rag';
/**
 * Service for generating embeddings.
 */
export class EmbeddingService {
    private openAIEmbedder: OpenAIEmbeddings | null = null;
    private tfModel: use.UniversalSentenceEncoder | null = null;
    private openAILLM: OpenAI | null = null;

    constructor(secret: string) {
        if (secret) {
            this.openAIEmbedder = new OpenAIEmbeddings({
                openAIApiKey: secret,
                modelName: "text-embedding-ada-002"
            });

            this.openAILLM = new OpenAI({
                apiKey: secret,
                modelName: "gpt-4",
                temperature: 0.2,
            });
            console.info("🔑 Using OpenAI embeddings and LLM for summarization.");
        } else {
            console.info("⚙️ Using TensorFlow embeddings.");
            this.initializeTensorFlowModel();
        }

        tf.ready().then(() => {
            console.log('TensorFlow.js backend initialized:', tf.getBackend());
        });
    }

    /**
     * Initializes the TensorFlow model.
     */
    private async initializeTensorFlowModel() {
        try {
            await tf.ready();

            // For some reason await use.load() is throwing error
            use.load()
                .then(tfModel => this.tfModel = tfModel)
                .catch(reason => console.error("failed to load tensorflow embedding model", reason))
            console.info("⚙️ TensorFlow Universal Sentence Encoder model loaded.");
        } catch (error) {
            console.error("❌ Failed to load TensorFlow model:", error);
        }
    }

    /**
     * Generates an embedding for the given text.
     * @param text - The text to embed.
     * @returns The embedding vector.
     */
    async getEmbedding(text: string): Promise<number[]> {
        if (this.openAIEmbedder) {
            // Generate embeddings using OpenAI
            return this.openAIEmbedder.embedQuery(text);
        }

        // Fallback to TensorFlow embeddings
        if (!this.tfModel) {
            throw new Error("TensorFlow model not initialized. Please wait..");
        }

        const embeddings = await this.tfModel.embed([text]);
        const embeddingArray = embeddings.arraySync() as number[][];
        return embeddingArray[0];
    }

    /**
     * Summarizes the given context.
     * @param context - The text to summarize.
     * @returns The summarized text.
     */
    async summarize(context: string): Promise<string> {
        if (!this.openAILLM) {
            console.warn("⚠️ OpenAI LLM not available. Falling back to simple truncation.");
            return context.length > 1000 ? context.slice(0, 1000) + '...' : context;
        }

        // Split context into chunks if it's too long
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 2000,
            chunkOverlap: 200,
        });

        const chunks = await textSplitter.splitText(context);
        try {
            const summaries = await Promise.all(
                chunks.map(async (chunk) => {
                    const prompt = new PromptTemplate({
                        inputVariables: ["context"],
                        template: `Summarize the following context:\n\n{context}\n\nSummary:`,
                    });
                    const formattedPrompt = await prompt.format({ context: chunk });
                    const summary = await this.openAILLM?.invoke(formattedPrompt);
                    return summary || '';
                })
            );

            const combinedSummary = summaries.join(' ');
            return combinedSummary.length > 3000 ? combinedSummary.slice(0, 3000) + '...' : combinedSummary;
        } catch (error: any) {
            return context.length > 1000 ? context.slice(0, 1000) + '...' : context;
        }
    }

    /**
     * Joins the content of a list of documents into a single string.
     * 
     * @param documents - An array of Document objects.
     * @param separator - A string used to separate each document's content. Default is a newline character.
     * @returns A single string containing the joined content of all documents.
     */
    joinDocumentContents(documents: Document[], separator: string = "\n"): string {
        return documents.map(doc => doc.content).join(separator);
    }
}
