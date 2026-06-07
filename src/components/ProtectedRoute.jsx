import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const isAuthenticated = sessionStorage.getItem('isAdminAuthenticated') === 'true';
  const adminUser = sessionStorage.getItem('adminUser');

  if (!isAuthenticated || !adminUser) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
