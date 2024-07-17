import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SeatChart from './components/SeatChart';
import HomePage from './components/HomePage';

const App = () => {
  return (
    <div>
      <nav className="navbar fixed-top bg-dark">
        <div className="container-fluid">
          <div className="navbar-brand text-light">SmartSeating 座位管理系统</div>
        </div>
      </nav>
      <div>
      </div>
      <Router>
        <Routes>
            <Route path="/seat-chart" element={<SeatChart />} />
            <Route path="/home-page" element={<HomePage />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
