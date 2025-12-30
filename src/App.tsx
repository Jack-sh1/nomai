import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ScanResultPage from './pages/ScanResultPage';
import MealPlanPage from './pages/MealPlanPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/scan-result" element={<ScanResultPage />} />
        <Route path="/meal-plan" element={<MealPlanPage />} />
        {/* 默认跳转到餐单页，方便预览新页面 */}
        <Route path="/" element={<Navigate to="/meal-plan" replace />} />
        <Route path="/dashboard" element={<div className="p-10">Dashboard (Coming Soon)</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
