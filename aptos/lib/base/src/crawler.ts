import axios from 'axios';
import * as cheerio from 'cheerio';
import pdfParse from 'pdf-parse';
import * as fs from 'fs';
import * as path from 'path';
import { URL } from 'url';

/**
 * A class for crawling text content from web pages and PDF documents with support for recursive crawling.
 */
export class WebCrawler {
    private pdfDownloadPath: string = './tmp/crawler/downloaded.pdf';
    private visitedUrls: Set<string> = new Set();
    private baseUrl: string = '';
    private urlPattern: string = '';

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
     * Crawls a given URL and recursively crawls all related URLs under the same pattern.
     * 
     * @param mainUrl - The main URL pattern to crawl (e.g., "https://aptos.dev/en/build")
     * @param maxDepth - Maximum depth for recursive crawling (default: 3)
     * @returns A promise that resolves with an array of {url, content} objects.
     */
    async crawlRecursively(mainUrl: string, maxDepth: number = 3): Promise<Array<{ url: string, content: string }>> {
        this.visitedUrls.clear();

        try {
            // Extract base URL and pattern
            const urlObj = new URL(mainUrl);
            this.baseUrl = `${urlObj.protocol}//${urlObj.hostname}`;
            this.urlPattern = mainUrl;

            console.info(`Starting recursive crawl from: ${mainUrl}`);
            console.info(`Base URL: ${this.baseUrl}`);
            console.info(`URL Pattern: ${this.urlPattern}`);

            const results: Array<{ url: string, content: string }> = [];
            await this.crawlUrl(mainUrl, 0, maxDepth, results);

            console.info(`Crawling complete. Processed ${results.length} URLs.`);
            return results;
        } catch (error) {
            throw new Error(`Failed to recursively crawl URL: ${mainUrl}. Error: ${(error as Error).message}`);
        }
    }

    /**
     * Helper method to crawl a single URL and discover links for recursive crawling.
     */
    private async crawlUrl(
        url: string,
        currentDepth: number,
        maxDepth: number,
        results: Array<{ url: string, content: string }>
    ): Promise<void> {
        // Skip if already visited or if URL doesn't match the pattern
        if (this.visitedUrls.has(url) || !this.shouldCrawl(url)) {
            return;
        }

        this.visitedUrls.add(url);
        console.info(`Crawling (depth ${currentDepth}): ${url}`);

        try {
            // Extract content from the current URL
            const content = await this.crawl(url);
            results.push({ url, content });

            // Stop recursion if max depth reached
            if (currentDepth >= maxDepth) {
                return;
            }

            // Discover and crawl linked URLs
            const linkedUrls = await this.discoverLinkedUrls(url);
            console.info(`Found ${linkedUrls.length} linked URLs from ${url}`);

            // Recursively crawl discovered URLs
            for (const linkedUrl of linkedUrls) {
                await this.crawlUrl(linkedUrl, currentDepth + 1, maxDepth, results);
            }
        } catch (error) {
            console.warn(`Failed to crawl ${url}: ${(error as Error).message}`);
        }
    }

    /**
     * Discovers linked URLs from a webpage that match the crawling pattern.
     */
    /**
     * Determines if a URL should be crawled based on the pattern.
     */

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
            console.log("fileExtension>>>>>>>>>>.", fileExtension)

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

            // Remove script and style elements
            $('script, style, nav, header, footer').remove();

            // Focus on main content areas
            let contentSelector = 'main, article, .content, #content, .main-content';
            let textContent = $(contentSelector).text();

            // If no content found with specific selectors, use body
            if (!textContent.trim()) {
                textContent = $('body').text();
            }

            const cleanedText = textContent
                .replace(/\s+/g, ' ')
                .replace(/\n\s*\n/g, '\n\n')
                .trim();

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

    resetCrawlerState(): void {
        this.visitedUrls.clear();
        this.baseUrl = '';
        this.urlPattern = '';
        console.info('Crawler state has been reset');
    }
    /**
 * Discovers linked URLs from a webpage that match the crawling pattern.
 * Enhanced to handle various HTML structures and link types.
 */
    private async discoverLinkedUrls(url: string): Promise<string[]> {
        try {
            const response = await axios.get(url);
            const $ = cheerio.load(response.data);
            const discoveredUrls: string[] = [];

            // Debug: Log page title to verify content is loaded
            console.info(`Page title: "${$('title').text()}"`);

            // Debug: Count all links on the page
            const allLinks = $('a[href]');
            console.info(`Total links found on page: ${allLinks.length}`);

            // Try multiple selector strategies to find links
            $('a[href]').each((_, element) => {
                let href = $(element).attr('href');
                if (!href) return;

                // Log the first few links for debugging
                if (discoveredUrls.length < 3) {
                    console.info(`Raw link found: ${href}`);
                }

                // Clean the href (remove fragments, query params if needed)
                href = href.split('#')[0]; // Remove fragment

                // Handle relative URLs of different types
                if (href.startsWith('/')) {
                    // Absolute path relative to domain
                    href = `${this.baseUrl}${href}`;
                } else if (!href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
                    // Relative to current path
                    const baseUrlPath = new URL(url).pathname;
                    // Get the directory part of the current path
                    const currentDir = baseUrlPath.substring(0, baseUrlPath.lastIndexOf('/') + 1);
                    href = `${this.baseUrl}${currentDir}${href}`;
                }

                // Skip non-http links and external domains
                if (!href.startsWith('http')) return;
                if (!href.startsWith(this.baseUrl)) return;

                // Only include URLs that match our pattern
                if (this.shouldCrawl(href) && !this.visitedUrls.has(href)) {
                    discoveredUrls.push(href);
                }
            });

            // Debug: Report on matching links
            console.info(`Found ${discoveredUrls.length} links matching pattern: ${this.urlPattern}`);

            return Array.from(new Set(discoveredUrls)); // Remove duplicates
        } catch (error) {
            console.warn(`Error discovering links from ${url}: ${(error as Error).message}`);
            return [];
        }
    }

    /**
     * Determines if a URL should be crawled based on the pattern.
     * Improved to handle various pattern formats.
     */
    private shouldCrawl(url: string): boolean {
        try {
            // Normalize URLs for comparison
            const normalizedUrl = url.endsWith('/') ? url : `${url}/`;
            const normalizedPattern = this.urlPattern.endsWith('/') ?
                this.urlPattern : `${this.urlPattern}/`;

            // Debug the pattern matching
            if (url.includes('/en/')) {
                console.debug(`Checking URL: ${url} against pattern: ${this.urlPattern}`);
            }

            // Check if URL starts with the pattern (for wildcard patterns)
            if (this.urlPattern.endsWith('*')) {
                const basePattern = this.urlPattern.slice(0, -1);
                const match = url.startsWith(basePattern);
                if (match && url.includes('/en/')) {
                    console.debug(`URL ${url} MATCHES pattern ${basePattern}*`);
                }
                return match;
            }

            // For exact path matching (non-wildcard)
            // Also match if the URL is the pattern plus a trailing slash
            const exactMatch = url === this.urlPattern || normalizedUrl === normalizedPattern;
            if (exactMatch && url.includes('/en/')) {
                console.debug(`URL ${url} EXACT MATCHES pattern ${this.urlPattern}`);
            }
            return exactMatch;
        } catch (e) {
            console.warn(`Error in shouldCrawl: ${(e as Error).message}`);
            return false;
        }
    }

}