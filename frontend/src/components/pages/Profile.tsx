import { useAuth } from '../../contexts/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  if (!user) return <div>No autenticado</div>;
  return (
    <div>
      <h2>Perfil</h2>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}
