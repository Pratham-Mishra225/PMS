import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="route-loader" role="status" aria-live="polite">
                <div className="route-loader-card">
                    <div className="spinner-border" aria-hidden="true"></div>
                    <span>Loading your workspace...</span>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;

