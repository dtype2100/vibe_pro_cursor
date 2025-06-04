export interface Memo {
  id: number;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  isPinned?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type MemoCategory = 'personal' | 'work' | 'ideas' | 'todo' | 'other';

export const MEMO_CATEGORIES: MemoCategory[] = ['personal', 'work', 'ideas', 'todo', 'other']; 