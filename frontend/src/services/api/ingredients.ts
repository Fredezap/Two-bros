import api from '../../api/axios'
import type { Ingredient } from '../../types'
import { API_ROUTES } from '../../stores/routes'

export const ingredientsApi = {
  async getAll(): Promise<Ingredient[]> {
    const res = await api.get(API_ROUTES.INGREDIENTS)
    return res.data
  },
  async create(payload: Partial<Ingredient>): Promise<Ingredient> {
    const { id, ...rest } = payload;
    const res = await api.post(API_ROUTES.INGREDIENTS, rest)
    return res.data
  },
  async update(id: string, payload: Partial<Ingredient>): Promise<Ingredient> {
    // Nunca enviar userId al backend en updates
    const { userId, ...rest } = payload as any;
    try {
      const res = await api.put(`${API_ROUTES.INGREDIENTS}/${id}`, rest);
      return res.data;
    } catch (error) {
      throw error;
    }
  },
  async remove(id: string): Promise<void> {
    await api.delete(`${API_ROUTES.INGREDIENTS}/${id}`)
  }
}

export default ingredientsApi
