export const environment = {
  production: false,
  apiUrl: 'http://localhost/api', // Explicitly point to the Nginx gateway
  keycloakUrl: 'http://localhost/auth' // Keycloak via the Nginx /auth/ path
};