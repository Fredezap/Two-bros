import api from '../../api/axios';

export async function testTokenApi() {
  const res = await api.get('/users/test-token');
  return res.data;
}
