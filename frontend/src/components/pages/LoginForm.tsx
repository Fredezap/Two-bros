import { useState, useEffect } from 'react';
import { resendVerification } from '../../services/api/auth';
import axios from '../../api/axios';
import { EyeIcon, EyeOffIcon } from '../common/EyeIcons';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLogin } from '../../hooks/useAuthActions';
import { toast } from 'react-toastify';
import ROUTES from '../../stores/routes';

export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  // location.state puede ser undefined, así que lo tipificamos
  const navState = location.state as (undefined | { email?: string; subject?: string; message?: string; error?: string; showResend?: boolean });
  // Autocompletar email y subject desde query param o location.state
  const getInitialEmail = () => {
    if (navState && navState.email) return navState.email;
    const params = new URLSearchParams(location.search);
    return params.get('email') || '';
  };
  const getInitialSubject = () => {
    if (navState && navState.subject) return navState.subject;
    const params = new URLSearchParams(location.search);
    return params.get('subject') || '';
  };
  const [email, setEmail] = useState(getInitialEmail());
  const [subject] = useState(getInitialSubject());
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [unlockAt, setUnlockAt] = useState<string | null>(null);
  // Eliminar showResend, ahora se decide por subject o errorCode
  const [resendLoading, setResendLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // Forzar render inmediato del cartel de bloqueo si unlockAt y errorCode cambian tras el último intento
  useEffect(() => {
    if (errorCode === 'ACCOUNT_LOCKED' && unlockAt) {
      setError(''); // Limpiar cualquier error para que solo se muestre el cartel de bloqueo
    }
  }, [errorCode, unlockAt]);
  // Log en cada render para ver el valor actualizado de los estados
  useEffect(() => {
  });
  const login = useLogin();
  const { user } = useAuth();
  // Si el usuario ya está autenticado, redirigir a la home
  if (user) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  function getDeviceId() {
    let id = localStorage.getItem('deviceId');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('deviceId', id);
    }
    return id;
  }

  function getDeviceName() {
    return navigator.userAgent;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const loginResult = await login({
        email,
        password,
        deviceId: getDeviceId(),
        deviceName: getDeviceName(),
      });
      toast.success('¡Bienvenido de nuevo!');
      navigate('/');
      setErrorCode('');
      setUnlockAt(null);
    } catch (err) {
      let msg = err?.message || 'Error al iniciar sesión';
      let attemptsMsg = '';
      setErrorCode('');
      setUnlockAt(null);
      if (err?.response?.data) {
        const data = err.response.data;
        msg = data.message || msg;
        // Si la cuenta ya está bloqueada o acaba de bloquearse en este intento
        if ((data.code === 'ACCOUNT_LOCKED' && msg.toLowerCase().includes('bloqueada')) || (data.remainingAttempts === 0 && msg.toLowerCase().includes('bloqueada'))) {
          setErrorCode('ACCOUNT_LOCKED');
          setUnlockAt(data.unlockAt || null);
          setError(''); // Limpiar error para que solo se muestre el cartel de bloqueo
        } else if (data.remainingAttempts === 1) {
          setError('¡Último intento antes de que tu cuenta se bloquee!');
          setErrorCode('');
          setUnlockAt(null);
        } else {
          setErrorCode('');
          setUnlockAt(null);
          if (data.remainingAttempts !== undefined) {
            setError(`Te quedan ${data.remainingAttempts} intento${data.remainingAttempts === 1 ? '' : 's'}`);
            // IMPORTANTE: El siguiente log muestra el valor ANTERIOR del estado, porque setError es asíncrono
          }
          if (data.code === 'EMAIL_NOT_VERIFIED') {
            setErrorCode('EMAIL_NOT_VERIFIED');
          }
        }
      }
      toast.error(msg === 'Credenciales inválidas' ? 'Credenciales inválidas' : msg);
    }
  };

  // Mostrar mensaje de éxito si viene en location.state.message
  const verifySuccessMsg = location.state && location.state.message;
  const verifyError = location.state && location.state.error;
  // Si venimos de UnlockAccount con error, mostrar el cartel de reenviar
  const unlockShowResend = location.state && location.state.showResend;
  // No usar showResend, la lógica ahora depende de subject y errorCode

  // Reenvía código de verificación
  const handleResendVerification = async (email: string) => {
    if (!email) {
      toast.error('Por favor ingresa tu email.');
      return;
    }
    try {
      const res = await resendVerification({ email });
      const msg = res?.data?.message || 'Correo de verificación reenviado. Revisa tu bandeja de entrada. Si no ves el email, revisa tu buzón de spam.';
      if (res?.data?.success === false) {
        toast.error(msg);
      } else {
        toast.success(msg);
      }
    } catch (e) {
      toast.error('No se pudo reenviar el correo de verificación.');
    } finally {
      setResendLoading(false);
    }
  };

  // Reenvía email para desbloquear cuenta
  const handleResendUnlock = async (email: string) => {
    if (!email) {
      toast.error('Por favor ingresa tu email.');
      return;
    }
    setUnlockLoading(true);
    try {
      const res = await axios.post('/users/send-unlock-email', { email });
      const msg = res?.data?.message || 'Se ha enviado un email para desbloquear tu cuenta. Si no ves el email, revisa tu buzón de spam.';
      if (res?.data?.success === false) {
        toast.error(msg);
      } else {
        toast.success(msg);
      }
    } catch (e) {
      toast.error('No se pudo enviar el email de desbloqueo.');
    } finally {
      setUnlockLoading(false);
    }
  };

  // Limpiar el estado de navegación después de mostrar el mensaje
  if (verifyError && window.history.replaceState) {
    window.history.replaceState({}, document.title, location.pathname);
  }
  return (
    <div className="max-w-sm mx-auto mt-8 p-4 bg-white rounded shadow">
      {verifySuccessMsg && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded text-center">
          {verifySuccessMsg}
        </div>
      )}
      {verifyError && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded text-center">
          {verifyError}
          {verifyError.toLowerCase().includes('token inválido o expirado') && (
            <button
              className="w-full bg-yellow-700 hover:bg-yellow-800 text-white p-2 rounded transition mt-2 disabled:opacity-50"
              disabled={resendLoading}
              onClick={async () => {
                setResendLoading(true);
                await handleResendVerification(email);
              }}
            >
              {resendLoading ? 'Enviando...' : 'Reenviar código de verificación'}
            </button>
          )}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <h2 className="text-xl mb-4">Iniciar sesión</h2>
        <input type="email" placeholder="Email" value={email} onChange={e => { setEmail(e.target.value); setResendLoading(false); }} className="w-full mb-2 p-2 border rounded" required />
        <div className="relative mb-2">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-2 border rounded pr-10"
            required
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? <EyeIcon className="w-5 h-5" /> : <EyeOffIcon className="w-5 h-5" />}
          </button>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="flex-1 bg-indigo-600 text-white p-2 rounded">Ingresar</button>
          {/* Mostrar botón de verificación solo si subject=verify o errorCode === 'EMAIL_NOT_VERIFIED' */}
          {(subject === 'verify' || errorCode === 'EMAIL_NOT_VERIFIED') && (
            <button
              type="button"
              className="flex-1 bg-blue-600 text-white p-2 rounded disabled:opacity-50"
              disabled={resendLoading}
              onClick={async () => {
                setResendLoading(true);
                await handleResendVerification(email);
              }}
            >
              {resendLoading ? 'Enviando...' : 'Reenviar código de verificación'}
            </button>
          )}
          {/* Mostrar botón de desbloqueo si subject=unlock o si la cuenta está bloqueada, pero NO si el bloqueo es inmediato tras el último intento fallido */}
          {(subject === 'unlock' || (errorCode === 'ACCOUNT_LOCKED' && unlockAt && error !== '')) && (
            <button
              type="button"
              className="flex-1 bg-yellow-700 text-white p-2 rounded disabled:opacity-50"
              disabled={unlockLoading}
              onClick={async () => {
                await handleResendUnlock(email);
              }}
            >
              {unlockLoading ? 'Enviando...' : 'Reenviar email'}
            </button>
          )}
        </div>
      </form>
      <div className="mt-4 text-center text-sm text-gray-600">
          <button
            className="text-blue-600 hover:underline"
            type="button"
            onClick={() => {
              if (email) {
                navigate(`${ROUTES.FORGOT_PASSWORD}?email=${encodeURIComponent(email)}`);
              } else {
                navigate(ROUTES.FORGOT_PASSWORD);
              }
            }}
          >
            ¿Olvidaste tu contraseña?
          </button>
      </div>
      {errorCode === 'EMAIL_NOT_VERIFIED' && (
        <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded text-center">
          Debes verificar tu email antes de iniciar sesión.<br />
          <button
            className="w-full bg-yellow-700 hover:bg-yellow-800 text-white p-2 rounded transition mt-2 disabled:opacity-50"
            disabled={resendLoading}
            onClick={async () => {
              setResendLoading(true);
              await handleResendVerification(email);
            }}
          >
            {resendLoading ? 'Enviando...' : 'Reenviar código de verificación'}
          </button>
        </div>
      )}
      {/* unlockShowResend eliminado: ya no se muestra nada aquí */}
      {/* Cartel de cuenta bloqueada solo si errorCode === 'ACCOUNT_LOCKED' y unlockAt */}
      {errorCode === 'ACCOUNT_LOCKED' && unlockAt && (
        <div className="mt-4 p-3 bg-orange-100 text-orange-800 rounded text-center">
          <strong>Por razones de seguridad, después de varios intentos fallidos tu cuenta se bloqueó.</strong><br />
          {(() => {
            const ms = new Date(unlockAt).getTime() - Date.now();
            const min = Math.ceil(ms / 60000);
            return `Bloqueada por ${min > 1 ? min + ' minutos' : '1 minuto'}.`;
          })()}<br />
          <span>Puedes esperar hasta {new Date(unlockAt).toLocaleTimeString()} o usar el botón "Reenviar email".</span><br />
          <span>Se envió un email para recuperar el acceso.</span>
        </div>
      )}
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-800 rounded text-center">
          {error}
        </div>
      )}
    </div>
  );
}
