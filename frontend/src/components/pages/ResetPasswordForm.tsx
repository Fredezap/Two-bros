import { useState } from 'react';
import { EyeIcon, EyeOffIcon } from '../common/EyeIcons';
import { useResetPassword } from '../../hooks/useAuthActions';
import { toast } from 'react-toastify';


export default function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const resetPassword = useResetPassword();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  console.log('RESET PASSWORD TOKEN:', token);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    try {
      const resp = await resetPassword({ token, newPassword: password });
      console.log('RESET PASSWORD RESPONSE:', resp);
      toast.success('Contraseña restablecida correctamente. Ahora puedes iniciar sesión.');
    } catch (err) {
      console.error('RESET PASSWORD ERROR:', err);
      const errors = err?.response?.data?.message;
      if (Array.isArray(errors)) {
        errors.forEach((msg) => toast.error(msg));
      } else {
        toast.error(errors || 'Error al restablecer la contraseña');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-8 p-4 bg-white rounded shadow">
      <h2 className="text-xl mb-4">Restablecer contraseña</h2>
      <div className="relative mb-2">
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Nueva contraseña"
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
      <div className="relative mb-2">
        <input
          type={showConfirm ? 'text' : 'password'}
          placeholder="Confirmar contraseña"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          className="w-full p-2 border rounded pr-10"
          required
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          tabIndex={-1}
          onClick={() => setShowConfirm((v) => !v)}
          aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {showConfirm ? <EyeIcon className="w-5 h-5" /> : <EyeOffIcon className="w-5 h-5" />}
        </button>
      </div>
      <button type="submit" className="w-full bg-yellow-600 text-white p-2 rounded">Restablecer</button>
    </form>
  );
}
