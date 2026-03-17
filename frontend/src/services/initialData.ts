export type AlertConfig = { targetBatchLiters: number; minStockPercentage: number }

export const DEFAULT_ALERT_CONFIG: AlertConfig = {
  targetBatchLiters: 20,
  minStockPercentage: 200,
}

export type SrmColor = { srm: number; color: string }

export const SRM_COLOR_MAP: SrmColor[] = [
  { srm: 0, color: '#FFD700' },
  { srm: 3, color: '#FFC800' },
  { srm: 6, color: '#FFA500' },
  { srm: 9, color: '#E59400' },
  { srm: 13, color: '#BF6C00' },
  { srm: 18, color: '#8C3D00' },
  { srm: 25, color: '#592600' },
  { srm: 35, color: '#361700' },
  { srm: 40, color: '#1A0D00' },
]
