import { useNavigate } from 'react-router-dom';
import { clearAuth } from './authStore';

export function LogoutButton() {
  const navigate = useNavigate();

  function onLogout() {
    clearAuth();
    navigate('/login', { replace: true });
  }

  return (
    <button
      type="button"
      onClick={onLogout}
      style={{ padding: 10, marginTop: 12 }}>
      Sign out
    </button>
  );
}
