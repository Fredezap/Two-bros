import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../api/axios';
import { toast } from 'react-toastify';
import ROUTES from '../../stores/routes';

export default function UnlockAccount() {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function unlock() {
      try {
        await axios.post(ROUTES.USERS_UNLOCK_ACCOUNT, { token });
        toast.success('¡Acceso recuperado! Ahora tienes 5 intentos para iniciar sesión.');
        navigate(ROUTES.LOGIN);
      } catch (err) {
        console.log('UNLOCK ACCOUNT ERROR:', err);
        toast.error('No se pudo recuperar el acceso. El enlace puede haber expirado.');
        navigate(ROUTES.LOGIN);
      }
    }
    if (token) unlock();
    else navigate(ROUTES.LOGIN);
  }, [token, navigate]);

  return (
    <div className="max-w-sm mx-auto mt-8 p-4 bg-white rounded shadow text-center">
      <p>Procesando recuperación de acceso...</p>
    </div>
  );
}
