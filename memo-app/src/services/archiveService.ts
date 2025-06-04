import type { Memo } from '../types/Memo';

export interface ArchivedMemo extends Memo {
  archivedAt: Date;
  originalId: number;
}

export interface DeletedMemo extends Memo {
  deletedAt: Date;
  originalId: number;
}

export class ArchiveService {
  private static ARCHIVE_KEY = 'memos_archive';
  private static TRASH_KEY = 'memos_trash';
  private static TRASH_RETENTION_DAYS = 30;

  // Archive a memo
  static archiveMemo(memo: Memo): void {
    const archived = this.getArchivedMemos();
    const archivedMemo: ArchivedMemo = {
      ...memo,
      originalId: memo.id,
      id: Date.now() + Math.random(),
      archivedAt: new Date()
    };
    archived.push(archivedMemo);
    localStorage.setItem(this.ARCHIVE_KEY, JSON.stringify(archived));
  }

  // Get all archived memos
  static getArchivedMemos(): ArchivedMemo[] {
    const archived = localStorage.getItem(this.ARCHIVE_KEY);
    if (!archived) return [];
    
    return JSON.parse(archived).map((memo: any) => ({
      ...memo,
      createdAt: new Date(memo.createdAt),
      updatedAt: new Date(memo.updatedAt),
      archivedAt: new Date(memo.archivedAt)
    }));
  }

  // Restore archived memo
  static restoreFromArchive(archivedMemoId: number): Memo | null {
    const archived = this.getArchivedMemos();
    const memoIndex = archived.findIndex(m => m.id === archivedMemoId);
    
    if (memoIndex === -1) return null;
    
    const [archivedMemo] = archived.splice(memoIndex, 1);
    localStorage.setItem(this.ARCHIVE_KEY, JSON.stringify(archived));
    
    const { archivedAt, originalId, ...memo } = archivedMemo;
    return {
      ...memo,
      id: Date.now() + Math.random() // Generate new ID
    };
  }

  // Move to trash
  static moveToTrash(memo: Memo): void {
    const trash = this.getTrashMemos();
    const deletedMemo: DeletedMemo = {
      ...memo,
      originalId: memo.id,
      id: Date.now() + Math.random(),
      deletedAt: new Date()
    };
    trash.push(deletedMemo);
    localStorage.setItem(this.TRASH_KEY, JSON.stringify(trash));
    this.cleanupOldTrash();
  }

  // Get all trash memos
  static getTrashMemos(): DeletedMemo[] {
    const trash = localStorage.getItem(this.TRASH_KEY);
    if (!trash) return [];
    
    return JSON.parse(trash).map((memo: any) => ({
      ...memo,
      createdAt: new Date(memo.createdAt),
      updatedAt: new Date(memo.updatedAt),
      deletedAt: new Date(memo.deletedAt)
    }));
  }

  // Restore from trash
  static restoreFromTrash(trashedMemoId: number): Memo | null {
    const trash = this.getTrashMemos();
    const memoIndex = trash.findIndex(m => m.id === trashedMemoId);
    
    if (memoIndex === -1) return null;
    
    const [trashedMemo] = trash.splice(memoIndex, 1);
    localStorage.setItem(this.TRASH_KEY, JSON.stringify(trash));
    
    const { deletedAt, originalId, ...memo } = trashedMemo;
    return {
      ...memo,
      id: Date.now() + Math.random() // Generate new ID
    };
  }

  // Permanently delete from trash
  static deleteFromTrash(trashedMemoId: number): void {
    const trash = this.getTrashMemos();
    const filtered = trash.filter(m => m.id !== trashedMemoId);
    localStorage.setItem(this.TRASH_KEY, JSON.stringify(filtered));
  }

  // Empty trash
  static emptyTrash(): void {
    localStorage.setItem(this.TRASH_KEY, JSON.stringify([]));
  }

  // Clean up old trash items
  private static cleanupOldTrash(): void {
    const trash = this.getTrashMemos();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.TRASH_RETENTION_DAYS);
    
    const filtered = trash.filter(memo => 
      new Date(memo.deletedAt) > cutoffDate
    );
    
    localStorage.setItem(this.TRASH_KEY, JSON.stringify(filtered));
  }
}