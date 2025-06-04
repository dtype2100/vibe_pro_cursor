import type { Memo } from '../types/Memo';

export class ExportImportService {
  // Export memos to JSON
  static exportToJSON(memos: Memo[]): void {
    const dataStr = JSON.stringify(memos, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `memos_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Export memos to CSV
  static exportToCSV(memos: Memo[]): void {
    const headers = ['ID', 'Title', 'Content', 'Category', 'Tags', 'Pinned', 'Created At', 'Updated At'];
    const csvContent = [
      headers.join(','),
      ...memos.map(memo => [
        memo.id,
        `"${memo.title.replace(/"/g, '""')}"`,
        `"${memo.content.replace(/"/g, '""')}"`,
        memo.category || '',
        `"${(memo.tags || []).join(', ')}"`,
        memo.isPinned ? 'Yes' : 'No',
        new Date(memo.createdAt).toISOString(),
        new Date(memo.updatedAt).toISOString()
      ].join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `memos_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Import memos from JSON file
  static async importFromJSON(file: File): Promise<Memo[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const memos = JSON.parse(content);
          
          // Validate and transform imported data
          const validatedMemos = memos.map((memo: any) => ({
            ...memo,
            id: Date.now() + Math.random(), // Generate new IDs to avoid conflicts
            createdAt: new Date(memo.createdAt),
            updatedAt: new Date(memo.updatedAt)
          }));
          
          resolve(validatedMemos);
        } catch (error) {
          reject(new Error('Invalid JSON file format'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  // Export selected memos
  static exportSelected(memos: Memo[], selectedIds: number[], format: 'json' | 'csv'): void {
    const selectedMemos = memos.filter(memo => selectedIds.includes(memo.id));
    if (format === 'json') {
      this.exportToJSON(selectedMemos);
    } else {
      this.exportToCSV(selectedMemos);
    }
  }
}