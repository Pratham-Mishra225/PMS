import { createBrowserRouter, Navigate, RouterProvider, Outlet } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Inventory from './pages/Inventory';
import POS from './pages/POS';
import Profile from './pages/Profile';
import 'bootstrap/dist/css/bootstrap.min.css';

function Layout() {
  return (
    <AuthProvider>
      <div className="app-shell">
        <Navbar />
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </AuthProvider>
  );
}

const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      children: [
        { path: '/login', element: <Login /> },
        { path: '/inventory', element: <ProtectedRoute><Inventory /></ProtectedRoute> },
        { path: '/pos', element: <ProtectedRoute><POS /></ProtectedRoute> },
        { path: '/profile', element: <ProtectedRoute><Profile /></ProtectedRoute> },
        { path: '/', element: <Navigate to="/inventory" replace /> },
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
