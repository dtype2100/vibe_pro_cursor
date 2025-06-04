import type { Memo } from '../types/Memo';

export interface SharedMemo {
  id: string;
  memo: Memo;
  sharedAt: Date;
  expiresAt?: Date;
  accessCount: number;
  isPublic: boolean;
}

export class ShareService {
  private static SHARED_MEMOS_KEY = 'shared_memos';

  // Generate a shareable URL for a memo
  static generateShareableURL(memo: Memo, expirationDays?: number): string {
    const shareId = this.generateShareId();
    const sharedMemo: SharedMemo = {
      id: shareId,
      memo: { ...memo },
      sharedAt: new Date(),
      expiresAt: expirationDays ? new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000) : undefined,
      accessCount: 0,
      isPublic: true
    };

    this.saveSharedMemo(sharedMemo);
    return `${window.location.origin}${window.location.pathname}#/share/${shareId}`;
  }

  // Get shared memo by ID
  static getSharedMemo(shareId: string): SharedMemo | null {
    const sharedMemos = this.getSharedMemos();
    const sharedMemo = sharedMemos.find(sm => sm.id === shareId);
    
    if (!sharedMemo) return null;
    
    // Check if expired
    if (sharedMemo.expiresAt && new Date() > new Date(sharedMemo.expiresAt)) {
      this.removeSharedMemo(shareId);
      return null;
    }
    
    // Increment access count
    sharedMemo.accessCount++;
    this.updateSharedMemo(sharedMemo);
    
    return sharedMemo;
  }

  // Copy memo text to clipboard
  static async copyToClipboard(memo: Memo): Promise<boolean> {
    try {
      const text = this.formatMemoForCopy(memo);
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      // Fallback for older browsers
      return this.fallbackCopyToClipboard(this.formatMemoForCopy(memo));
    }
  }

  // Share via Web Share API (mobile)
  static async shareViaNative(memo: Memo): Promise<boolean> {
    if (!navigator.share) return false;
    
    try {
      await navigator.share({
        title: memo.title,
        text: memo.content,
        url: window.location.href
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Generate mailto link
  static generateEmailShare(memo: Memo): string {
    const subject = encodeURIComponent(`메모: ${memo.title}`);
    const body = encodeURIComponent(this.formatMemoForEmail(memo));
    return `mailto:?subject=${subject}&body=${body}`;
  }

  // Generate social media share links
  static generateSocialShare(memo: Memo, platform: 'twitter' | 'facebook' | 'linkedin'): string {
    const text = encodeURIComponent(`${memo.title}\n\n${memo.content.substring(0, 200)}...`);
    const url = encodeURIComponent(window.location.href);
    
    switch (platform) {
      case 'twitter':
        return `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
      default:
        return '';
    }
  }

  // Get all shared memos for management
  static getSharedMemos(): SharedMemo[] {
    const shared = localStorage.getItem(this.SHARED_MEMOS_KEY);
    if (!shared) return [];
    
    return JSON.parse(shared).map((sm: any) => ({
      ...sm,
      sharedAt: new Date(sm.sharedAt),
      expiresAt: sm.expiresAt ? new Date(sm.expiresAt) : undefined,
      memo: {
        ...sm.memo,
        createdAt: new Date(sm.memo.createdAt),
        updatedAt: new Date(sm.memo.updatedAt)
      }
    }));
  }

  // Remove shared memo
  static removeSharedMemo(shareId: string): void {
    const sharedMemos = this.getSharedMemos();
    const filtered = sharedMemos.filter(sm => sm.id !== shareId);
    localStorage.setItem(this.SHARED_MEMOS_KEY, JSON.stringify(filtered));
  }

  // Clean up expired shares
  static cleanupExpiredShares(): void {
    const sharedMemos = this.getSharedMemos();
    const now = new Date();
    const active = sharedMemos.filter(sm => 
      !sm.expiresAt || new Date(sm.expiresAt) > now
    );
    localStorage.setItem(this.SHARED_MEMOS_KEY, JSON.stringify(active));
  }

  // Private helper methods
  private static generateShareId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  private static saveSharedMemo(sharedMemo: SharedMemo): void {
    const sharedMemos = this.getSharedMemos();
    sharedMemos.push(sharedMemo);
    localStorage.setItem(this.SHARED_MEMOS_KEY, JSON.stringify(sharedMemos));
  }

  private static updateSharedMemo(sharedMemo: SharedMemo): void {
    const sharedMemos = this.getSharedMemos();
    const index = sharedMemos.findIndex(sm => sm.id === sharedMemo.id);
    if (index !== -1) {
      sharedMemos[index] = sharedMemo;
      localStorage.setItem(this.SHARED_MEMOS_KEY, JSON.stringify(sharedMemos));
    }
  }

  private static formatMemoForCopy(memo: Memo): string {
    let text = `${memo.title}\n\n${memo.content}`;
    
    if (memo.category) {
      const categoryName = memo.category === 'personal' ? '개인' :
                          memo.category === 'work' ? '업무' :
                          memo.category === 'ideas' ? '아이디어' :
                          memo.category === 'todo' ? '할 일' : '기타';
      text += `\n\n카테고리: ${categoryName}`;
    }
    
    if (memo.tags && memo.tags.length > 0) {
      text += `\n태그: ${memo.tags.map(tag => `#${tag}`).join(' ')}`;
    }
    
    text += `\n\n생성일: ${new Date(memo.createdAt).toLocaleString('ko-KR')}`;
    text += `\n수정일: ${new Date(memo.updatedAt).toLocaleString('ko-KR')}`;
    
    return text;
  }

  private static formatMemoForEmail(memo: Memo): string {
    let text = this.formatMemoForCopy(memo);
    text += `\n\n--\n메모장 Pro에서 공유됨`;
    return text;
  }

  private static fallbackCopyToClipboard(text: string): boolean {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (error) {
      document.body.removeChild(textArea);
      return false;
    }
  }
}