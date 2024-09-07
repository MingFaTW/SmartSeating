import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import DesignSeatChart from './components/DesignSeatChart';
import Invigilation from './components/Invigilation';
import HomePage from './components/HomePage';
import AddSeatInfo from './components/AddSeatInfo';


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
            <Route path="/DesignSeatChart" element={<DesignSeatChart />} />
            <Route path="/Invigilation" element={<Invigilation />} />
            <Route path="/HomePage" element={<HomePage />} />
            <Route path="/AddSeatInfo" element={<AddSeatInfo />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
