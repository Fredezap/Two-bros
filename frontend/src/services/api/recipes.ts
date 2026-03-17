import api from '../../api/axios'
import type { Recipe } from '../../types'
import { API_ROUTES } from '../../stores/routes'

export const recipesApi = {
  async getAll(): Promise<Recipe[]> {
    const res = await api.get(API_ROUTES.RECIPES)
    return res.data
  },
  async getById(id: string): Promise<Recipe> {
    const res = await api.get(`${API_ROUTES.RECIPES}/${id}`)
    return res.data
  },
  async create(payload: Partial<Recipe>): Promise<Recipe> {
    const res = await api.post(API_ROUTES.RECIPES, payload)
    return res.data
  },
  async update(id: string, payload: Partial<Recipe>): Promise<Recipe> {
    const res = await api.put(`${API_ROUTES.RECIPES}/${id}`, payload)
    return res.data
  },
  async remove(id: string): Promise<void> {
    await api.delete(`${API_ROUTES.RECIPES}/${id}`)
  }
}

export default recipesApi
