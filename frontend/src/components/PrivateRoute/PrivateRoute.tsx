import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store/store';

const PrivateRoute = () => {
  const { isAuthenticated, authStatus } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (authStatus === 'unknown') {
    return null;
  }

  if (isAuthenticated) {
    return <Outlet />;
  }

  const next = encodeURIComponent(`${location.pathname}${location.search}`);
  return <Navigate to={`/login?next=${next}`} replace />;
}

export default PrivateRoute;