import { useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from '../../api/axios';
import { toast } from 'react-toastify';
import ROUTES from '../../stores/routes';

export default function UnlockAccount() {
  const { token } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  // Obtener email de la query
  const params = new URLSearchParams(location.search);
  const email = params.get('email') || '';

  useEffect(() => {
    async function unlock() {
      try {
        const res = await axios.post(ROUTES.USERS_UNLOCK_ACCOUNT, { token });
        const msg = res?.data?.message || '¡Acceso recuperado! Ahora tienes 5 intentos para iniciar sesión.';
        if (res?.data?.success === false) {
          toast.error(msg);
        } else {
          toast.success(msg);
        }
        // Redirigir a login con email autocompletado
        if (email) {
          navigate(`${ROUTES.LOGIN}?email=${encodeURIComponent(email)}`);
        } else {
          navigate(ROUTES.LOGIN);
        }
      } catch (err) {
        let msg = 'No se pudo recuperar el acceso. El enlace puede haber expirado.';
        if (err?.response?.data?.message) msg = err.response.data.message;
        toast.error(msg);
        // Redirigir a login con email y subject=unlock para mostrar botón de reenvío
        let url = ROUTES.LOGIN;
        if (email) {
          url += `?email=${encodeURIComponent(email)}&subject=unlock`;
        } else {
          url += `?subject=unlock`;
        }
        navigate(url);
      }
    }
    if (token) unlock();
    else navigate(ROUTES.LOGIN);
  }, [token, navigate, email]);

  return (
    <div className="max-w-sm mx-auto mt-8 p-4 bg-white rounded shadow text-center">
      <p>Procesando recuperación de acceso...</p>
    </div>
  );
}
