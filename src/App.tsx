import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { isNativeApp } from './lib/notify';
import { Home } from './pages/Home';
import { HistoryGame } from './pages/HistoryGame';
import { ShapeGame } from './pages/ShapeGame';
import { CareerGame } from './pages/CareerGame';
import { BottleGame } from './pages/BottleGame';
import { TetrisGame } from './pages/TetrisGame';
import WordGame from './pages/WordGame';
import HanjaGame from './pages/HanjaGame';

import { useCopyProtection } from './hooks/useCopyProtection';
import { usePageTracking } from './hooks/usePageTracking';

import { FeedbackModal } from './components/FeedbackModal';

// 라우터 내부에서 훅을 사용하기 위한 래퍼 컴포넌트
function AppRoutes() {
  useCopyProtection();
  usePageTracking(); // Google Analytics 페이지뷰 추적

  // 안드로이드 앱(내장형)은 루트(/) 대신 영단어 화면(/english)에서 시작.
  // 웹에서는 no-op(isNativeApp=false)이라 기존 라우팅에 영향 없음.
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (isNativeApp() && location.pathname === '/') {
      navigate('/english', { replace: true });
    }
    // 최초 진입 시 1회만.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<HistoryGame />} />
        <Route path="/circle" element={<ShapeGame />} />
        <Route path="/career" element={<CareerGame />} />
        <Route path="/bottle" element={<BottleGame />} />
        <Route path="/tetris" element={<TetrisGame />} />
        <Route path="/english" element={<WordGame />} />
        <Route path="/hanja" element={<HanjaGame />} />
      </Routes>
      <FeedbackModal />
    </>
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
