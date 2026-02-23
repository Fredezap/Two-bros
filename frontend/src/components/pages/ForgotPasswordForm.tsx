import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../api/axios';
import ROUTES from '../../stores/routes';
import { toast } from 'react-toastify';

function getEmailFromQuery(search: string) {
  const params = new URLSearchParams(search);
  return params.get('email') || '';
}

export default function ForgotPasswordForm() {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEmail(getEmailFromQuery(location.search));
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('Enviando solicitud de recuperación para email:', email);
      await api.post(ROUTES.USERS_FORGOT_PASSWORD, { email });
      toast.success('Si el email existe, recibirás instrucciones para recuperar tu contraseña.');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al solicitar recuperación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-8 p-4 bg-white rounded shadow">
      <form onSubmit={handleSubmit}>
        <h2 className="text-xl mb-4">Recuperar contraseña</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full mb-2 p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-yellow-700 hover:bg-yellow-800 text-white p-2 rounded transition"
          disabled={loading}
        >
          {loading ? 'Enviando...' : 'Enviar instrucciones'}
        </button>
      </form>
    </div>
  );
}
