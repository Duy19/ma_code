import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import FreeScheduler from "./pages/FreeScheduler";
import Chapter1 from "./pages/Chapter1";
import Chapter2 from "./pages/Chapter2";
import Chapter3 from "./pages/Chapter3";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800">
      <Navbar />
      <main className="p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/free-scheduler" element={<FreeScheduler/>} />
          <Route path="/chapter-1" element={<Chapter1 />} />
          <Route path="/chapter-2" element={<Chapter2 />} />
          <Route path="/chapter-3" element={<Chapter3 />} />
        </Routes>
      </main>
    </div>
  );
}


export default App;
