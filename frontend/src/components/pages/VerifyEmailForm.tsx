import { useEffect, useRef } from 'react';
import { useVerifyEmail } from '../../hooks/useAuthActions';
import { useNavigate } from 'react-router-dom';

export default function VerifyEmailForm({ token, email }: { token: string; email?: string }) {
  const verifyEmail = useVerifyEmail();
  const navigate = useNavigate();
  const hasVerified = useRef<string | null>(null);

  useEffect(() => {
    if (hasVerified.current === token) return;
    hasVerified.current = token;
    (async () => {
      try {
        const res = await verifyEmail({ token });
        const msg = res?.data?.message || '';
        if (msg.toLowerCase().includes('ya está verificado')) {
          navigate('/login', { replace: true, state: { error: 'El email ya estaba verificado. Inicia sesión.', type: 'error', email } });
        } else if (msg.toLowerCase().includes('expirado')) {
          navigate('/login', { replace: true, state: { error: 'El enlace de verificación expiró. Solicita uno nuevo.', type: 'error', email } });
        } else if (msg.toLowerCase().includes('verificado correctamente')) {
          navigate('/login', { replace: true, state: { message: '¡Email verificado correctamente! Ya puedes iniciar sesión.', type: 'success', email } });
        } else {
          navigate('/login', { replace: true, state: { error: msg || 'Error al verificar el email.', type: 'error', email } });
        }
      } catch (err) {
        const msg = err?.response?.data?.message || 'Error al verificar el email';
        navigate('/login', { replace: true, state: { error: msg, type: 'error', email } });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, email]);

  return null;
}