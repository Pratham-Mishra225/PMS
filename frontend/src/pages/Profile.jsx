import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-4">
                    <div className="card">
                        <div className="card-header bg-primary text-white">
                            <h4 className="mb-0">Profile</h4>
                        </div>
                        <div className="card-body text-center">
                            <div className="mb-4">
                                <div className="bg-secondary rounded-circle d-inline-flex align-items-center justify-content-center"
                                     style={{ width: '80px', height: '80px' }}>
                                    <span className="text-white fs-1">
                                        {user?.username?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label text-muted">Username</label>
                                <h5>{user?.username}</h5>
                            </div>
                            <div className="mb-4">
                                <label className="form-label text-muted">Role</label>
                                <h5>
                                    <span className={`badge ${user?.role === 'ADMIN' ? 'bg-danger' : 'bg-primary'}`}>
                                        {user?.role}
                                    </span>
                                </h5>
                            </div>
                            <button
                                className="btn btn-danger w-100"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;

