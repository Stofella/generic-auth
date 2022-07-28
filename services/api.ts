import axios, { AxiosError } from 'axios';
import { parseCookies , setCookie} from 'nookies'

interface AxiosErrorResponse {
  code?: string;
}

let cookies = parseCookies();

export const api = axios.create({
  baseURL: 'http://localhost:3333',
  headers: {
    Authorization: `Bearer ${cookies['genericAuth.token']}`
  }
})

api.interceptors.response.use(response => {
  return response;
}, (error: AxiosError<AxiosErrorResponse>) => {
  if(error.response?.status === 401) {
    if(error.response.data?.code === 'token.expired'){ // renovar o token
      cookies = parseCookies(); // atualizando valores do cookies

      const { 'genericAuth.refreshToken': refreshToken } = cookies;

      api.post('/refresh', {
        refreshToken,
      }).then(response => {
        const { token } = response.data;

        setCookie(undefined, 'genericAuth.token', token, {
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: '/'
        })
  
        setCookie(undefined, 'genericAuth.refreshToken', response.data.refreshToken, {
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: '/'
        })
        
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      })
    }
    else { //deslogar o usuario
      
    }
  }
})