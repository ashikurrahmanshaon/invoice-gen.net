'use strict';

export interface ParsedInvoice {
  clientName: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  dueDateDays?: number;
  taxRate: number;
  discountAmount: number;
  notes?: string;
}

export const aiService = {
  async parseTextToInvoice(text: string): Promise<ParsedInvoice> {
    try {
      // First check if Gemini API endpoint is active/available
      const response = await fetch('/api/ai/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.result) {
          return data.result;
        }
      }
    } catch (err) {
      console.warn('AI API endpoint failed, falling back to local heuristic parser.', err);
    }

    // Heuristic Fallback Parser
    return this.parseHeuristically(text);
  },

  parseHeuristically(text: string): ParsedInvoice {
    const lines = text.split('\n');
    const result: ParsedInvoice = {
      clientName: '',
      items: [],
      taxRate: 0,
      discountAmount: 0,
      notes: 'Generated via AI Text-To-Invoice Assistant.',
    };

    // 1. Client extraction
    // Look for patterns like "bill Google", "invoice Stripe", "to Acme Corp", "for Netflix"
    const clientRegexes = [
      /bill\s+([a-zA-Z0-9\s.,&]+?)(?:\s+for|\s+on|\s+due|\s*[:,\n]|$)/i,
      /invoice\s+([a-zA-Z0-9\s.,&]+?)(?:\s+for|\s+on|\s+due|\s*[:,\n]|$)/i,
      /client\s*(?:is|:)\s*([a-zA-Z0-9\s.,&]+?)(?:\s+for|\s+on|\s+due|\s*[:,\n]|$)/i,
      /to\s+([a-zA-Z0-9\s.,&]+?)(?:\s+for|\s+on|\s+due|\s*[:,\n]|$)/i,
      /for\s+([a-zA-Z0-9\s.,&]+?)(?:\s+on|\s+due|\s*[:,\n]|$)/i,
    ];

    for (const regex of clientRegexes) {
      const match = text.match(regex);
      if (match && match[1]) {
        const name = match[1].trim();
        // Exclude common words
        if (!['hours', 'consulting', 'design', 'development', 'contract'].includes(name.toLowerCase())) {
          result.clientName = name;
          break;
        }
      }
    }

    if (!result.clientName) {
      result.clientName = 'Draft Client';
    }

    // 2. Tax extraction
    // Look for "tax 10%", "8.25% tax", "tax is 5%"
    const taxMatch = text.match(/tax(?:es|is)?\s*(?:of|:)?\s*(\d+(?:\.\d+)?)\s*%/i) ||
                     text.match(/(\d+(?:\.\d+)?)\s*%\s*tax/i);
    if (taxMatch && taxMatch[1]) {
      result.taxRate = parseFloat(taxMatch[1]);
    }

    // 3. Discount extraction
    // Look for "discount $50", "discount of 100", "50 discount"
    const discountMatch = text.match(/discount\s*(?:of|:)?\s*(?:\$)?\s*(\d+(?:\.\d+)?)/i) ||
                          text.match(/(\d+(?:\.\d+)?)\s*(?:\$)?\s*discount/i);
    if (discountMatch && discountMatch[1]) {
      result.discountAmount = parseFloat(discountMatch[1]);
    }

    // 4. Due Date extraction
    // Look for "due in 14 days", "due in 2 weeks", "due next week"
    if (/due\s+in\s+(\d+)\s+days?/i.test(text)) {
      const daysMatch = text.match(/due\s+in\s+(\d+)\s+days?/i);
      if (daysMatch && daysMatch[1]) result.dueDateDays = parseInt(daysMatch[1], 10);
    } else if (/due\s+in\s+(\d+)\s+weeks?/i.test(text)) {
      const weeksMatch = text.match(/due\s+in\s+(\d+)\s+weeks?/i);
      if (weeksMatch && weeksMatch[1]) result.dueDateDays = parseInt(weeksMatch[1], 10) * 7;
    } else if (/due\s+next\s+week/i.test(text)) {
      result.dueDateDays = 7;
    } else {
      result.dueDateDays = 30; // default
    }

    // 5. Items extraction
    // Look for patterns like "5 hours of design at $100/hr", "2 widgets for $500 each", "Consulting service for $1500"
    // Also parse line-by-line for listings
    const itemPattern = /(\d+)?\s*(?:qty|hours?|x)?\s*(?:of)?\s*([a-zA-Z0-9\s\-._&()]+?)\s*(?:at|for|@)?\s*(?:\$)?\s*(\d+(?:\.\d+)?)(?:\/hr|\s+each|\s+per\s+unit|\s*[:,\n]|$)/i;

    lines.forEach((line) => {
      // Clean line
      const cleanLine = line.trim();
      if (!cleanLine || cleanLine.toLowerCase().includes('invoice') || cleanLine.toLowerCase().includes('client') || cleanLine.toLowerCase().includes('due')) {
        return;
      }

      const match = cleanLine.match(itemPattern);
      if (match) {
        const qtyStr = match[1];
        const desc = match[2].trim();
        const priceStr = match[3];

        if (desc && priceStr && !['tax', 'discount'].includes(desc.toLowerCase())) {
          const quantity = qtyStr ? parseInt(qtyStr, 10) : 1;
          const unitPrice = parseFloat(priceStr);
          if (!isNaN(quantity) && !isNaN(unitPrice)) {
            result.items.push({
              description: desc,
              quantity,
              unitPrice,
            });
          }
        }
      }
    });

    // If no items were parsed, construct a generic item if there's any money mention
    if (result.items.length === 0) {
      const moneyMatch = text.match(/(?:\$)\s*(\d+(?:\.\d+)?)/);
      if (moneyMatch && moneyMatch[1]) {
        result.items.push({
          description: 'Consulting Services',
          quantity: 1,
          unitPrice: parseFloat(moneyMatch[1]),
        });
      } else {
        result.items.push({
          description: 'Standard Service Item',
          quantity: 1,
          unitPrice: 100,
        });
      }
    }

    return result;
  },
};
