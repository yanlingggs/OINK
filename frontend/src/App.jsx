import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Portfolio from './pages/Portfolio'
import Stats from './pages/Stats'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-pink-50">
        
        {/* Navbar */}
        <nav className="bg-white shadow-sm px-8 py-4 flex items-center gap-8">
          <h1 className="text-2xl font-bold text-pink-400">🐷 OINK</h1>
          <div className="flex gap-6">
            <NavLink to="/" end className={({ isActive }) => isActive ? "text-pink-500 font-semibold" : "text-pink-300 hover:text-pink-400"}>Dashboard</NavLink>
            <NavLink to="/transactions" className={({ isActive }) => isActive ? "text-pink-500 font-semibold" : "text-pink-300 hover:text-pink-400"}>Transactions</NavLink>
            <NavLink to="/portfolio" className={({ isActive }) => isActive ? "text-pink-500 font-semibold" : "text-pink-300 hover:text-pink-400"}>Portfolio</NavLink>
            <NavLink to="/stats" className={({ isActive }) => isActive ? "text-pink-500 font-semibold" : "text-pink-300 hover:text-pink-400"}>Stats</NavLink>
          </div>
        </nav>

        {/* Pages */}
        <main className="px-8 py-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/stats" element={<Stats />} />
          </Routes>
        </main>

      </div>
    </BrowserRouter>
  )
}