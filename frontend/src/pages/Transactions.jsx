import { useState, useEffect } from 'react'
import axios from 'axios'

const CATEGORIES = {
  income: ['Salary', 'Freelance', 'Other Income'],
  expense: ['Food', 'Transport', 'Shopping', 'Bills', 'Rent', 'Entertainment', 'Other']
}

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Food')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    fetchTransactions()
  }, [])

  async function fetchTransactions() {
    try {
      const res = await axios.get('http://localhost:5001/transactions')
      setTransactions(res.data)
    } catch (err) {
      console.error('fetch error:', err)
    }
  }

  async function handleSubmit() {
    if (!amount || !category) return
    await axios.post('http://localhost:5001/transactions', {
      type, amount: parseFloat(amount), category, note, date
    })
    setAmount('')
    setNote('')
    fetchTransactions()
  }

  async function handleDelete(id) {
    await axios.delete(`http://localhost:5001/transactions/${id}`)
    fetchTransactions()
  }

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)

  const savings = totalIncome - totalExpenses

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
          <p className="text-green-400 font-semibold text-sm">Income</p>
          <p className="text-2xl font-bold text-green-500">+${totalIncome.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
          <p className="text-red-300 font-semibold text-sm">Expenses</p>
          <p className="text-2xl font-bold text-red-400">-${totalExpenses.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
          <p className="text-pink-400 font-semibold text-sm">Saved</p>
          <p className={`text-2xl font-bold ${savings >= 0 ? 'text-pink-500' : 'text-red-400'}`}>
            ${savings.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-pink-400 font-bold text-lg">Log a transaction</h2>

        {/* Type toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => { setType('expense'); setCategory('Food') }}
            className={`flex-1 py-2 rounded-xl font-semibold text-sm transition-colors ${type === 'expense' ? 'bg-red-100 text-red-400' : 'bg-gray-100 text-gray-400'}`}
          >
            Expense
          </button>
          <button
            onClick={() => { setType('income'); setCategory('Salary') }}
            className={`flex-1 py-2 rounded-xl font-semibold text-sm transition-colors ${type === 'income' ? 'bg-green-100 text-green-400' : 'bg-gray-100 text-gray-400'}`}
          >
            Income
          </button>
        </div>

        <input
          type="number"
          placeholder="Amount (SGD)"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="w-full border border-pink-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
        />

        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="w-full border border-pink-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
        >
          {CATEGORIES[type].map(cat => (
            <option key={cat}>{cat}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Note (optional)"
          value={note}
          onChange={e => setNote(e.target.value)}
          className="w-full border border-pink-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
        />

        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full border border-pink-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-pink-400 hover:bg-pink-500 text-white font-semibold py-2 rounded-xl transition-colors"
        >
          Add 🐷
        </button>
      </div>

      {/* Transaction list */}
      <div className="space-y-2">
        {transactions.map(t => (
          <div key={t.id} className="bg-white rounded-2xl px-5 py-4 shadow-sm flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-600 text-sm">{t.category} {t.note ? `— ${t.note}` : ''}</p>
              <p className="text-xs text-gray-400">{new Date(t.date).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-4">
              <p className={`font-bold ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                {t.type === 'income' ? '+' : '-'}${parseFloat(t.amount).toFixed(2)}
              </p>
              <button
                onClick={() => handleDelete(t.id)}
                className="text-gray-300 hover:text-red-400 text-xs transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}