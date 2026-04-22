import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiGrid, FiPackage, FiShoppingCart, FiUser } from 'react-icons/fi';
import { useAuth } from '../AuthContext';

const Navbar = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    if (!user) return null;

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="app-navbar">
            <div className="container-fluid app-navbar-inner">
                <Link className="app-brand" to="/inventory">
                    <span className="app-brand-icon" aria-hidden="true">
                        <FiGrid />
                    </span>
                    Pharmacy MS
                </Link>
                <button
                    className="app-nav-toggle"
                    type="button"
                    aria-label="Toggle navigation"
                    aria-expanded={isOpen}
                    onClick={() => setIsOpen((prev) => !prev)}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                <div className={`app-nav-content ${isOpen ? 'open' : ''}`}>
                    <ul className="app-nav-links">
                        <li>
                            <Link className={`app-nav-link ${isActive('/inventory') ? 'active' : ''}`} to="/inventory">
                                <FiPackage aria-hidden="true" />
                                Inventory
                            </Link>
                        </li>
                        <li>
                            <Link className={`app-nav-link ${isActive('/pos') ? 'active' : ''}`} to="/pos">
                                <FiShoppingCart aria-hidden="true" />
                                Point of Sale
                            </Link>
                        </li>
                    </ul>
                    <Link className={`app-user-link ${isActive('/profile') ? 'active' : ''}`} to="/profile">
                        <FiUser aria-hidden="true" />
                        <span className="app-user-name">{user.username}</span>
                        <span className="app-user-role">{user.role}</span>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

