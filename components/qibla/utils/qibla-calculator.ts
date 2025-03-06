const MECCA_LAT = 21.422487;
const MECCA_LON = 39.826206;

export const calculateQiblaBearing = (lat: number, lon: number): number => {
  const φ1 = lat * Math.PI / 180;
  const λ1 = lon * Math.PI / 180;
  const φ2 = MECCA_LAT * Math.PI / 180;
  const λ2 = MECCA_LON * Math.PI / 180;

  const y = Math.sin(λ2 - λ1);
  const x = Math.cos(φ1) * Math.tan(φ2) - Math.sin(φ1) * Math.cos(λ2 - λ1);
  
  let bearing = Math.atan2(y, x) * 180 / Math.PI;
  bearing = (bearing + 360) % 360;
  
  return Number(bearing.toFixed(1));
}; 