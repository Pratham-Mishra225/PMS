import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiLogIn, FiUser } from 'react-icons/fi';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(username, password);
            navigate('/inventory');
        } catch (err) {
            const msg = err.response?.data?.message || 'Invalid username or password';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page page-section">
            <div className="auth-card">
                <div className="auth-card-header">
                    <p className="auth-kicker">Pharmacy Management System</p>
                    <h1>Welcome Back</h1>
                    <p className="auth-subtitle">Sign in to manage inventory and point-of-sale operations.</p>
                </div>
                <div className="auth-card-body">
                    {error && <div className="alert alert-danger mb-3">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label field-label">
                                <FiUser aria-hidden="true" /> Username
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                disabled={loading}
                                autoComplete="username"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="form-label field-label">
                                <FiLock aria-hidden="true" /> Password
                            </label>
                            <input
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                                autoComplete="current-password"
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-brand w-100"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Logging in...
                                </>
                            ) : (
                                <>
                                    <FiLogIn className="me-2" aria-hidden="true" />
                                    Login
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
