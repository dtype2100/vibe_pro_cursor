import React, { useState, useEffect } from 'react';
import type { Memo, MemoCategory } from '../types/Memo';
import { MEMO_CATEGORIES } from '../types/Memo';
import { TemplateService } from '../services';

interface MemoFormProps {
  memo?: Memo;
  onSubmit: (memo: Omit<Memo, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const MemoForm: React.FC<MemoFormProps> = ({ memo, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<MemoCategory>('personal');
  const [tags, setTags] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    if (memo) {
      setTitle(memo.title);
      setContent(memo.content);
      setCategory((memo.category as MemoCategory) || 'personal');
      setTags(memo.tags?.join(', ') || '');
      setIsPinned(memo.isPinned || false);
    } else {
      setTitle('');
      setContent('');
      setCategory('personal');
      setTags('');
      setIsPinned(false);
    }
  }, [memo]);

  const validateForm = () => {
    const newErrors: { title?: string; content?: string } = {};
    
    if (!title.trim()) {
      newErrors.title = '제목을 입력해주세요.';
    } else if (title.length > 100) {
      newErrors.title = '제목은 100자 이내로 입력해주세요.';
    }
    
    if (!content.trim()) {
      newErrors.content = '내용을 입력해주세요.';
    } else if (content.length > 1000) {
      newErrors.content = '내용은 1000자 이내로 입력해주세요.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate async operation
      
      onSubmit({ 
        title: title.trim(), 
        content: content.trim(), 
        category,
        tags: tagArray.length > 0 ? tagArray : undefined,
        isPinned
      });
      
      if (!memo) {
        setTitle('');
        setContent('');
        setCategory('personal');
        setTags('');
        setIsPinned(false);
        setErrors({});
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const templateData = TemplateService.applyTemplate(templateId);
    if (templateData) {
      setTitle(templateData.title);
      setContent(templateData.content);
      setCategory((templateData.category || 'personal') as MemoCategory);
      setTags(templateData.tags?.join(', ') || '');
      setIsPinned(templateData.isPinned || false);
      setShowTemplates(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="memo-form">
      {!memo && (
        <div className="template-section">
          <button 
            type="button" 
            onClick={() => setShowTemplates(!showTemplates)}
            className="template-toggle-btn"
          >
            📝 템플릿 사용하기
          </button>
          {showTemplates && (
            <div className="template-grid">
              {TemplateService.templates.map(template => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleTemplateSelect(template.id)}
                  className="template-card"
                >
                  <span className="template-icon">{template.icon}</span>
                  <span className="template-name">{template.name}</span>
                  <span className="template-desc">{template.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      <div>
        <label htmlFor="title">제목 <span style={{ color: 'var(--danger-color)' }}>*</span></label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) {
              setErrors({ ...errors, title: undefined });
            }
          }}
          className={errors.title ? 'error' : ''}
          placeholder="메모 제목을 입력하세요"
          maxLength={100}
        />
        {errors.title && <span className="error-message">{errors.title}</span>}
        <span className="char-count">{title.length}/100</span>
      </div>
      <div>
        <label htmlFor="content">내용 <span style={{ color: 'var(--danger-color)' }}>*</span></label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            if (errors.content) {
              setErrors({ ...errors, content: undefined });
            }
          }}
          className={errors.content ? 'error' : ''}
          placeholder="메모 내용을 입력하세요"
          maxLength={1000}
        />
        {errors.content && <span className="error-message">{errors.content}</span>}
        <span className="char-count">{content.length}/1000</span>
      </div>
      <div>
        <label htmlFor="category">카테고리</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as MemoCategory)}
        >
          {MEMO_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat === 'personal' ? '개인' :
               cat === 'work' ? '업무' :
               cat === 'ideas' ? '아이디어' :
               cat === 'todo' ? '할 일' : '기타'}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="tags">태그 (쉼표로 구분)</label>
        <input
          type="text"
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="예: 중요, 긴급, 아이디어"
        />
      </div>
      <div className="checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={isPinned}
            onChange={(e) => setIsPinned(e.target.checked)}
          />
          고정 메모
        </label>
      </div>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <span className="loading-spinner">처리중...</span>
        ) : (
          memo ? '수정하기' : '저장하기'
        )}
      </button>
    </form>
  );
};

export default MemoForm; 