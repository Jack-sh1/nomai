import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ScanResultPage from './pages/ScanResultPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/scan-result" element={<ScanResultPage />} />
        {/* 默认跳转到扫描结果页，方便预览 */}
        <Route path="/" element={<Navigate to="/scan-result" replace />} />
        <Route path="/dashboard" element={<div className="p-10">Dashboard (Coming Soon)</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
