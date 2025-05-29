import React from 'react';
import type { Memo } from '../types/Memo.ts';

interface MemoListProps {
  memos: Memo[];
  onDelete: (id: number) => void;
  onEdit: (memo: Memo) => void;
}

const MemoList: React.FC<MemoListProps> = ({ memos, onDelete, onEdit }) => {
  return (
    <div className="memo-list">
      {memos.map((memo) => (
        <div key={memo.id} className="memo-item">
          <h3>{memo.title}</h3>
          <p>{memo.content}</p>
          <div className="memo-actions">
            <button onClick={() => onEdit(memo)}>수정</button>
            <button onClick={() => onDelete(memo.id)}>삭제</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MemoList; 