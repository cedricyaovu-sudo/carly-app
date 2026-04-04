import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute = ({ children }) => {
    const { profile, loading } = useAuth();

    if (loading) {
        return <div className="container" style={{ height: '100dvh' }} />;
    }

    if (profile?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children ? children : <Outlet />;
};

export default AdminRoute;
