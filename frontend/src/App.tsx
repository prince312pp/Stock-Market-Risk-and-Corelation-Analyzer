import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { StockAnalysis } from './pages/StockAnalysis';
import { CorrelationAnalysis } from './pages/CorrelationAnalysis';
import { PortfolioCalculator } from './pages/PortfolioCalculator';

export const App: React.FC = () => {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/stock-analysis" element={<StockAnalysis />} />
          <Route path="/correlation" element={<CorrelationAnalysis />} />
          <Route path="/portfolio" element={<PortfolioCalculator />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </Router>
  );
};

export default App;
