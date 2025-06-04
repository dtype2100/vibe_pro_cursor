import type { Memo } from '../types/Memo';

export class PrintService {
  // Print a single memo
  static printMemo(memo: Memo): void {
    const printContent = this.generateSingleMemoHTML(memo);
    this.openPrintWindow(printContent, `메모: ${memo.title}`);
  }

  // Print multiple memos
  static printMemos(memos: Memo[]): void {
    const printContent = this.generateMultipleMemosHTML(memos);
    this.openPrintWindow(printContent, `메모 목록 (${memos.length}개)`);
  }

  // Print selected memos
  static printSelectedMemos(memos: Memo[], selectedIds: number[]): void {
    const selectedMemos = memos.filter(memo => selectedIds.includes(memo.id));
    this.printMemos(selectedMemos);
  }

  // Generate HTML for a single memo
  private static generateSingleMemoHTML(memo: Memo): string {
    const categoryName = this.getCategoryDisplayName(memo.category);
    const tags = memo.tags ? memo.tags.map(tag => `#${tag}`).join(' ') : '';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>메모: ${memo.title}</title>
        <style>
          ${this.getPrintStyles()}
        </style>
      </head>
      <body>
        <div class="memo-container">
          <div class="memo-header">
            <h1 class="memo-title">${memo.title}</h1>
            <div class="memo-meta">
              ${memo.isPinned ? '<span class="pinned-badge">📌 고정됨</span>' : ''}
              ${memo.category ? `<span class="category-badge">${categoryName}</span>` : ''}
            </div>
          </div>
          
          <div class="memo-content">
            ${this.formatContent(memo.content)}
          </div>
          
          ${tags ? `<div class="memo-tags">${tags}</div>` : ''}
          
          <div class="memo-footer">
            <div class="memo-dates">
              <div>생성일: ${new Date(memo.createdAt).toLocaleString('ko-KR')}</div>
              <div>수정일: ${new Date(memo.updatedAt).toLocaleString('ko-KR')}</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate HTML for multiple memos
  private static generateMultipleMemosHTML(memos: Memo[]): string {
    const memosHTML = memos.map(memo => {
      const categoryName = this.getCategoryDisplayName(memo.category);
      const tags = memo.tags ? memo.tags.map(tag => `#${tag}`).join(' ') : '';
      
      return `
        <div class="memo-item">
          <div class="memo-header">
            <h2 class="memo-title">${memo.title}</h2>
            <div class="memo-meta">
              ${memo.isPinned ? '<span class="pinned-badge">📌</span>' : ''}
              ${memo.category ? `<span class="category-badge">${categoryName}</span>` : ''}
              <span class="memo-date">${new Date(memo.updatedAt).toLocaleDateString('ko-KR')}</span>
            </div>
          </div>
          
          <div class="memo-content">
            ${this.formatContent(memo.content)}
          </div>
          
          ${tags ? `<div class="memo-tags">${tags}</div>` : ''}
        </div>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>메모 목록 (${memos.length}개)</title>
        <style>
          ${this.getPrintStyles()}
        </style>
      </head>
      <body>
        <div class="memo-list-container">
          <div class="list-header">
            <h1>메모 목록</h1>
            <div class="list-meta">
              총 ${memos.length}개의 메모 | 출력일: ${new Date().toLocaleString('ko-KR')}
            </div>
          </div>
          
          <div class="memo-list">
            ${memosHTML}
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Format memo content for printing
  private static formatContent(content: string): string {
    // Convert line breaks to HTML
    return content
      .replace(/\n/g, '<br>')
      .replace(/## (.+)/g, '<h3>$1</h3>')
      .replace(/### (.+)/g, '<h4>$1</h4>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/- (.+)/g, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  }

  // Get category display name
  private static getCategoryDisplayName(category?: string): string {
    switch (category) {
      case 'personal': return '개인';
      case 'work': return '업무';
      case 'ideas': return '아이디어';
      case 'todo': return '할 일';
      case 'other': return '기타';
      default: return '';
    }
  }

  // Get print-specific CSS styles
  private static getPrintStyles(): string {
    return `
      @media print {
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          font-size: 12pt;
          line-height: 1.6;
          color: #000;
          margin: 0;
          padding: 20px;
        }
        
        .memo-container, .memo-list-container {
          max-width: 100%;
        }
        
        .memo-header {
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        
        .memo-title {
          margin: 0 0 10px 0;
          font-size: 18pt;
          font-weight: bold;
        }
        
        .memo-meta {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        
        .pinned-badge {
          background: #f0f0f0;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10pt;
        }
        
        .category-badge {
          background: #e0e0e0;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10pt;
        }
        
        .memo-content {
          margin: 20px 0;
          white-space: pre-wrap;
        }
        
        .memo-content h3 {
          font-size: 14pt;
          margin: 15px 0 5px 0;
        }
        
        .memo-content h4 {
          font-size: 12pt;
          margin: 10px 0 5px 0;
        }
        
        .memo-content ul {
          margin: 10px 0;
          padding-left: 20px;
        }
        
        .memo-tags {
          margin-top: 15px;
          font-size: 10pt;
          color: #666;
        }
        
        .memo-footer {
          margin-top: 20px;
          padding-top: 10px;
          border-top: 1px solid #ccc;
          font-size: 10pt;
          color: #666;
        }
        
        .memo-dates div {
          margin: 2px 0;
        }
        
        /* Multiple memos styles */
        .list-header {
          border-bottom: 3px solid #000;
          padding-bottom: 15px;
          margin-bottom: 30px;
        }
        
        .list-header h1 {
          margin: 0 0 10px 0;
          font-size: 24pt;
        }
        
        .list-meta {
          font-size: 12pt;
          color: #666;
        }
        
        .memo-item {
          break-inside: avoid;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #ddd;
        }
        
        .memo-item:last-child {
          border-bottom: none;
        }
        
        .memo-item .memo-title {
          font-size: 16pt;
        }
        
        .memo-date {
          font-size: 10pt;
          color: #666;
        }
      }
      
      @page {
        margin: 2cm;
        size: A4;
      }
    `;
  }

  // Open print window
  private static openPrintWindow(content: string, title: string): void {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.focus();
      
      // Wait for content to load then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      };
    }
  }
}