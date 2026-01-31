import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { HistoryGame } from './pages/HistoryGame';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<HistoryGame />} />
      </Routes>
    </Router>
  );
}

export default App;

