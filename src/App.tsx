import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ScanResultPage from './pages/ScanResultPage';
import MealPlanPage from './pages/MealPlanPage';
import DashboardPage from './pages/DashboardPage';
import CameraScanPage from './pages/CameraScanPage';
import SettingsPage from './pages/SettingsPage';
import TrendDetailPage from './pages/TrendDetailPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/scan-result" element={<ScanResultPage />} />
        <Route path="/meal-plan" element={<MealPlanPage />} />
        <Route path="/camera-scan" element={<CameraScanPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/trend" element={<TrendDetailPage />} />
        {/* 默认跳转到 Dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
