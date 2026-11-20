
export function getLanguageForLocation(
  country: string,
  region: string
): string {
  const countryCode = (country || '').trim().toUpperCase();
  const regionCode = (region || '').trim().toUpperCase();

  // Quebec defaults to French
  if (countryCode === 'CA' && regionCode === 'QC') {
    return 'fr';
  }

  // France defaults to French
  if (countryCode === 'FR') {
    return 'fr';
  }

  // Spanish-speaking countries
  const spanishCountries = [
    'ES', 'MX', 'AR', 'BO', 'CL', 'CO',
    'CR', 'CU', 'DO', 'EC', 'SV', 'GT',
    'HN', 'NI', 'PA', 'PY', 'PE',
    'UY', 'VE'
  ];

  if (spanishCountries.includes(countryCode)) {
    return 'es';
  }

  // All remaining locations default to English
  return 'en-us';
}
