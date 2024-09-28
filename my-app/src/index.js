import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App';
import Project from './components/project';

const tabs = [
  'android',
  'quimesis',
  'kusmitea',
  'datascience',
  'web',
  'programming',
  'embedded',
  'robotics'
];

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        {tabs.map(tab => (
          <Route key={tab} path={`/${tab}`} element={<Project tab={tab} />} />
        ))}
      </Routes>
    </Router>
  </React.StrictMode>
);