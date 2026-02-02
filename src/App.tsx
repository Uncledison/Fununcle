import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { HistoryGame } from './pages/HistoryGame';
import { ShapeGame } from './pages/ShapeGame';
import { CareerGame } from './pages/CareerGame';

import { useCopyProtection } from './hooks/useCopyProtection';

function App() {
  useCopyProtection();
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<HistoryGame />} />
        <Route path="/circle" element={<ShapeGame />} />
        <Route path="/career" element={<CareerGame />} />
      </Routes>
    </Router>
  );
}

export default App;

