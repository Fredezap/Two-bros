import { useState } from 'react';
import axios from '../../api/axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import ROUTES from '../../stores/routes';

export default function UnlockAccountRequest() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Por favor ingresa tu email.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/users/send-unlock-email', { email });
      const msg = res?.data?.message || 'Se ha enviado un email para desbloquear tu cuenta. Si no ves el email, revisa tu buzón de spam.';
      if (res?.data?.success === false) {
        toast.error(msg);
      } else {
        toast.success(msg);
        navigate(ROUTES.LOGIN + `?email=${encodeURIComponent(email)}`);
      }
    } catch (e) {
      toast.error('No se pudo enviar el email de desbloqueo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-8 p-4 bg-white rounded shadow">
      <h2 className="text-xl mb-4">Desbloquear cuenta</h2>
      <form onSubmit={handleSubmit}>
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
          className="w-full bg-yellow-700 hover:bg-yellow-800 text-white p-2 rounded transition mt-2 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Enviando...' : 'Enviar email de desbloqueo'}
        </button>
      </form>
    </div>
  );
}
