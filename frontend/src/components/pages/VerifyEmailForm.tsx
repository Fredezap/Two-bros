import { useEffect, useState } from 'react';
import { useVerifyEmail } from '../../hooks/useAuthActions';
import { resendVerification } from '../../services/api/auth';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';


export default function VerifyEmailForm({ token }: { token: string }) {
  const verifyEmail = useVerifyEmail();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'pending'|'success'|'expired'|'error'|'already'>('pending');
  const [loading, setLoading] = useState(true);
  const [resendLoading, setResendLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await verifyEmail({ token });
        // LOG de respuesta del backend
        // eslint-disable-next-line no-console
        console.log('Respuesta backend verifyEmail:', res);
        const msg = res?.data?.message || '';
        if (msg.toLowerCase().includes('ya está verificado')) {
          setStatus('already');
          toast.info('El email ya está verificado.');
          setTimeout(() => navigate('/login', { replace: true, state: { verified: true } }), 2000);
        } else if (msg.toLowerCase().includes('expirado')) {
          setStatus('expired');
        } else if (msg.toLowerCase().includes('verificado correctamente')) {
          setStatus('success');
          toast.success('¡Email verificado correctamente! Ya puedes iniciar sesión.');
          setTimeout(() => navigate('/login', { replace: true, state: { verified: true } }), 2000);
        } else {
          setStatus('error');
          setErrorMsg(msg || 'Error al verificar el email');
        }
      } catch (err) {
        // LOG de error del backend
        // eslint-disable-next-line no-console
        console.error('Error verifyEmail:', err, err?.response?.data);
        const msg = err?.response?.data?.message || 'Error al verificar el email';
        setErrorMsg(msg);
        if (msg.toLowerCase().includes('expirado')) {
          setStatus('expired');
        } else if (msg.toLowerCase().includes('ya está verificado')) {
          setStatus('already');
          toast.info('El email ya está verificado.');
          setTimeout(() => navigate('/login', { replace: true }), 2000);
        } else {
          setStatus('error');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [token, verifyEmail, navigate]);

  if (loading) return <div className="max-w-sm mx-auto mt-8 p-4 bg-white rounded shadow text-center">Verificando email...</div>;


  if (status === 'success') {
    return <div className="max-w-sm mx-auto mt-8 p-4 bg-green-100 text-green-800 rounded text-center">¡Email verificado correctamente! Redirigiendo al login...</div>;
  }
  if (status === 'already') {
    return <div className="max-w-sm mx-auto mt-8 p-4 bg-blue-100 text-blue-800 rounded text-center">El email ya está verificado. Redirigiendo al login...</div>;
  }

  if (status === 'expired') {
    return (
      <div className="max-w-sm mx-auto mt-8 p-4 bg-red-100 text-red-800 rounded text-center">
        El enlace de verificación expiró.<br />
        <input
          type="email"
          placeholder="Tu email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full mt-3 p-2 border rounded"
        />
        <button
          className="w-full mt-2 bg-blue-600 text-white p-2 rounded disabled:opacity-50"
          disabled={resendLoading || !email}
          onClick={async () => {
            setResendLoading(true);
            try {
              await resendVerification({ email });
              toast.success('Correo de verificación reenviado. Revisa tu bandeja de entrada.');
            } catch {
              toast.error('No se pudo reenviar el correo de verificación.');
            } finally {
              setResendLoading(false);
            }
          }}
        >
          {resendLoading ? 'Enviando...' : 'Reenviar código de verificación'}
        </button>
      </div>
    );
  }

  return <div className="max-w-sm mx-auto mt-8 p-4 bg-red-100 text-red-800 rounded text-center">{errorMsg || 'Error al verificar el email.'}</div>;
}
