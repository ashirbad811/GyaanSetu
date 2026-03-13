import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import PostDetails from './pages/PostDetails';
import Following from './pages/Following';
import Activity from './pages/Activity';
import Chat from './pages/Chat';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import CreateBlog from './pages/CreateBlog';
import AdminDashboard from './pages/AdminDashboard';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <AuthProvider>
            <Router>
                <MainLayout>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/explore" element={<Explore />} />
                        <Route path="/post/:slug" element={<PostDetails />} />
                        <Route path="/profile/:id" element={<Profile />} />
                        <Route path="/profile" element={<ProfileRedirect />} />
                        <Route path="/create-blog" element={<ProtectedRoute><CreateBlog /></ProtectedRoute>} />
                        <Route path="/following" element={<ProtectedRoute><Following /></ProtectedRoute>} />
                        <Route path="/activity" element={<Activity />} />
                        <Route path="/chat" element={<Chat />} />
                        <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                    </Routes>
                </MainLayout>
            </Router>
        </AuthProvider>
    );
}

const ProfileRedirect = () => {
    const { user, loading } = useAuth();
    if (loading) return null;
    return user ? <Navigate to={`/profile/${user.id}`} replace /> : <Navigate to="/login" replace />;
};

export default App;
