import axios from 'axios';
import * as cheerio from 'cheerio';
import pdfParse from 'pdf-parse';
import * as fs from 'fs';
import * as path from 'path';

/**
 * A class for crawling text content from web pages and PDF documents.
 */
export class WebCrawler {
    private pdfDownloadPath: string = './tmp/crawler/downloaded.pdf';

    constructor() {
        this.ensureDirectoryExists(path.dirname(this.pdfDownloadPath));
    }

    // Helper method to ensure the directory exists
    private ensureDirectoryExists(dirPath: string): void {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            console.info(`Directory created: ${dirPath}`);
        } else {
            console.info(`Directory already exists: ${dirPath}`);
        }
    }

    /**
     * Crawls a given URL and returns its text content.
     * - If the URL points to a PDF, it downloads and extracts text from it.
     * - If the URL points to a Markdown file, it fetches and returns its content.
     * - Otherwise, it treats the URL as a webpage and extracts text accordingly.
     * 
     * @param url - The URL to crawl.
     * @returns A promise that resolves with the extracted text.
     * @throws Will throw an error if the crawling process fails.
     */
    async crawl(url: string): Promise<string> {
        try {
            const fileExtension = path.extname(url).toLowerCase();

            if (fileExtension === '.pdf') {
                // Handle PDF file
                await this.downloadPDF(url);
                return await this.extractTextFromPDF();
            } else if (fileExtension === '.md') {
                // Handle Markdown file
                return await this.extractTextFromMarkdown(url);
            } else {
                // Handle webpage
                return await this.extractTextFromWebpage(url);
            }
        } catch (error) {
            throw new Error(`Failed to crawl URL: ${url}. Error: ${(error as Error).message}`);
        }
    }

    /**
     * Extracts text content from a webpage.
     * 
     * @param url - The URL of the webpage to extract text from.
     * @returns A promise that resolves with the extracted text.
     * @throws Will throw an error if the request fails or the content cannot be parsed.
     */
    private async extractTextFromWebpage(url: string): Promise<string> {
        try {
            const response = await axios.get(url);
            const $ = cheerio.load(response.data);
            const textContent = $('body').text();
            const cleanedText = textContent.replace(/\s+/g, ' ').trim();

            if (!cleanedText) {
                throw new Error('No text content found on the webpage.');
            }

            return cleanedText;
        } catch (error) {
            throw new Error(`Failed to extract text from webpage: ${url}. Error: ${(error as Error).message}`);
        }
    }

    /**
     * Downloads a PDF file from a given URL.
     * 
     * @param url - The URL of the PDF file to download.
     * @throws Will throw an error if the download fails.
     */
    private async downloadPDF(url: string): Promise<void> {
        try {
            const response = await axios.get(url, { responseType: 'arraybuffer' });

            if (response.status !== 200) {
                throw new Error(`Failed to download PDF. HTTP status: ${response.status}`);
            }

            fs.writeFileSync(this.pdfDownloadPath, response.data);
            console.log('PDF downloaded successfully!');
        } catch (error) {
            throw new Error(`Failed to download PDF from URL: ${url}. Error: ${(error as Error).message}`);
        }
    }

    /**
     * Extracts text content from a downloaded PDF file.
     * 
     * @returns A promise that resolves with the extracted text.
     * @throws Will throw an error if the PDF cannot be read or parsed.
     */
    private async extractTextFromPDF(): Promise<string> {
        try {
            if (!fs.existsSync(this.pdfDownloadPath)) {
                throw new Error(`PDF file not found at path: ${this.pdfDownloadPath}`);
            }

            const dataBuffer = fs.readFileSync(this.pdfDownloadPath);
            const data = await pdfParse(dataBuffer);

            if (!data.text) {
                throw new Error('No text could be extracted from the PDF.');
            }

            return data.text;
        } catch (error) {
            throw new Error(`Failed to extract text from PDF. Error: ${(error as Error).message}`);
        }
    }

    /**
     * Extracts text content from a Markdown (.md) file.
     * 
     * @param url - The URL of the Markdown file.
     * @returns A promise that resolves with the extracted text.
     * @throws Will throw an error if the request fails.
     */
    private async extractTextFromMarkdown(url: string): Promise<string> {
        try {
            const response = await axios.get(url);

            if (response.status !== 200) {
                throw new Error(`Failed to fetch Markdown file. HTTP status: ${response.status}`);
            }

            const markdownContent = response.data;

            if (!markdownContent) {
                throw new Error('No content found in the Markdown file.');
            }

            // Markdown files are plain text, so return content directly
            return markdownContent;
        } catch (error) {
            throw new Error(`Failed to extract text from Markdown file: ${url}. Error: ${(error as Error).message}`);
        }
    }
}
