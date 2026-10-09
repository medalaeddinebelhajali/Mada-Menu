import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { I18nProvider } from './lib/i18n';
import { AuthProvider } from './context/AuthContext';

import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { FeaturesPage } from './pages/public/FeaturesPage';
import { PricingPage } from './pages/public/PricingPage';
import { FaqPage } from './pages/public/FaqPage';
import { ContactPage } from './pages/public/ContactPage';
import { TermsPage, PrivacyPage, BillingPolicyPage } from './pages/public/LegalPages';
import { PublicMenuPage } from './pages/public/PublicMenuPage';

// Auth & Onboarding
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { OnboardingWizard } from './pages/auth/OnboardingWizard';

// Dashboard & Admin
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { SuperAdminDashboard } from './pages/admin/SuperAdminDashboard';

const PublicLayout: React.FC = () => (
  <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Marketing Website */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/billing-policy" element={<BillingPolicyPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Public QR Menu (No Navbar/Footer) */}
            <Route path="/m/:slug" element={<PublicMenuPage />} />

            {/* Onboarding Wizard */}
            <Route path="/onboarding" element={<OnboardingWizard />} />

            {/* Protected Merchant Dashboard */}
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Protected Super Admin Dashboard */}
            <Route path="/super-admin" element={<SuperAdminDashboard />} />

            {/* Fallback */}
            <Route path="*" element={<PublicMenuPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </I18nProvider>
  );
}

export default App;
