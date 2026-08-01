import { Routes, Route } from 'react-router-dom'
import Header from './components/Header/Header'
import CarGrid from './components/CarGrid/CarGrid'
import CarDetail from './pages/CarDetail'

function App() {
  return (
    <>
      <Header />
      <main className="p-4 md:p-8">
        <Routes>
          <Route path="/" element={<CarGrid />} />
          <Route path="/car/:id" element={<CarDetail />} />
        </Routes>
      </main>
    </>
  )
}

export default App
