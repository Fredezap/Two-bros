import api from '../../api/axios'
import type { Ingredient } from '../../types'
import { API_ROUTES } from '../../stores/routes'

export const ingredientsApi = {
  async getAll(): Promise<Ingredient[]> {
    const res = await api.get(API_ROUTES.INGREDIENTS)
    return res.data
  },
  async create(payload: Partial<Ingredient>): Promise<Ingredient> {
    const res = await api.post(API_ROUTES.INGREDIENTS, payload)
    return res.data
  },
  async update(id: string, payload: Partial<Ingredient>): Promise<Ingredient> {
    const res = await api.put(`${API_ROUTES.INGREDIENTS}/${id}`, payload)
    return res.data
  },
  async remove(id: string): Promise<void> {
    await api.delete(`${API_ROUTES.INGREDIENTS}/${id}`)
  }
}

export default ingredientsApi
