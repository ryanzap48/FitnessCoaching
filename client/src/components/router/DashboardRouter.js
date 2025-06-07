// DashboardRouter.js
import { useAuth } from '../../contexts/AuthContext';
import UserDashboard from '../user/UserDashboard';
import AdminDashboard from '../admin/AdminDashboard';

export default function DashboardRouter() {
  const { role } = useAuth();

  if (role === 'admin') return <AdminDashboard />;
  return <UserDashboard />;
}