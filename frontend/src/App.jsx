import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ReportListPage from './pages/ReportListPage';
import ReportDetailPage from './pages/ReportDetailPage';
import CreateReportPage from './pages/CreateReportPage';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';

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
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="w-full flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/reports" element={<ReportListPage />} />
            <Route path="/reports/:id" element={<ReportDetailPage />} />
            <Route path="/create" element={<CreateReportPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
