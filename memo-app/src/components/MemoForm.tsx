import React, { useState, useEffect } from 'react';
import type { Memo } from '../types/Memo';

interface MemoFormProps {
  memo?: Memo;
  onSubmit: (memo: Omit<Memo, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const MemoForm: React.FC<MemoFormProps> = ({ memo, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (memo) {
      setTitle(memo.title);
      setContent(memo.content);
    }
  }, [memo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, content });
    if (!memo) {
      setTitle('');
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="memo-form">
      <div>
        <label htmlFor="title">제목</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="content">내용</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>
      <button type="submit">{memo ? '수정하기' : '저장하기'}</button>
    </form>
  );
};

export default MemoForm; 