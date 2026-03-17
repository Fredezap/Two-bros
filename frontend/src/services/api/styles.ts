import api from '../../api/axios'
import type { Style } from '../../types'
import { API_ROUTES } from '../../stores/routes'

export const stylesApi = {
  async getAll(): Promise<Style[]> {
    const res = await api.get(API_ROUTES.STYLES)
    return res.data
  },

  async create(payload: Partial<Style>): Promise<Style> {
    try {
      const res = await api.post(API_ROUTES.STYLES, payload);
      return res.data;
    } catch (error: any) {
      // Si el backend envía un mensaje, propágalo
      const backendMsg = error?.response?.data?.message;
      if (backendMsg) {
        throw new Error(backendMsg);
      }
      throw error;
    }
  },

  async update(id: string, payload: Partial<Style>): Promise<Style> {
    try {
      const res = await api.put(`${API_ROUTES.STYLES}/${id}`, payload);
      return res.data;
    } catch (error: any) {
      throw error;
    }
  },
  
  async remove(id: string): Promise<void> {
    await api.delete(`${API_ROUTES.STYLES}/${id}`)
  }
}

export default stylesApi
