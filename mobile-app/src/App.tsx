import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import TopBar from './components/TopBar';
import BottomNav from './components/BottomNav';
import Home from './screens/Home';
import Lesson from './screens/Lesson';
import LeagueScreen from './screens/LeagueScreen';
import Leaderboard from './screens/Leaderboard';
import Tools from './screens/Tools';

function Shell() {
  const location = useLocation();
  const inLesson = location.pathname.startsWith('/lesson/');

  return (
    <div className="flex flex-col min-h-[100dvh]">
      {!inLesson && <TopBar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lesson/:topicId" element={<Lesson />} />
          <Route path="/league" element={<LeagueScreen />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/tools" element={<Tools />} />
        </Routes>
      </main>
      {!inLesson && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}
