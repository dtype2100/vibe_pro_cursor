import type { Memo, MemoCategory } from '../types/Memo';

export interface MemoStatistics {
  totalMemos: number;
  totalPinned: number;
  categoryCounts: Record<string, number>;
  tagCounts: Record<string, number>;
  averageContentLength: number;
  memosCreatedLast7Days: number;
  memosCreatedLast30Days: number;
  mostUsedTags: Array<{ tag: string; count: number }>;
  memosByMonth: Array<{ month: string; count: number }>;
  lastUpdated: Date | null;
}

export class StatisticsService {
  static calculateStatistics(memos: Memo[]): MemoStatistics {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Category counts
    const categoryCounts: Record<string, number> = {
      personal: 0,
      work: 0,
      ideas: 0,
      todo: 0,
      other: 0
    };

    // Tag counts
    const tagCounts: Record<string, number> = {};

    // Monthly counts for last 12 months
    const monthlyData: Record<string, number> = {};
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[key] = 0;
    }

    let totalContentLength = 0;
    let totalPinned = 0;
    let memosCreatedLast7Days = 0;
    let memosCreatedLast30Days = 0;
    let lastUpdated: Date | null = null;

    memos.forEach(memo => {
      // Category count
      if (memo.category) {
        categoryCounts[memo.category] = (categoryCounts[memo.category] || 0) + 1;
      }

      // Tag counts
      memo.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });

      // Content length
      totalContentLength += memo.content.length;

      // Pinned count
      if (memo.isPinned) totalPinned++;

      // Recent memos
      const createdDate = new Date(memo.createdAt);
      if (createdDate >= sevenDaysAgo) memosCreatedLast7Days++;
      if (createdDate >= thirtyDaysAgo) memosCreatedLast30Days++;

      // Monthly data
      const monthKey = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData[monthKey] !== undefined) {
        monthlyData[monthKey]++;
      }

      // Last updated
      const updatedDate = new Date(memo.updatedAt);
      if (!lastUpdated || updatedDate > lastUpdated) {
        lastUpdated = updatedDate;
      }
    });

    // Most used tags (top 5)
    const mostUsedTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));

    // Memos by month
    const memosByMonth = Object.entries(monthlyData)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([month, count]) => ({ month, count }));

    return {
      totalMemos: memos.length,
      totalPinned,
      categoryCounts,
      tagCounts,
      averageContentLength: memos.length > 0 ? Math.round(totalContentLength / memos.length) : 0,
      memosCreatedLast7Days,
      memosCreatedLast30Days,
      mostUsedTags,
      memosByMonth,
      lastUpdated
    };
  }

  // Generate insights based on statistics
  static generateInsights(stats: MemoStatistics): string[] {
    const insights: string[] = [];

    // Most used category
    const topCategory = Object.entries(stats.categoryCounts)
      .sort(([, a], [, b]) => b - a)[0];
    if (topCategory && topCategory[1] > 0) {
      const categoryName = topCategory[0] === 'personal' ? '개인' :
                          topCategory[0] === 'work' ? '업무' :
                          topCategory[0] === 'ideas' ? '아이디어' :
                          topCategory[0] === 'todo' ? '할 일' : '기타';
      insights.push(`가장 많이 사용하는 카테고리는 "${categoryName}"입니다 (${topCategory[1]}개)`);
    }

    // Recent activity
    if (stats.memosCreatedLast7Days > 0) {
      insights.push(`최근 7일간 ${stats.memosCreatedLast7Days}개의 메모를 작성했습니다`);
    }

    // Average content length
    if (stats.averageContentLength > 0) {
      insights.push(`평균 메모 길이는 ${stats.averageContentLength}자입니다`);
    }

    // Most used tag
    if (stats.mostUsedTags.length > 0) {
      insights.push(`가장 많이 사용하는 태그는 "#${stats.mostUsedTags[0].tag}"입니다`);
    }

    // Pinned ratio
    if (stats.totalMemos > 0) {
      const pinnedRatio = Math.round((stats.totalPinned / stats.totalMemos) * 100);
      insights.push(`전체 메모의 ${pinnedRatio}%가 고정되어 있습니다`);
    }

    return insights;
  }
}