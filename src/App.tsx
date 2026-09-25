import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, PublicOnlyRoute, RootRedirect } from './components/routing/ProtectedRoute';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { SetupGuide } from './components/SetupGuide';

// Layouts
const UserLayout = lazy(() => import('./layouts/UserLayout'));
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));

// Public pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// User pages
const HomePage = lazy(() => import('./pages/user/HomePage'));
const OurStoryPage = lazy(() => import('./pages/user/OurStoryPage'));
const MyAnswersPage = lazy(() => import('./pages/user/MyAnswersPage'));
const MessagesPage = lazy(() => import('./pages/user/MessagesPage'));
const NotificationsPage = lazy(() => import('./pages/user/NotificationsPage'));
const ProfilePage = lazy(() => import('./pages/user/ProfilePage'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminConversations = lazy(() => import('./pages/admin/AdminConversations'));
const AdminMessages = lazy(() => import('./pages/admin/AdminMessages'));
const AdminQuestions = lazy(() => import('./pages/admin/AdminQuestions'));
const AdminResponses = lazy(() => import('./pages/admin/AdminResponses'));
const AdminNotifications = lazy(() => import('./pages/admin/AdminNotifications'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminProfile = lazy(() => import('./pages/admin/AdminProfile'));

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-center"
          gutter={12}
          containerStyle={{ zIndex: 9999 }}
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(26, 10, 46, 0.95)',
              color: '#f0e6ff',
              border: '1px solid rgba(244, 63, 94, 0.2)',
              backdropFilter: 'blur(16px)',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: "'Lato', sans-serif",
              padding: '12px 16px',
            },
            success: {
              iconTheme: { primary: '#f43f5e', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />

        <SetupGuide />
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Public routes */}
            <Route
              path="/"
              element={
                <PublicOnlyRoute>
                  <LandingPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/auth"
              element={
                <PublicOnlyRoute>
                  <AuthPage />
                </PublicOnlyRoute>
              }
            />

            {/* Auto-redirect based on role */}
            <Route path="/dashboard" element={<RootRedirect />} />

            {/* User App */}
            <Route
              path="/app"
              element={
                <ProtectedRoute requireRole="user">
                  <UserLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<HomePage />} />
              <Route path="our-story" element={<OurStoryPage />} />
              <Route path="my-answers" element={<MyAnswersPage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Admin Portal */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireRole="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="responses" element={<AdminResponses />} />
              <Route path="conversations" element={<AdminConversations />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="questions" element={<AdminQuestions />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="profile" element={<AdminProfile />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
