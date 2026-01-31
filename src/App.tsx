import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { HistoryGame } from './pages/HistoryGame';
import { ShapeGame } from './pages/ShapeGame';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<HistoryGame />} />
        <Route path="/shape" element={<ShapeGame />} />
      </Routes>
    </Router>
  );
}

export default App;

