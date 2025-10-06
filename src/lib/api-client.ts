/**
 * Client API avec gestion automatique de l'authentification JWT
 */

/**
 * Récupère le token JWT du localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('ansi_admin_token');
}

/**
 * Effectue une requête fetch authentifiée
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();
  
  const headers = new Headers(options.headers);
  
  // Ajouter le token JWT si disponible
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Ajouter Content-Type par défaut si pas déjà défini et si il y a un body
  if (options.body && !headers.has('Content-Type')) {
    // Ne pas ajouter Content-Type pour FormData (le navigateur le fait automatiquement)
    if (!(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  // Si non autorisé (401), rediriger vers la page de login
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ansi_admin_token');
      localStorage.removeItem('ansi_admin_user');
      window.location.href = '/login';
    }
  }
  
  return response;
}

/**
 * Effectue une requête GET authentifiée
 */
export async function authGet(url: string): Promise<Response> {
  return authFetch(url, {
    method: 'GET',
  });
}

/**
 * Effectue une requête POST authentifiée
 */
export async function authPost(url: string, data?: any): Promise<Response> {
  return authFetch(url, {
    method: 'POST',
    body: data instanceof FormData ? data : JSON.stringify(data),
  });
}

/**
 * Effectue une requête PUT authentifiée
 */
export async function authPut(url: string, data?: any): Promise<Response> {
  return authFetch(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Effectue une requête DELETE authentifiée
 */
export async function authDelete(url: string): Promise<Response> {
  return authFetch(url, {
    method: 'DELETE',
  });
}
