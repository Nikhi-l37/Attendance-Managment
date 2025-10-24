
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
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
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
