import { useState } from 'react';
import { resendVerification } from '../../services/api/auth';
import { EyeIcon, EyeOffIcon } from '../common/EyeIcons';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../../hooks/useAuthActions';
import { toast } from 'react-toastify';
import ROUTES from '../../stores/routes';

import { useLocation, useNavigationType } from 'react-router-dom';

export default function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showResend, setShowResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const login = useLogin();
  const location = useLocation();

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
      await login({
        email,
        password,
        deviceId: getDeviceId(),
        deviceName: getDeviceName(),
      });
      toast.success('¡Bienvenido de nuevo!');
      navigate('/');
      setShowResend(false);
    } catch (err) {
      let msg = err?.message || 'Error al iniciar sesión';
      let attemptsMsg = '';
      setShowResend(false);
      if (err?.response?.data?.message) {
        msg = err.response.data.message;
        if (err.response.data.remainingAttempts !== undefined) {
          attemptsMsg = `Te quedan ${err.response.data.remainingAttempts} intentos`;
        }
        if (err.response.data.locked) {
          msg = 'Cuenta bloqueada. Revisa tu email para recuperarla o espera a que se desbloquee.';
          attemptsMsg = '';
        }
        if (msg === 'Debes verificar tu email antes de iniciar sesión') {
          setShowResend(true);
        }
      }
      setError(attemptsMsg || '');
      toast.error(msg === 'Credenciales inválidas' ? 'Credenciales inválidas' : msg);
    }
  };

  // Mostrar mensaje solo si la verificación fue exitosa (status === 'success')
  const verified = location.state && location.state.verified === true;

  // Limpiar el estado de navegación después de mostrar el mensaje
  if (verified && window.history.replaceState) {
    window.history.replaceState({}, document.title, location.pathname);
  }

  return (
    <div className="max-w-sm mx-auto mt-8 p-4 bg-white rounded shadow">
      {verified && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded text-center">
          ¡Email verificado correctamente! Ya puedes iniciar sesión.
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <h2 className="text-xl mb-4">Iniciar sesión</h2>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full mb-2 p-2 border rounded" required />
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
          {showResend && (
            <button
              type="button"
              className="flex-1 bg-blue-600 text-white p-2 rounded disabled:opacity-50"
              disabled={resendLoading}
              onClick={async () => {
                setResendLoading(true);
                try {
                  await resendVerification({ email });
                  toast.success('Correo de verificación reenviado. Revisa tu bandeja de entrada.');
                } catch (e) {
                  toast.error('No se pudo reenviar el correo de verificación.');
                } finally {
                  setResendLoading(false);
                }
              }}
            >
              {resendLoading ? 'Enviando...' : 'Reenviar código'}
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
      {error ? (
        <div className="mt-4 p-3 bg-red-100 text-red-800 rounded text-center">
          {error}
          {showResend && (
            <div className="mt-2">
              <button
                className="text-blue-600 hover:underline disabled:opacity-50"
                disabled={resendLoading}
                onClick={async () => {
                  setResendLoading(true);
                  try {
                    await resendVerification({ email });
                    toast.success('Correo de verificación reenviado. Revisa tu bandeja de entrada.');
                  } catch (e) {
                    toast.error('No se pudo reenviar el correo de verificación.');
                  } finally {
                    setResendLoading(false);
                  }
                }}
              >
                {resendLoading ? 'Enviando...' : 'Reenviar código de verificación'}
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
