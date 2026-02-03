import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { HistoryGame } from './pages/HistoryGame';
import { ShapeGame } from './pages/ShapeGame';
import { CareerGame } from './pages/CareerGame';

import { useCopyProtection } from './hooks/useCopyProtection';
import { usePageTracking } from './hooks/usePageTracking';

// 라우터 내부에서 훅을 사용하기 위한 래퍼 컴포넌트
function AppRoutes() {
  useCopyProtection();
  usePageTracking(); // Google Analytics 페이지뷰 추적

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/history" element={<HistoryGame />} />
      <Route path="/circle" element={<ShapeGame />} />
      <Route path="/career" element={<CareerGame />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
