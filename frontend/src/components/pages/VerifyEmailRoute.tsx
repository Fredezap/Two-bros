import { useParams, useSearchParams } from 'react-router-dom';
import VerifyEmailForm from './VerifyEmailForm';

export default function VerifyEmailRoute() {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || undefined;
  if (!token) return <div>Token inválido</div>;
  return <VerifyEmailForm token={token} email={email} />;
}