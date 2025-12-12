import { Link } from 'react-router-dom';

export function UnauthorizedPage() {
  return (
    <main>
      <h1>Unauthorized</h1>
      <p>You don’t have access to this page.</p>
      <Link to="/login">Go to login</Link>
    </main>
  );
}
