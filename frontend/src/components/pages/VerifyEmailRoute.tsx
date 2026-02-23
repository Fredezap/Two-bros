import { useParams } from 'react-router-dom';
import VerifyEmailForm from './VerifyEmailForm';

export default function VerifyEmailRoute() {
  const { token } = useParams<{ token: string }>();
  if (!token) return <div>Token inválido</div>;
  return <VerifyEmailForm token={token} />;
}