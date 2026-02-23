import { useState } from 'react';
import { useVerifyEmail } from '../../hooks/useAuthActions';
import { toast } from 'react-toastify';

export default function VerifyEmailForm({ token }: { token: string }) {
  const verifyEmail = useVerifyEmail();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await verifyEmail({ token });
      toast.success('¡Email verificado correctamente! Ya puedes iniciar sesión.');
    } catch (err) {
      const errors = err?.response?.data?.message;
      if (Array.isArray(errors)) {
        errors.forEach((msg) => toast.error(msg));
      } else {
        toast.error(errors || 'Error al verificar el email');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-8 p-4 bg-white rounded shadow">
      <h2 className="text-xl mb-4">Verificar Email</h2>
      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Verificar</button>
    </form>
  );
}
