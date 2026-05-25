import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../store/store';

const PrivateRoute = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  
  // If not logged in, boot them to login. Otherwise, render the child route (Outlet).
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export default PrivateRoute;