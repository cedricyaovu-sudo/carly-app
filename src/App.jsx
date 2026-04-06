import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { BookingProvider } from './contexts/BookingContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { GameProvider } from './contexts/GameContext';
import { PaymentProvider } from './contexts/PaymentContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import { useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { ToastContainer } from './components/ui/Toast';
import { LoadingOverlay } from './components/ui/LoadingSpinner';
import ScrollToTop from './components/ui/ScrollToTop';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import NewService from './pages/NewService';
import ServiceDetails from './pages/ServiceDetails';
import AppointmentDetails from './pages/AppointmentDetails';
import SelectDateTime from './pages/SelectDateTime';
import Checkout from './pages/Checkout';
import PaymentMethods from './pages/PaymentMethods';
import PrivacyPolicy from './pages/PrivacyPolicy';
import MyVehicles from './pages/MyVehicles';
import AddVehicle from './pages/AddVehicle';
import Notifications from './pages/Notifications';
import MyAccount from './pages/MyAccount';
import HelpSupport from './pages/HelpSupport';
import MyAppointments from './pages/MyAppointments';
import DetailingService from './pages/DetailingService';
import EVRecharging from './pages/EVRecharging';
import OrderSummary from './pages/OrderSummary';
import AppointmentView from './pages/AppointmentView';
import DetailingAppointmentView from './pages/DetailingAppointmentView';
import MaintenanceService from './pages/MaintenanceService';
import PaintCorrection from './pages/PaintCorrection';
import CeramicCoating from './pages/CeramicCoating';
import Chat from './pages/Chat';
import CarMeets from './pages/CarMeets';
import SnacksMarketplace from './pages/SnacksMarketplace';
import GamesHub from './pages/games/GamesHub';
import DreamCar from './pages/games/DreamCar';
import ReferralRace from './pages/games/ReferralRace';
import MechanicSimulator from './pages/games/MechanicSimulator';
import CarRacer from './pages/games/CarRacer';
import CarTrivia from './pages/games/CarTrivia';
import Onboarding from './pages/Onboarding';
import Paywall from './pages/Paywall';
import PaywallCheckout from './pages/PaywallCheckout';
import ForgotPassword from './pages/ForgotPassword';
import ReviewPrompt from './pages/ReviewPrompt';
import PostCheckoutSuccess from './pages/PostCheckoutSuccess';

const OnboardingGuard = () => {
  const { user, profile, loading } = useAuth();
  
  if (loading) return null;

  if (!user) {
    return <Navigate to="/onboarding" replace />;
  }

  if (user && !profile) return null;

  if (profile?.role === 'admin') return <Outlet />;

  if (user && profile && !profile.onboarding_completed) {
    return <Navigate to="/onboarding" replace />;
  }
  return <Outlet />;
};

const ProGuard = ({ children }) => {
  const { user, profile, loading } = useAuth();
  
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user && !profile) return null;

  if (profile?.role === 'admin') return children;

  return children;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <PaymentProvider>
          <BookingProvider>
            <ThemeProvider>
              <GameProvider>
                <ToastContainer />
                <BrowserRouter>
                  <ScrollToTop />
                <Routes>
                  {/* Public routes - no auth required */}
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/paywall" element={<Paywall />} />
                  <Route path="/paywall-checkout" element={<PaywallCheckout />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/success" element={<PostCheckoutSuccess />} />
                  <Route path="/review" element={<ReviewPrompt />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />

                  {/* OnboardingGuard: requires auth + onboarding_completed */}
                  <Route element={<OnboardingGuard />}>
                    <Route path="/" element={<ProGuard><Home /></ProGuard>} />
                    <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                      <Route path="/new-service" element={<NewService />} />
                      <Route path="/details" element={<ServiceDetails />} />
                      <Route path="/select-date-time" element={<SelectDateTime />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/payment-methods" element={<PaymentMethods />} />
                      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                      <Route path="/appointment" element={<AppointmentDetails />} />
                      <Route path="/my-vehicles" element={<MyVehicles />} />
                      <Route path="/add-vehicle" element={<AddVehicle />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/account" element={<MyAccount />} />
                      <Route path="/help" element={<HelpSupport />} />
                      <Route path="/appointments" element={<MyAppointments />} />
                      <Route path="/detailing" element={<DetailingService />} />
                      <Route path="/ev-recharging" element={<EVRecharging />} />
                      <Route path="/order-summary" element={<OrderSummary />} />
                      <Route path="/appointment-view" element={<AppointmentView />} />
                      <Route path="/detailing-appointment-view" element={<DetailingAppointmentView />} />
                      <Route path="/maintenance" element={<MaintenanceService />} />
                      <Route path="/mechanic" element={<MaintenanceService />} />
                      <Route path="/paint-correction" element={<PaintCorrection />} />
                      <Route path="/ceramic-coating" element={<CeramicCoating />} />
                      <Route path="/chat" element={<Chat />} />
                      <Route path="/snacks" element={<SnacksMarketplace />} />
                      <Route path="/meets" element={<CarMeets />} />
                      <Route path="/games" element={<GamesHub />} />
                      <Route path="/games/dream-car" element={<DreamCar />} />
                      <Route path="/games/referral-race" element={<ReferralRace />} />
                      <Route path="/games/simulator" element={<MechanicSimulator />} />
                      <Route path="/games/racer" element={<CarRacer />} />
                      <Route path="/games/trivia" element={<CarTrivia />} />
                    </Route>
                  </Route>

                  <Route path="*" element={<Navigate to="/onboarding" replace />} />
                </Routes>
              </BrowserRouter>
            </GameProvider>
            </ThemeProvider>
          </BookingProvider>
        </PaymentProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
