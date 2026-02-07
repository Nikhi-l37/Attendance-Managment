
import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { Role } from './types';
import { LoginScreen } from './screens/LoginScreen';
import { AdminDashboard } from './screens/AdminDashboard';
import { TeacherDashboard } from './screens/TeacherDashboard';
import { StudentDashboard } from './screens/StudentDashboard';

const AppContent: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 animate-fadeIn">
                <div className="text-center animate-scaleIn">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4 animate-pulse-glow"></div>
                    <p className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent animate-pulse">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <LoginScreen />;
    }

    switch (user.role) {
        case Role.ADMIN:
            return <AdminDashboard />;
        case Role.TEACHER:
            return <TeacherDashboard />;
        case Role.STUDENT:
            return <StudentDashboard />;
        default:
            return <LoginScreen />;
    }
};


const App: React.FC = () => {
  return (
    <AuthProvider>
        <AppContent />
    </AuthProvider>
  );
};

export default App;
