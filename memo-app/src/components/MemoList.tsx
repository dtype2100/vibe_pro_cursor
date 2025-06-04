import React, { useState, useMemo } from 'react';
import type { Memo, MemoCategory } from '../types/Memo';
import { ExportImportService, PrintService, ShareService, SearchHighlightService } from '../services';

interface MemoListProps {
  memos: Memo[];
  onDelete: (id: number) => void;
  onEdit: (memo: Memo) => void;
  onBulkDelete?: (ids: number[]) => void;
  onToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

type SortField = 'title' | 'category' | 'updatedAt' | 'createdAt';
type SortOrder = 'asc' | 'desc';

const MemoList: React.FC<MemoListProps> = ({ memos, onDelete, onEdit, onBulkDelete, onToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<MemoCategory | 'all'>('all');
  const [filterTag, setFilterTag] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Filter memos
  const filteredMemos = useMemo(() => {
    return memos.filter((memo) => {
      const matchesSearch = memo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           memo.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || memo.category === filterCategory;
      const matchesTag = !filterTag || memo.tags?.some(tag => 
        tag.toLowerCase().includes(filterTag.toLowerCase())
      );
      return matchesSearch && matchesCategory && matchesTag;
    });
  }, [memos, searchTerm, filterCategory, filterTag]);

  // Sort memos
  const sortedMemos = useMemo(() => {
    return [...filteredMemos].sort((a, b) => {
      // Handle pinned items first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle date sorting
      if (sortField === 'updatedAt' || sortField === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      // Handle undefined values
      if (aValue === undefined) aValue = '';
      if (bValue === undefined) bValue = '';

      // Sort
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredMemos, sortField, sortOrder]);

  const allTags = Array.from(new Set(memos.flatMap(memo => memo.tags || [])));

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(sortedMemos.map(memo => memo.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: number) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id);
    } else {
      newSelectedIds.add(id);
    }
    setSelectedIds(newSelectedIds);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.size > 0 && window.confirm(`${selectedIds.size}개의 메모를 삭제하시겠습니까?`)) {
      if (onBulkDelete) {
        onBulkDelete(Array.from(selectedIds));
      } else {
        selectedIds.forEach(id => onDelete(id));
      }
      setSelectedIds(new Set());
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  // Service functions
  const handleExportJSON = () => {
    ExportImportService.exportToJSON(memos);
    onToast?.('JSON 파일로 내보내기 완료!', 'success');
  };

  const handleExportCSV = () => {
    ExportImportService.exportToCSV(memos);
    onToast?.('CSV 파일로 내보내기 완료!', 'success');
  };

  const handleExportSelected = (format: 'json' | 'csv') => {
    if (selectedIds.size === 0) {
      onToast?.('선택된 메모가 없습니다.', 'error');
      return;
    }
    ExportImportService.exportSelected(memos, Array.from(selectedIds), format);
    onToast?.(`선택된 ${selectedIds.size}개 메모를 ${format.toUpperCase()}로 내보내기 완료!`, 'success');
  };

  const handlePrintAll = () => {
    PrintService.printMemos(memos);
  };

  const handlePrintSelected = () => {
    if (selectedIds.size === 0) {
      onToast?.('선택된 메모가 없습니다.', 'error');
      return;
    }
    PrintService.printSelectedMemos(memos, Array.from(selectedIds));
  };

  const handleCopyMemo = async (memo: Memo) => {
    const success = await ShareService.copyToClipboard(memo);
    onToast?.(success ? '메모가 클립보드에 복사되었습니다.' : '복사에 실패했습니다.', success ? 'success' : 'error');
  };

  return (
    <div className="memo-list-container">
      <div className="memo-filters">
        <input
          type="text"
          placeholder="메모 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as MemoCategory | 'all')}
          className="category-filter"
        >
          <option value="all">모든 카테고리</option>
          <option value="personal">개인</option>
          <option value="work">업무</option>
          <option value="ideas">아이디어</option>
          <option value="todo">할 일</option>
          <option value="other">기타</option>
        </select>
        <select
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value)}
          className="tag-filter"
        >
          <option value="">모든 태그</option>
          {allTags.map((tag) => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>

      {/* Services Toolbar */}
      <div className="services-toolbar">
        <div className="toolbar-section">
          <span className="toolbar-label">내보내기:</span>
          <button onClick={handleExportJSON} className="toolbar-btn">
            📄 JSON
          </button>
          <button onClick={handleExportCSV} className="toolbar-btn">
            📊 CSV
          </button>
        </div>
        
        <div className="toolbar-section">
          <span className="toolbar-label">인쇄:</span>
          <button onClick={handlePrintAll} className="toolbar-btn">
            🖨️ 전체
          </button>
        </div>

        {selectedIds.size > 0 && (
          <div className="toolbar-section">
            <span className="toolbar-label">선택된 항목:</span>
            <button onClick={() => handleExportSelected('json')} className="toolbar-btn">
              📄 JSON
            </button>
            <button onClick={() => handleExportSelected('csv')} className="toolbar-btn">
              📊 CSV
            </button>
            <button onClick={handlePrintSelected} className="toolbar-btn">
              🖨️ 인쇄
            </button>
          </div>
        )}
      </div>

      {selectedIds.size > 0 && (
        <div className="bulk-actions">
          <span className="selected-count">{selectedIds.size}개 선택됨</span>
          <button onClick={handleBulkDelete} className="bulk-delete-btn">
            선택 삭제
          </button>
          <button onClick={() => setSelectedIds(new Set())} className="clear-selection-btn">
            선택 해제
          </button>
        </div>
      )}

      {sortedMemos.length > 0 ? (
        <>
          <div className="memo-count">
            총 {sortedMemos.length}개의 메모
          </div>
          <div className="memo-table-wrapper">
            <table className="memo-table">
              <thead>
                <tr>
                  <th className="checkbox-column">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedIds.size > 0 && selectedIds.size === sortedMemos.length}
                      className="select-all-checkbox"
                    />
                  </th>
                  <th className="pin-column">📌</th>
                  <th className="title-column sortable" onClick={() => handleSort('title')}>
                    제목 <span className="sort-icon">{getSortIcon('title')}</span>
                  </th>
                  <th className="content-column">내용</th>
                  <th className="category-column sortable" onClick={() => handleSort('category')}>
                    카테고리 <span className="sort-icon">{getSortIcon('category')}</span>
                  </th>
                  <th className="tags-column">태그</th>
                  <th className="date-column sortable" onClick={() => handleSort('createdAt')}>
                    생성일 <span className="sort-icon">{getSortIcon('createdAt')}</span>
                  </th>
                  <th className="date-column sortable" onClick={() => handleSort('updatedAt')}>
                    수정일 <span className="sort-icon">{getSortIcon('updatedAt')}</span>
                  </th>
                  <th className="actions-column">작업</th>
                </tr>
              </thead>
              <tbody>
                {sortedMemos.map((memo) => (
                  <tr key={memo.id} className={`memo-row ${memo.isPinned ? 'pinned' : ''} ${selectedIds.has(memo.id) ? 'selected' : ''}`}>
                    <td className="checkbox-column">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(memo.id)}
                        onChange={() => handleSelectOne(memo.id)}
                        className="row-checkbox"
                      />
                    </td>
                    <td className="pin-column">
                      {memo.isPinned && <span className="pin-icon">📌</span>}
                    </td>
                    <td className="title-column">
                      <span className="memo-title">{memo.title}</span>
                    </td>
                    <td className="content-column">
                      <span className="memo-content-preview">{memo.content}</span>
                    </td>
                    <td className="category-column">
                      {memo.category && (
                        <span className={`category-badge category-${memo.category}`}>
                          {memo.category === 'personal' ? '개인' :
                           memo.category === 'work' ? '업무' :
                           memo.category === 'ideas' ? '아이디어' :
                           memo.category === 'todo' ? '할 일' : '기타'}
                        </span>
                      )}
                    </td>
                    <td className="tags-column">
                      {memo.tags && memo.tags.length > 0 && (
                        <div className="memo-tags">
                          {memo.tags.map((tag, index) => (
                            <span key={index} className="tag">#{tag}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="date-column">
                      <span className="memo-date">{formatDate(memo.createdAt)}</span>
                    </td>
                    <td className="date-column">
                      <span className="memo-date">{formatDate(memo.updatedAt)}</span>
                    </td>
                    <td className="actions-column">
                      <div className="memo-actions">
                        <button onClick={() => onEdit(memo)} className="edit-btn" title="수정">
                          ✏️
                        </button>
                        <button onClick={() => handleCopyMemo(memo)} className="copy-btn" title="복사">
                          📋
                        </button>
                        <button onClick={() => PrintService.printMemo(memo)} className="print-btn" title="인쇄">
                          🖨️
                        </button>
                        <button onClick={() => onDelete(memo.id)} className="delete-btn" title="삭제">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 2C7.89543 2 7 2.89543 7 4V20C7 21.1046 7.89543 22 9 22H15C16.1046 22 17 21.1046 17 20V8L13 4L9 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13 2V8H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 12H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 16H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3>메모가 없습니다</h3>
          <p>새로운 메모를 작성해보세요!</p>
        </div>
      )}
    </div>
  );
};

export default MemoList;