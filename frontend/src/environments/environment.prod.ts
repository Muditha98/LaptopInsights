// Production environment configuration
export const environment = {
  production: true,
  apiUrl: 'https://laptop-insights-api.proudstone-99ac53cb.eastus.azurecontainerapps.io',
  // CDN configuration
  imageCDN: {
    baseUrl: 'https://placehold.co', // Using placehold.co for better placeholders
    fallbackImage: 'https://placehold.co/600x400/64748b/FFFFFF/png?text=No+Image+Available&font=roboto'
  }
};
