// Ensembl REST API endpoints
export const API_ENDPOINTS = {
  SPECIES: 'https://rest.ensembl.org/info/species',
  ASSEMBLY: (speciesName) => `https://rest.ensembl.org/info/assembly/${speciesName}`
}

// Common headers for API requests
export const API_HEADERS = {
  'Content-Type': 'application/json',
}