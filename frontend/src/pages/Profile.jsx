import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiShield, FiUser } from 'react-icons/fi';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="page-section">
            <div className="profile-shell">
                <div className="app-card">
                    <div className="p-4 p-md-5 text-center">
                        <div className="profile-avatar mb-3">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="mb-1">Your Profile</h2>
                        <p className="text-muted mb-4">Manage account details and session access.</p>

                        <div className="mb-3">
                            <p className="profile-meta-label">
                                <FiUser className="me-2" aria-hidden="true" /> Username
                            </p>
                            <p className="profile-meta-value">{user?.username}</p>
                        </div>

                        <div className="mb-4">
                            <p className="profile-meta-label">
                                <FiShield className="me-2" aria-hidden="true" /> Role
                            </p>
                            <p className="profile-meta-value">
                                <span className={`role-pill ${user?.role === 'ADMIN' ? 'role-pill-admin' : 'role-pill-pharmacist'}`}>
                                    {user?.role}
                                </span>
                            </p>
                        </div>

                        <button
                            className="btn btn-soft-danger w-100"
                            onClick={handleLogout}
                        >
                            <FiLogOut className="me-2" aria-hidden="true" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;

