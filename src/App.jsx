import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import AppLayout from '@components/layout/AppLayout';

const HomePage    = lazy(() => import('@pages/HomePage'));
const BuilderPage = lazy(() => import('@pages/BuilderPage'));
const MentionsLegales           = lazy(() => import('@pages/MentionsLegales'));
const PolitiqueConfidentialite  = lazy(() => import('@pages/PolitiqueConfidentialite'));
const ConditionsUtilisation     = lazy(() => import('@pages/ConditionsUtilisation'));

function PageLoader() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress />
    </Box>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={
          <AppLayout>
            <HomePage />
          </AppLayout>
        } />
        <Route path="/builder" element={
          <AppLayout hideFooter>
            <BuilderPage />
          </AppLayout>
        } />
        <Route path="/mentions-legales" element={
          <AppLayout>
            <MentionsLegales />
          </AppLayout>
        } />
        <Route path="/politique-confidentialite" element={
          <AppLayout>
            <PolitiqueConfidentialite />
          </AppLayout>
        } />
        <Route path="/conditions-utilisation" element={
          <AppLayout>
            <ConditionsUtilisation />
          </AppLayout>
        } />
        {/* 404-redirect home */}
        <Route path="*" element={
          <AppLayout>
            <HomePage />
          </AppLayout>
        } />
      </Routes>
    </Suspense>
  );
}
