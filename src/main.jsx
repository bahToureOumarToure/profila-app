import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
// Polices haute qualité (Inter) chargées localement — rendu net à l'écran et au PDF.
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
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
