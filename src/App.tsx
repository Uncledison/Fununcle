import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { HistoryGame } from './pages/HistoryGame';

import { BackgroundMusic } from './components/BackgroundMusic';

function App() {
  return (
    <Router>
      <BackgroundMusic />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<HistoryGame />} />
      </Routes>
    </Router>
  );
}

export default App;

