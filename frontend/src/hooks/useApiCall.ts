// import { useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
import { API_URL } from '../api/api';
import { getValidAccessToken } from '../utils/authUtils';
// import { clearTokens, getValidAccessToken, getValidToken } from '../utils/authUtils';


// export const useApiCall = () => {
//   const navigate = useNavigate();

//   const apiCall = useCallback(async (
//     endpoint: string, 
//     options: RequestInit = {}
//   ): Promise<Response> => {
//     try {
//       // Get valid token (automatically refreshes if needed)
//       const token = await getValidToken();
      
//       if (!token) {
//         clearTokens();
//         navigate('/sign-in', { replace: true });
//         throw new Error('No valid token available');
//       }

//       // Make the API call
//       const response = await fetch(`${API_URL}${endpoint}`, {
//         ...options,
//         headers: {
//           'Content-Type': 'application/json',
//           ...options.headers,
//           'Authorization': `Bearer ${token}`,
//         },
//       });

//       // If still unauthorized after token refresh attempt
//       if (response.status === 401) {
//         clearTokens();
//         navigate('/sign-in', { replace: true });
//         throw new Error('Authentication failed');
//       }

//       return response;
//     } catch (error) {
//       // Handle network errors or token refresh failures
//       if (error instanceof Error && 
//           (error.message.includes('token') || error.message.includes('Authentication'))) {
//         clearTokens();
//         navigate('/sign-in', { replace: true });
//       }
//       throw error;
//     }
//   }, [navigate]);

//   return { apiCall };
// };


export async function apiFetch(
  path: string,
  opts: RequestInit = {}
): Promise<Response> {
  const token = await getValidAccessToken();
  const headers = new Headers(opts.headers);
  headers.set('Authorization', `Bearer ${token}`);
const url = `${API_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  // …rest of your token logic…
  const res = await fetch(url, { ...opts, headers });
  return res;
}
