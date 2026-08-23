import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';

// Pages
import { Home } from './pages/Home';
import { Login } from './pages/auth/Login';
import { WorkerRegister } from './pages/auth/WorkerRegister';
import { CustomerRegister } from './pages/auth/CustomerRegister';
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { CustomerServices } from './pages/customer/CustomerServices';
import { EmergencyBooking } from './pages/customer/EmergencyBooking';
import { ActiveBookingTracker } from './pages/customer/ActiveBookingTracker';
import { CustomerHistory } from './pages/customer/CustomerHistory';
import { WorkerDashboard } from './pages/worker/WorkerDashboard';
import { WorkerActiveJob } from './pages/worker/WorkerActiveJob';
import { WorkerEarnings } from './pages/worker/WorkerEarnings';
import { WorkerWelfare } from './pages/worker/WorkerWelfare';
import { WorkerSchedule } from './pages/worker/WorkerSchedule';
import { CooperativeAdminDashboard } from './pages/admin/CooperativeAdminDashboard';
import { WorkerVerificationQueue } from './pages/admin/WorkerVerificationQueue';
import { ServicePricingManager } from './pages/admin/ServicePricingManager';
import { GrievanceInbox } from './pages/admin/GrievanceInbox';
import { CoopBroadcast } from './pages/admin/CoopBroadcast';
import { FederationDashboard } from './pages/federation/FederationDashboard';
import { DemandForecastingView } from './pages/federation/DemandForecastingView';
import { WorkforceAllocationMatrix } from './pages/federation/WorkforceAllocationMatrix';
import { FederationBroadcast } from './pages/federation/FederationBroadcast';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-xs font-bold text-slate-400">Loading user session...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <Router>
            <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans w-full max-w-full overflow-x-hidden">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/worker/register" element={<WorkerRegister />} />
                  <Route path="/customer/register" element={<CustomerRegister />} />
                  <Route path="/register" element={<CustomerRegister />} />

                  {/* Customer Routes */}
                  <Route path="/customer/services" element={<CustomerServices />} />
                  <Route path="/customer/service" element={<CustomerServices />} />
                  <Route path="/customer/emergency" element={<EmergencyBooking />} />
                  <Route path="/emergency" element={<EmergencyBooking />} />
                  <Route
                    path="/customer/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['customer']}>
                        <CustomerDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/customer/tracker/:id" element={<ActiveBookingTracker />} />
                  <Route
                    path="/customer/bookings"
                    element={
                      <ProtectedRoute allowedRoles={['customer']}>
                        <CustomerHistory />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/customer/booking"
                    element={
                      <ProtectedRoute allowedRoles={['customer']}>
                        <CustomerHistory />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/customer/history"
                    element={
                      <ProtectedRoute allowedRoles={['customer']}>
                        <CustomerHistory />
                      </ProtectedRoute>
                    }
                  />

                  {/* Worker Routes */}
                  <Route
                    path="/worker/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['worker']}>
                        <WorkerDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/worker/jobs/:id"
                    element={
                      <ProtectedRoute allowedRoles={['worker']}>
                        <WorkerActiveJob />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/worker/earnings"
                    element={
                      <ProtectedRoute allowedRoles={['worker']}>
                        <WorkerEarnings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/worker/welfare"
                    element={
                      <ProtectedRoute allowedRoles={['worker']}>
                        <WorkerWelfare />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/worker/schedule"
                    element={
                      <ProtectedRoute allowedRoles={['worker']}>
                        <WorkerSchedule />
                      </ProtectedRoute>
                    }
                  />

                  {/* Cooperative Admin Routes */}
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['coop_admin', 'fed_admin']}>
                        <CooperativeAdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/verifications"
                    element={
                      <ProtectedRoute allowedRoles={['coop_admin', 'fed_admin']}>
                        <WorkerVerificationQueue />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/pricing"
                    element={
                      <ProtectedRoute allowedRoles={['coop_admin', 'fed_admin']}>
                        <ServicePricingManager />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/grievances"
                    element={
                      <ProtectedRoute allowedRoles={['coop_admin', 'fed_admin']}>
                        <GrievanceInbox />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/broadcast"
                    element={
                      <ProtectedRoute allowedRoles={['coop_admin', 'fed_admin']}>
                        <CoopBroadcast />
                      </ProtectedRoute>
                    }
                  />

                  {/* Federation Admin Routes */}
                  <Route
                    path="/federation/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['fed_admin']}>
                        <FederationDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/federation/forecasting"
                    element={
                      <ProtectedRoute allowedRoles={['fed_admin', 'coop_admin']}>
                        <DemandForecastingView />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/federation/allocation"
                    element={
                      <ProtectedRoute allowedRoles={['fed_admin', 'coop_admin']}>
                        <WorkforceAllocationMatrix />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/federation/broadcast"
                    element={
                      <ProtectedRoute allowedRoles={['fed_admin']}>
                        <FederationBroadcast />
                      </ProtectedRoute>
                    }
                  />

                  {/* Catch-all fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
