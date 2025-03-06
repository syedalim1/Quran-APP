export const getMagneticDeclination = async (lat: number, lon: number): Promise<number> => {
  // Simplified WMM approximation
  const yearsSince2020 = new Date().getFullYear() - 2020;
  return (
    (11.5 * Math.sin(lat * Math.PI / 180) + 
    0.5 * Math.cos(2 * lon * Math.PI / 180)) * 
    (1 - 0.02 * yearsSince2020)
  );
}; 