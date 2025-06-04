import type { Memo, MemoCategory } from '../types/Memo';

export interface MemoTemplate {
  id: string;
  name: string;
  description: string;
  title: string;
  content: string;
  category: MemoCategory;
  tags: string[];
  icon: string;
}

export class TemplateService {
  static readonly templates: MemoTemplate[] = [
    {
      id: 'daily-journal',
      name: '일일 일기',
      description: '오늘 하루를 정리하는 일기 템플릿',
      title: `${new Date().toLocaleDateString('ko-KR')} 일기`,
      content: `## 오늘의 날씨
☀️ 

## 오늘의 기분
😊 

## 오늘 있었던 일
- 

## 감사한 일 3가지
1. 
2. 
3. 

## 내일의 계획
- `,
      category: 'personal',
      tags: ['일기', '일상'],
      icon: '📓'
    },
    {
      id: 'meeting-notes',
      name: '회의록',
      description: '회의 내용을 정리하는 템플릿',
      title: '회의록 - ',
      content: `## 회의 정보
- **일시**: ${new Date().toLocaleString('ko-KR')}
- **참석자**: 
- **장소**: 

## 회의 안건
1. 

## 논의 내용
### 

## 결정 사항
- 

## 향후 계획
- 

## 다음 회의
- **일시**: 
- **안건**: `,
      category: 'work',
      tags: ['회의', '업무'],
      icon: '📋'
    },
    {
      id: 'project-idea',
      name: '프로젝트 아이디어',
      description: '새로운 프로젝트 아이디어를 정리하는 템플릿',
      title: '프로젝트 아이디어 - ',
      content: `## 프로젝트 개요
### 프로젝트명
### 목적

## 주요 기능
1. 
2. 
3. 

## 예상 효과
- 

## 필요 리소스
### 인력
### 시간
### 예산

## 구현 계획
### 1단계
### 2단계
### 3단계

## 참고 자료
- `,
      category: 'ideas',
      tags: ['프로젝트', '아이디어'],
      icon: '💡'
    },
    {
      id: 'weekly-todo',
      name: '주간 할 일',
      description: '이번 주 할 일을 정리하는 템플릿',
      title: `${getWeekDateRange()} 주간 할 일`,
      content: `## 이번 주 목표
🎯 

## 월요일
- [ ] 
- [ ] 

## 화요일
- [ ] 
- [ ] 

## 수요일
- [ ] 
- [ ] 

## 목요일
- [ ] 
- [ ] 

## 금요일
- [ ] 
- [ ] 

## 주말
- [ ] 
- [ ] 

## 메모
`,
      category: 'todo',
      tags: ['할일', '주간계획'],
      icon: '📅'
    },
    {
      id: 'book-review',
      name: '독서 노트',
      description: '읽은 책을 정리하는 템플릿',
      title: '독서 노트 - ',
      content: `## 책 정보
- **제목**: 
- **저자**: 
- **출판사**: 
- **읽은 기간**: 

## 줄거리 요약


## 인상 깊은 구절
> 

## 나의 생각


## 평점
⭐⭐⭐⭐⭐ ( / 5)

## 추천 대상
`,
      category: 'personal',
      tags: ['독서', '책'],
      icon: '📚'
    },
    {
      id: 'recipe',
      name: '요리 레시피',
      description: '요리 레시피를 정리하는 템플릿',
      title: '레시피 - ',
      content: `## 재료 (인분)
- 
- 
- 

## 양념
- 
- 

## 조리 과정
1. 
2. 
3. 
4. 
5. 

## 조리 시간
- 준비: 분
- 조리: 분
- 총: 분

## 팁
💡 

## 사진
`,
      category: 'personal',
      tags: ['요리', '레시피'],
      icon: '🍳'
    }
  ];

  static getTemplate(templateId: string): MemoTemplate | undefined {
    return this.templates.find(t => t.id === templateId);
  }

  static applyTemplate(templateId: string): Omit<Memo, 'id' | 'createdAt' | 'updatedAt'> | null {
    const template = this.getTemplate(templateId);
    if (!template) return null;

    return {
      title: template.title,
      content: template.content,
      category: template.category,
      tags: template.tags,
      isPinned: false
    };
  }
}

// Helper function to get week date range
function getWeekDateRange(): string {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - now.getDay() + 1);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  return `${monday.getMonth() + 1}/${monday.getDate()} - ${sunday.getMonth() + 1}/${sunday.getDate()}`;
}