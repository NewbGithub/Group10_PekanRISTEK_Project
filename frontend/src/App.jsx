import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ReportListPage from './pages/ReportListPage';
import ReportDetailPage from './pages/ReportDetailPage';
import CreateReportPage from './pages/CreateReportPage';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/reports" replace />} />
          <Route path="/reports" element={<ReportListPage />} />
          <Route path="/reports/:id" element={<ReportDetailPage />} />
          <Route path="/create" element={<CreateReportPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}