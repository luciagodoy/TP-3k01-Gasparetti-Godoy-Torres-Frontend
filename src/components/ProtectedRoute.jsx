import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user.role)) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h2>Acceso restringido</h2>
        </div>
        <div className="alert alert-error">
          Tu cuenta ({user.role}) no tiene permiso para ver esta sección.
        </div>
      </div>
    );
  }
  return <Outlet />;
}
