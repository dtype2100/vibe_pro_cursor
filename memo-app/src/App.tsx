import { useState, useEffect } from 'react'
import MemoList from './components/MemoList'
import MemoForm from './components/MemoForm'
import Toast from './components/Toast'
import type { Memo } from './types/Memo'
import './App.css'

function App() {
  const [memos, setMemos] = useState<Memo[]>(() => {
    const savedMemos = localStorage.getItem('memos')
    if (savedMemos) {
      const parsed = JSON.parse(savedMemos)
      return parsed.map((memo: any) => ({
        ...memo,
        createdAt: new Date(memo.createdAt),
        updatedAt: new Date(memo.updatedAt)
      }))
    }
    return []
  })
  const [editingMemo, setEditingMemo] = useState<Memo | undefined>()
  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  useEffect(() => {
    localStorage.setItem('memos', JSON.stringify(memos))
  }, [memos])

  const handleAddMemo = (memoData: Omit<Memo, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newMemo: Memo = {
      id: Date.now(),
      ...memoData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setMemos([...memos, newMemo])
    setActiveTab('list')
    setToast({ message: '메모가 저장되었습니다!', type: 'success' })
  }

  const handleEditMemo = (memoData: Omit<Memo, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingMemo) {
      const updatedMemos = memos.map((memo) =>
        memo.id === editingMemo.id
          ? { ...memo, ...memoData, updatedAt: new Date() }
          : memo
      )
      setMemos(updatedMemos)
      setEditingMemo(undefined)
      setActiveTab('list')
      setToast({ message: '메모가 수정되었습니다!', type: 'success' })
    }
  }

  const handleDeleteMemo = (id: number) => {
    if (window.confirm('정말 이 메모를 삭제하시겠습니까?')) {
      setMemos(memos.filter((memo) => memo.id !== id))
      setToast({ message: '메모가 삭제되었습니다.', type: 'info' })
    }
  }

  const handleBulkDelete = (ids: number[]) => {
    setMemos(memos.filter((memo) => !ids.includes(memo.id)))
    setToast({ message: `${ids.length}개의 메모가 삭제되었습니다.`, type: 'info' })
  }

  const handleEditButton = (memo: Memo) => {
    setEditingMemo(memo)
    setActiveTab('form')
  }

  const handleNewMemo = () => {
    setEditingMemo(undefined)
    setActiveTab('form')
  }

  return (
    <div className="app">
      <h1>📋 메모장 Pro</h1>
      <div className="tabs">
        <button
          className={activeTab === 'list' ? 'active' : ''}
          onClick={() => setActiveTab('list')}
        >
          메모 목록
        </button>
        <button
          className={activeTab === 'form' ? 'active' : ''}
          onClick={handleNewMemo}
        >
          {editingMemo ? '메모 수정' : '메모 작성'}
        </button>
      </div>
      {activeTab === 'form' && (
        <MemoForm
          memo={editingMemo}
          onSubmit={editingMemo ? handleEditMemo : handleAddMemo}
        />
      )}
      {activeTab === 'list' && (
        <>
          <MemoList
            memos={memos}
            onDelete={handleDeleteMemo}
            onEdit={handleEditButton}
            onBulkDelete={handleBulkDelete}
            onToast={(message, type) => setToast({ message, type })}
          />
        </>
      )}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

export default App
