import React, { useMemo } from 'react'
import { SRM_COLOR_MAP } from '../../services/initialData'

export const BarleyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-amber-600">
    <path d="M12 2c-1 0-1 4-1 6s1 6 1 6 1-4 1-6-1-6-1-6z" fill="#D97706" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 2v20" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 5l4 4M14 5l-4 4M10 12l4 4M14 12l-4 4M10 19l4 4M14 19l-4 4" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const MashingVesselIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700 dark:text-gray-300">
    <path d="M5 19H19"/>
    <path d="M6 19L7.5 5H16.5L18 19"/>
    <path d="M12 5V4"/>
    <path d="M10 8H14"/>
    <circle cx="12" cy="12" r="3" strokeDasharray="2 2" opacity="0.5"/>
  </svg>
)

export const KettleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700 dark:text-gray-300">
    <path d="M14 20h-4"/>
    <path d="M12 4v4"/>
    <path d="M18 10h-12c-1.1 0-2 0.9-2 2v6h16v-6c0-1.1-0.9-2-2-2z"/>
    <path d="M6 18h12"/>
    <path d="M17 10h2l-2-6h-6l-2 6h2"/>
    <path d="M12 4c0-1.1 0.9-2 2-2h4c1.1 0 2 0.9 2 2v2"/>
    <path d="M12 4c0-1.1-0.9-2-2-2h-4c-1.1 0-2 0.9-2 2v2"/>
  </svg>
)

export const HopFlowerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-600">
    <path d="M12 2v20" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 2c-1.5 1-1.5 2-3 3-1.5 1 0 2 0 3M12 2c1.5 1 1.5 2 3 3 1.5 1 0 2 0 3" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="#34D399"/>
    <path d="M12 10c-1.5 1-1.5 2-3 3-1.5 1 0 2 0 3M12 10c1.5 1 1.5 2 3 3 1.5 1 0 2 0 3" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="#34D399"/>
    <path d="M12 18c-1.5 1-1.5 2-3 3-1.5 1 0 2 0 3M12 18c1.5 1 1.5 2 3 3 1.5 1 0 2 0 3" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="#34D399"/>
  </svg>
)

export const BeerGlassIcon: React.FC<{ srm: number } & React.SVGProps<SVGSVGElement>> = ({ srm, ...props }) => {
  const beerColor = useMemo(() => {
    for (let i = SRM_COLOR_MAP.length - 1; i >= 0; i--) {
      if (srm >= SRM_COLOR_MAP[i].srm) return SRM_COLOR_MAP[i].color
    }
    return SRM_COLOR_MAP[0].color
  }, [srm])

  return (
    <svg {...props} width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 25 10 H 75 L 70 85 H 30 Z" fill="#E0E7FF" fillOpacity="0.3" stroke="#60A5FA" strokeWidth="2"/>
      <path d="M 27 82 H 73 L 70 20 H 30 Z" fill={beerColor} stroke="#222" strokeWidth="0.5"/>
      <path d="M 25 20 C 35 12 65 12 75 20 V 25 C 65 18 35 18 25 25 V 20 Z" fill="#F0F8FF" stroke="#fff" strokeWidth="1" opacity="0.9"/>
      <path d="M 40 75 C 42 60 42 40 45 35 C 47 30 48 25 48 20 L 45 20 H 35 L 35 75 Z" fill="rgba(255,255,255,0.2)" />
      <path d="M 75 35 H 85 C 90 35 90 65 85 65 H 75 L 75 35 Z" fill="#d0d0d0" stroke="#888" strokeWidth="1.5"/>
      <path d="M 25 10 C 35 5 65 5 75 10 L 75 10 H 25 Z" fill="none" stroke="#666" strokeWidth="1"/>
    </svg>
  )
}

export default null as any
