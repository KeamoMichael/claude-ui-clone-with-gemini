import { SearchResult } from '../types';

// @ts-ignore - Vite env variables
const GOOGLE_SEARCH_API_KEY = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY;
// @ts-ignore - Vite env variables
const GOOGLE_SEARCH_ENGINE_ID = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID;

/**
 * Performs a web search using Google Custom Search API
 */
export const performWebSearch = async (query: string): Promise<SearchResult[]> => {
    if (!GOOGLE_SEARCH_API_KEY || !GOOGLE_SEARCH_ENGINE_ID) {
        console.warn('Google Search API credentials not configured');
        // Return mock results for development
        return getMockSearchResults(query);
    }

    try {
        const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_SEARCH_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Search API error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            return [];
        }

        return data.items.slice(0, 10).map((item: any, index: number) => ({
            id: `search-${Date.now()}-${index}`,
            title: item.title,
            url: item.link,
            snippet: item.snippet,
            displayUrl: new URL(item.link).hostname
        }));
    } catch (error) {
        console.error('Web search failed:', error);
        // Fallback to mock results on error
        return getMockSearchResults(query);
    }
};

/**
 * Fetches content from a URL (with CORS handling)
 */
export const fetchUrlContent = async (url: string): Promise<{ content: string; title: string }> => {
    try {
        // For development, we'll use a CORS proxy or return mock content
        // In production, you'd want a backend endpoint to fetch this
        const corsProxy = 'https://api.allorigins.win/get?url=';
        const response = await fetch(corsProxy + encodeURIComponent(url));

        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.status}`);
        }

        const data = await response.json();
        const htmlContent = data.contents;

        // Extract title from HTML
        const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1] : new URL(url).hostname;

        // Strip HTML tags for simple text extraction
        const textContent = htmlContent
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 5000); // Limit content length

        return {
            title,
            content: textContent
        };
    } catch (error) {
        console.error('Failed to fetch URL content:', error);
        throw error;
    }
};

/**
 * Mock search results for development/fallback
 */
const getMockSearchResults = (query: string): SearchResult[] => {
    const mockResults: SearchResult[] = [
        {
            id: 'mock-1',
            title: `${query} - Documentation`,
            url: 'https://example.com/docs',
            snippet: `Official documentation for ${query}. Learn how to integrate and use ${query} in your projects.`,
            displayUrl: 'example.com'
        },
        {
            id: 'mock-2',
            title: `Getting Started with ${query}`,
            url: 'https://example.com/getting-started',
            snippet: `A comprehensive guide to getting started with ${query}. Includes installation, setup, and basic usage examples.`,
            displayUrl: 'example.com'
        },
        {
            id: 'mock-3',
            title: `${query} API Reference`,
            url: 'https://example.com/api',
            snippet: `Complete API reference for ${query}. Detailed documentation of all available methods and properties.`,
            displayUrl: 'example.com'
        }
    ];

    return mockResults;
};

/**
 * Determines if a query should trigger web search
 */
export const shouldPerformWebSearch = (query: string): boolean => {
    const webSearchKeywords = [
        'search', 'find', 'look up', 'documentation', 'docs', 'how to',
        'what is', 'access', 'go through', 'visit', 'check', 'browse',
        'latest', 'current', 'news', 'recent', 'today', 'website'
    ];

    const lowerQuery = query.toLowerCase();
    return webSearchKeywords.some(keyword => lowerQuery.includes(keyword));
};
