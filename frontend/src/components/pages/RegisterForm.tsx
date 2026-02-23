import { useState } from 'react';
import { EyeIcon, EyeOffIcon } from '../common/EyeIcons';
import { useNavigate } from 'react-router-dom';
import { useRegister } from '../../hooks/useAuthActions';
import { toast } from 'react-toastify';
import ROUTES from '../../stores/routes';

export default function RegisterForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const register = useRegister();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register({ email, password });
      setEmail('');
      setPassword('');
      setShowSuccess(true);
      toast.success('Registro exitoso. Revisa tu correo para verificar tu cuenta.');
    } catch (err) {
      const errors = err?.response?.data?.message;
      if (Array.isArray(errors)) {
        errors.forEach((msg) => toast.error(msg));
      } else {
        toast.error(errors || 'Error al registrarse');
      }
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-8 p-4 bg-white rounded shadow">
      <form onSubmit={handleSubmit}>
        <h2 className="text-xl mb-4">Registrarse</h2>
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
        <button type="submit" className="w-full bg-yellow-700 hover:bg-yellow-800 text-white p-2 rounded transition">Registrarse</button>
      </form>
      <div className="mt-4 text-center text-sm text-gray-600">
        ¿Ya tienes cuenta?{' '}
        <button className="text-blue-600 hover:underline" onClick={() => navigate(ROUTES.LOGIN)}>Iniciar sesión</button>
      </div>
      {showSuccess && (
        <div className="mt-4 p-3 bg-green-100 text-green-800 rounded text-center">
          Registro exitoso. Revisa tu correo para verificar tu cuenta.
        </div>
      )}
    </div>
  );
}
