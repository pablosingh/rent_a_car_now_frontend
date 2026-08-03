import { Routes, Route } from 'react-router-dom'
import Header from './components/Header/Header'
import CarGrid from './components/CarGrid/CarGrid'
import CarDetail from './pages/CarDetail'
import CreateCar from './pages/CreateCar'

function App() {
  return (
    <>
      <Header />
      <main className="p-4 md:p-8 pt-[180px] md:pt-[180px]">
        <Routes>
          <Route path="/" element={<CarGrid />} />
          <Route path="/car/:id" element={<CarDetail />} />
          <Route path="/crear" element={<CreateCar />} />
        </Routes>
      </main>
    </>
  )
}

export default App
