import { useState } from 'react';
import { EyeIcon, EyeOffIcon } from '../common/EyeIcons';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../../hooks/useAuthActions';
import { toast } from 'react-toastify';
import ROUTES from '../../stores/routes';

export default function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const login = useLogin();

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
    } catch (err) {
      let msg = err?.message || 'Error al iniciar sesión';
      let attemptsMsg = '';
      if (err?.response?.data?.message) {
        msg = err.response.data.message;
        if (err.response.data.remainingAttempts !== undefined) {
          attemptsMsg = `Te quedan ${err.response.data.remainingAttempts} intentos`;
        }
        if (err.response.data.locked) {
          msg = 'Cuenta bloqueada. Revisa tu email para recuperarla o espera a que se desbloquee.';
          attemptsMsg = '';
        }
      }
      setError(attemptsMsg || '');
      toast.error(msg === 'Credenciales inválidas' ? 'Credenciales inválidas' : msg);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-8 p-4 bg-white rounded shadow">
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
        <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded">Ingresar</button>
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
        </div>
      ) : null}
    </div>
  );
}
