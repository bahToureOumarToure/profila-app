import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AppThemeProvider } from '@context/ThemeContext';
import { CVProvider } from '@context/CVContext';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <AppThemeProvider>
          <CVProvider>
            <App />
          </CVProvider>
        </AppThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
