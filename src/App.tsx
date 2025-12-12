import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { PricingPage } from './pages/PricingPage'
import { SuccessPage } from './pages/SuccessPage'
import { SearchPage } from './pages/SearchPage'
import { ProfilePage } from './pages/ProfilePage'
import { SettingsPage } from './pages/SettingsPage'
import { SubscriptionsPage } from './pages/SubscriptionsPage'
import { CallbackPage } from './pages/Auth/CallbackPage'
import { UserTypeSelectionPage } from './pages/Auth/UserTypeSelectionPage'
import { CompleteProfilePage } from './pages/Professional/CompleteProfilePage'
import { ProfessionalSignupPage } from './pages/Professional/ProfessionalSignupPage'
import { VerificationPage } from './pages/Professional/VerificationPage'
import { DashboardPage } from './pages/Professional/DashboardPage'
import { SitesDashboardPage } from './pages/Sites/DashboardPage'
import { SitesEditorPage } from './pages/Sites/EditorPage'
import { SitesDomainPage } from './pages/Sites/DomainPage'

function NavigationManager() {
  const navigate = useNavigate();

  useEffect(() => {
    (window as any).navigateToLogin = () => navigate('/login');
    (window as any).navigateToPlans = () => navigate('/pricing');
    (window as any).navigateToProfile = () => navigate('/profile');
    (window as any).navigateToSettings = () => navigate('/settings');
    (window as any).navigateToSubscriptions = () => navigate('/subscriptions');
    (window as any).navigateToProfessionalPanel = () => navigate('/professional/dashboard');
    (window as any).navigateToProfessionals = () => navigate('/professionals');
    (window as any).navigateToHome = () => navigate('/');

    (window as any).updateHeaderTokenCounter = (value: number) => {
      window.dispatchEvent(new CustomEvent('tervis:tokens:update', { detail: value }));
    };

    return () => {
      delete (window as any).navigateToLogin;
      delete (window as any).navigateToPlans;
      delete (window as any).navigateToProfile;
      delete (window as any).navigateToSettings;
      delete (window as any).navigateToSubscriptions;
      delete (window as any).navigateToProfessionalPanel;
      delete (window as any).navigateToProfessionals;
      delete (window as any).navigateToHome;
      delete (window as any).updateHeaderTokenCounter;
    };
  }, [navigate]);

  return null;
}

function App() {
  return (
    <Router>
      <NavigationManager />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/subscriptions" element={<SubscriptionsPage />} />
        <Route path="/auth/callback" element={<CallbackPage />} />
        <Route path="/user-type" element={<UserTypeSelectionPage />} />
        <Route path="/professional/signup" element={<CompleteProfilePage />} />
        <Route path="/professional/complete-profile" element={<CompleteProfilePage />} />
        <Route path="/professional/verification" element={<VerificationPage />} />
        <Route path="/professional/dashboard" element={<DashboardPage />} />
        <Route path="/sites/dashboard" element={<SitesDashboardPage />} />
        <Route path="/sites/editor" element={<SitesEditorPage />} />
        <Route path="/sites/domain" element={<SitesDomainPage />} />
      </Routes>
    </Router>
  )
}

export default App