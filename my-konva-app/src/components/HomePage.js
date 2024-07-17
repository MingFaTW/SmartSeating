import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import Swal from 'sweetalert2';
const HomePage = () => {
  useEffect(() => {
        Swal.fire({
            title: '歡迎進入SmartSeating ',
            text: 'SmartSeating 可用於管理座位，請選擇您的模式',
            input: 'select',
            inputOptions: {
              'seatChart': '規劃座位表模式',
              'Invigilation': '監考模式',
            },
            inputPlaceholder: '請選擇模式',
            inputValidator: (value) => {
              return new Promise((resolve) => {
                if (value === 'seatChart') {
                  window.location.href = 'http://localhost:3000/seat-chart';
                } else if (value === 'Invigilation') {
                  resolve('已選擇監考模式');
                } else {
                  resolve('請選擇一個模式');
                }
              });
            }
          });
  }, []);
  return (
    <div>
      <nav className="navbar fixed-top bg-dark">
        <div className="container-fluid">
        <Link to="/home-page" className="navbar-brand text-light">SmartSeating 座位管理系统</Link>        </div>
      </nav>
      <div>
      </div>
    </div>
  );
};

export default HomePage;
