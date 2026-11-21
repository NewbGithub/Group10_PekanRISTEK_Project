import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ReportListPage from './pages/ReportListPage';
import ReportDetailPage from './pages/ReportDetailPage';
import CreateReportPage from './pages/CreateReportPage';
import HomePage from './pages/HomePage';

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Hash links are handled by the page that owns the target section.
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/reports" element={<ReportListPage />} />
            <Route path="/reports/:id" element={<ReportDetailPage />} />
            <Route path="/create" element={<CreateReportPage />} />
          </Routes>
        </main>
        <footer className="flex flex-col items-start gap-1 px-4 py-4 border-t border-gray-300 bg-white text-sm text-gray-500 md:flex-row md:justify-between md:items-center">
          <span className="font-medium text-gray-800">TitleName</span>
        </footer>
      </div>
    </BrowserRouter>
  );
}
