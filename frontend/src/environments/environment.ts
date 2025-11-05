// Development environment configuration
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',
  // Azure OpenAI configuration (if calling directly from frontend - not recommended)
  // azureOpenAI: {
  //   endpoint: '',
  //   apiKey: '',
  //   assistantId: ''
  // },
  // CDN configuration
  imageCDN: {
    baseUrl: 'https://placehold.co', // Using placehold.co for better placeholders
    fallbackImage: 'https://placehold.co/600x400/64748b/FFFFFF/png?text=No+Image+Available&font=roboto'
  }
};
