import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '@/layouts/public-layout';
import { AppLayout } from '@/layouts/app-layout';
import { RequireAuth } from '@/components/require-auth';
import { PageSpinner } from '@/components/page-spinner';
import Landing from '@/pages/landing';
import PricingPage from '@/pages/pricing';
import { LoginPage, SignupPage, ForgotPasswordPage, ResetPasswordPage, AuthCallbackPage } from '@/pages/auth';
import Dashboard from '@/pages/dashboard';
import Designs from '@/pages/designs';
import ComingSoon from '@/pages/coming-soon';
import SettingsPage from '@/pages/settings';
import NotFound from '@/pages/not-found';

// The editors pull in Fabric.js, so load them only when opened
const FlyerEditorPage = lazy(() => import('@/pages/flyer-editor'));
const PhotoEditorPage = lazy(() => import('@/pages/photo-editor'));

export default function App() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Landing />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
        </Route>
        <Route path="auth/callback" element={<AuthCallbackPage />} />

        <Route path="app" element={<RequireAuth><AppLayout /></RequireAuth>}>
          <Route index element={<Dashboard />} />
          <Route path="designs" element={<Designs />} />
          <Route path="soon/:slug" element={<ComingSoon />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="plans" element={<PricingPage inApp />} />
        </Route>
        <Route path="app/editor/:designId?" element={<RequireAuth><FlyerEditorPage /></RequireAuth>} />
        <Route path="app/photo-editor" element={<RequireAuth><PhotoEditorPage /></RequireAuth>} />

        <Route path="dashboard" element={<Navigate to="/app" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
