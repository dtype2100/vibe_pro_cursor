import { useState, useEffect } from 'react'
import MemoList from './components/MemoList'
import MemoForm from './components/MemoForm'
import type { Memo } from './types/Memo'
import './App.css'

function App() {
  const [memos, setMemos] = useState<Memo[]>(() => {
    const savedMemos = localStorage.getItem('memos')
    return savedMemos ? JSON.parse(savedMemos) : []
  })
  const [editingMemo, setEditingMemo] = useState<Memo | undefined>()
  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list')

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
    }
  }

  const handleDeleteMemo = (id: number) => {
    setMemos(memos.filter((memo) => memo.id !== id))
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
      <h1>메모장</h1>
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
          />
        </>
      )}
    </div>
  )
}

export default App
