import { useState, useEffect } from 'react'
import axios from 'axios'

const EVENT_TYPES = ['buy', 'sell', 'dividend']
const CURRENCIES = ['SGD', 'USD', 'HKD']

export default function Portfolio() {
  const [holdings, setHoldings] = useState([])
  const [events, setEvents] = useState([])
  const [type, setType] = useState('buy')
  const [ticker, setTicker] = useState('')
  const [name, setName] = useState('')
  const [shares, setShares] = useState('')
  const [pricePerShare, setPricePerShare] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('SGD')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')

  useEffect(() => {
    fetchHoldings()
    fetchEvents()
  }, [])

  async function fetchHoldings() {
    try {
      const res = await axios.get('http://localhost:5001/stocks/holdings')
      setHoldings(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  async function fetchEvents() {
    try {
      const res = await axios.get('http://localhost:5001/stocks/events')
      setEvents(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  async function handleDeleteHolding(id) {
    await axios.delete(`http://localhost:5001/stocks/holdings/${id}`)
    fetchHoldings()
  }

  async function handleDeleteEvent(id) {
    await axios.delete(`http://localhost:5001/stocks/events/${id}`)
    fetchEvents()
  }

  async function handleSubmit() {
    if (!ticker || !amount) return
    try {
      await axios.post('http://localhost:5001/stocks/events', {
        type,
        ticker: ticker.toUpperCase(),
        name,
        shares: shares ? parseFloat(shares) : null,
        price_per_share: pricePerShare ? parseFloat(pricePerShare) : null,
        amount: parseFloat(amount),
        currency,
        date,
        note
      })
      setTicker('')
      setName('')
      setShares('')
      setPricePerShare('')
      setAmount('')
      setNote('')
      fetchHoldings()
      fetchEvents()
    } catch (err) {
      console.error(err)
    }
  }

  const totalDividends = events
    .filter(e => e.type === 'dividend')
    .reduce((sum, e) => sum + parseFloat(e.amount), 0)

  const totalRealised = events
    .filter(e => e.type === 'sell')
    .reduce((sum, e) => sum + parseFloat(e.amount), 0)

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
          <p className="text-purple-400 font-semibold text-sm">Total Dividends</p>
          <p className="text-2xl font-bold text-purple-500">+${totalDividends.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
          <p className="text-blue-400 font-semibold text-sm">Realised Gains</p>
          <p className="text-2xl font-bold text-blue-500">+${totalRealised.toFixed(2)}</p>
        </div>
      </div>

      {/* Holdings */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-pink-400 font-bold text-lg mb-4">Current Holdings 🐷</h2>
        {holdings.length === 0 ? (
          <p className="text-gray-300 text-sm">No holdings yet — buy something!</p>
        ) : (
          <div className="space-y-3">
            {holdings.map(h => (
              <div key={h.id} className="flex items-center justify-between border-b border-pink-50 pb-3">
                <div>
                  <p className="font-bold text-gray-600">{h.ticker} <span className="text-gray-400 font-normal text-sm">— {h.name}</span></p>
                  <p className="text-xs text-gray-400">{parseFloat(h.shares).toFixed(2)} shares @ avg {h.currency} {parseFloat(h.avg_buy_price).toFixed(4)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-bold text-pink-400">{h.currency} {(parseFloat(h.shares) * parseFloat(h.avg_buy_price)).toFixed(2)}</p>
                  <button
                    onClick={() => handleDeleteHolding(h.id)}
                    className="text-gray-300 hover:text-red-400 text-xs transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log event form */}
      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-pink-400 font-bold text-lg">Log an event</h2>

        <div className="flex gap-2">
          {EVENT_TYPES.map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex-1 py-2 rounded-xl font-semibold text-sm transition-colors capitalize ${
                type === t
                  ? t === 'buy' ? 'bg-green-100 text-green-500'
                  : t === 'sell' ? 'bg-red-100 text-red-400'
                  : 'bg-purple-100 text-purple-400'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input
            placeholder="Ticker (e.g. CICT)"
            value={ticker}
            onChange={e => setTicker(e.target.value)}
            className="border border-pink-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
          />
          <input
            placeholder="Name (e.g. CapitaLand REIT)"
            value={name}
            onChange={e => setName(e.target.value)}
            className="border border-pink-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
          />
        </div>

        {type !== 'dividend' && (
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Shares"
              value={shares}
              onChange={e => setShares(e.target.value)}
              className="border border-pink-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
            />
            <input
              type="number"
              placeholder="Price per share"
              value={pricePerShare}
              onChange={e => setPricePerShare(e.target.value)}
              className="border border-pink-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="Total amount"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="border border-pink-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
          />
          <select
            value={currency}
            onChange={e => setCurrency(e.target.value)}
            className="border border-pink-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
          >
            {CURRENCIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full border border-pink-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
        />

        <input
          placeholder="Note (optional)"
          value={note}
          onChange={e => setNote(e.target.value)}
          className="w-full border border-pink-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-pink-400 hover:bg-pink-500 text-white font-semibold py-2 rounded-xl transition-colors"
        >
          Log 🐷
        </button>
      </div>

      {/* Event history */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-pink-400 font-bold text-lg mb-4">Event History</h2>
        {events.length === 0 ? (
          <p className="text-gray-300 text-sm">No events yet!</p>
        ) : (
          <div className="space-y-3">
            {events.map(e => (
              <div key={e.id} className="flex items-center justify-between border-b border-pink-50 pb-3">
                <div>
                  <p className="font-bold text-gray-600">
                    <span className={`capitalize mr-2 text-sm px-2 py-0.5 rounded-full ${
                      e.type === 'buy' ? 'bg-green-100 text-green-500'
                      : e.type === 'sell' ? 'bg-red-100 text-red-400'
                      : 'bg-purple-100 text-purple-400'
                    }`}>{e.type}</span>
                    {e.ticker} — {e.name}
                  </p>
                  <p className="text-xs text-gray-400">{new Date(e.date).toLocaleDateString()} {e.note ? `· ${e.note}` : ''}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-bold text-gray-600">{e.currency} {parseFloat(e.amount).toFixed(2)}</p>
                  <button
                    onClick={() => handleDeleteEvent(e.id)}
                    className="text-gray-300 hover:text-red-400 text-xs transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}