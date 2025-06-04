export class SearchHighlightService {
  // Highlight search terms in text
  static highlightText(text: string, searchTerm: string): string {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${this.escapeRegExp(searchTerm)})`, 'gi');
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
  }

  // Create highlighted HTML element
  static createHighlightedElement(text: string, searchTerm: string): HTMLElement {
    const element = document.createElement('span');
    element.innerHTML = this.highlightText(text, searchTerm);
    return element;
  }

  // Count occurrences of search term
  static countOccurrences(text: string, searchTerm: string): number {
    if (!searchTerm.trim()) return 0;
    
    const regex = new RegExp(this.escapeRegExp(searchTerm), 'gi');
    const matches = text.match(regex);
    return matches ? matches.length : 0;
  }

  // Get text preview with highlighted search term
  static getSearchPreview(text: string, searchTerm: string, maxLength: number = 150): string {
    if (!searchTerm.trim()) {
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    const regex = new RegExp(this.escapeRegExp(searchTerm), 'gi');
    const match = text.search(regex);
    
    if (match === -1) {
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    // Find the best position to show the match
    const start = Math.max(0, match - Math.floor(maxLength / 2));
    const end = Math.min(text.length, start + maxLength);
    
    let preview = text.substring(start, end);
    
    // Add ellipsis if needed
    if (start > 0) preview = '...' + preview;
    if (end < text.length) preview = preview + '...';
    
    return this.highlightText(preview, searchTerm);
  }

  // Extract search suggestions from text
  static extractSuggestions(texts: string[], minLength: number = 3): string[] {
    const words = new Set<string>();
    
    texts.forEach(text => {
      const textWords = text
        .toLowerCase()
        .replace(/[^\w\s가-힣]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length >= minLength);
      
      textWords.forEach(word => words.add(word));
    });
    
    return Array.from(words).sort().slice(0, 50); // Limit to 50 suggestions
  }

  // Check if text matches search criteria
  static matchesSearch(text: string, searchTerm: string): boolean {
    if (!searchTerm.trim()) return true;
    
    return text.toLowerCase().includes(searchTerm.toLowerCase());
  }

  // Advanced search with multiple terms
  static matchesAdvancedSearch(text: string, searchTerms: string[]): boolean {
    if (searchTerms.length === 0) return true;
    
    const lowerText = text.toLowerCase();
    return searchTerms.every(term => 
      lowerText.includes(term.toLowerCase())
    );
  }

  // Escape special regex characters
  private static escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Parse search query for advanced features
  static parseSearchQuery(query: string): {
    terms: string[];
    exact: string[];
    exclude: string[];
  } {
    const terms: string[] = [];
    const exact: string[] = [];
    const exclude: string[] = [];
    
    // Match quoted strings for exact search
    const exactMatches = query.match(/"([^"]+)"/g);
    if (exactMatches) {
      exactMatches.forEach(match => {
        exact.push(match.slice(1, -1)); // Remove quotes
        query = query.replace(match, '');
      });
    }
    
    // Match excluded terms (starting with -)
    const excludeMatches = query.match(/-\w+/g);
    if (excludeMatches) {
      excludeMatches.forEach(match => {
        exclude.push(match.slice(1)); // Remove -
        query = query.replace(match, '');
      });
    }
    
    // Remaining terms
    const remainingTerms = query.split(/\s+/).filter(term => term.trim());
    terms.push(...remainingTerms);
    
    return { terms, exact, exclude };
  }
}