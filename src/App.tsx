import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Community from './components/Community';
import { Trackers } from './pages/Trackers';
import PostDetail from './pages/PostDetail';
import CreatePost from './pages/CreatePost';
import Login from './pages/Login';
import BottomNav from './components/BottomNav';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { PreferencesProvider } from './context/PreferencesContext';
import './App.css';
import { Profile } from './pages/Profile';
import { Consultations } from './pages/Consultations';
import { Articles } from './pages/Articles';
import { Onboarding } from './pages/Onboarding';
import { PeriodTracker } from './pages/PeriodTracker';
import { BabyWeightTracker } from './pages/BabyWeightTracker';
import { ComingSoon } from './pages/ComingSoon';
import { UpdatePrompt } from './components/UpdatePrompt';

// Component to handle authenticated routes
const AuthenticatedApp = () => {
  React.useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  return (
    <div className="min-h-screen bg-background relative isolate">
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-primary/30 to-background" />
      <div className="pb-14">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Community />
              </ProtectedRoute>
            }
          />
          {/* <Route
          path="/community"
          element={
            <ProtectedRoute>
              <Community />
            </ProtectedRoute>
          }
        /> */}
          <Route
            path="/create-post"
            element={
              <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
            }
          />
          <Route
            path="/post/:id"
            element={
              <ProtectedRoute>
                <PostDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trackers"
            element={
              <ProtectedRoute>
                <Trackers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trackers/period"
            element={
              <ProtectedRoute>
                <PeriodTracker />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trackers/baby-weight"
            element={
              <ProtectedRoute>
                <BabyWeightTracker />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trackers/coming-soon"
            element={
              <ProtectedRoute>
                <ComingSoon />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consult"
            element={
              <ProtectedRoute>
                <Consultations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/articles"
            element={
              <ProtectedRoute>
                <Articles />
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ProtectedRoute>
          <BottomNav />
        </ProtectedRoute>
        <UpdatePrompt />
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <PreferencesProvider>
          <ToastProvider>
            <AuthenticatedApp />
          </ToastProvider>
        </PreferencesProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
