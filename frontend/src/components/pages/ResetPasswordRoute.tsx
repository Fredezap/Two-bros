import { useParams } from 'react-router-dom';
import ResetPasswordForm from './ResetPasswordForm';

export default function ResetPasswordRoute() {
  const { token } = useParams<{ token: string }>();
  if (!token) return <div>Token inválido</div>;
  return <ResetPasswordForm token={token} />;
}