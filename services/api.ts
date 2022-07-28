import axios, { AxiosError } from 'axios';
import { GetServerSidePropsContext } from 'next';
import { parseCookies , setCookie} from 'nookies'
import { signOut } from '../contexts/AuthContext';
import { AuthTokenError } from './errors/AuthTokenError';

interface AxiosErrorResponse {
  code?: string;
}

interface FailedRequests {
  onSuccess: (token: string) => void;
  onFailure: (err: AxiosError<unknown, any>) => void;
}

let isRefreshing = false;
let failedRequestsQueue: FailedRequests[] = [];


export function setupAPIClient (ctx: GetServerSidePropsContext | undefined = undefined){
  let cookies = parseCookies(ctx);

  const api = axios.create({
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
        cookies = parseCookies(ctx); // atualizando valores do cookies
  
        const { 'genericAuth.refreshToken': refreshToken } = cookies;
  
        const originalConfig = error.config;
  
        if(!isRefreshing) {
          isRefreshing = true;
  
          api.post('/refresh', {
            refreshToken,
          }).then(response => {
            const { token } = response.data;
  
    
            setCookie(ctx, 'genericAuth.token', token, {
              maxAge: 60 * 60 * 24 * 30, // 30 days
              path: '/'
            })
      
            setCookie(ctx, 'genericAuth.refreshToken', response.data.refreshToken, {
              maxAge: 60 * 60 * 24 * 30, // 30 days
              path: '/'
            })
            
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  
            failedRequestsQueue.forEach(request => request.onSuccess(token));
  
            failedRequestsQueue = [];
          }).catch(err => {
            failedRequestsQueue.forEach(request => request.onFailure(err));
  
            failedRequestsQueue = [];
  
            if (process.browser){
              signOut();
            }
            else {
              return Promise.reject(new AuthTokenError());
            }
          }).finally(() => {
            isRefreshing = false;
          });
        }
  
        return new Promise((resolve,reject) => {
          failedRequestsQueue.push({
            onSuccess: (token: string) => { // caso de sucesso ao fazer o refreshToken
              if(!originalConfig?.headers) {
                return //Eu coloquei um return mas pode colocar algum erro ou um reject 
              }
  
              originalConfig.headers['Authorization'] = `Bearer ${token}`
              
              resolve(api(originalConfig))
            },
            onFailure: (err: AxiosError) => { // caso de erro ao fazer o refreshToken
              reject(err);
            },
          })
        });
      } else { //deslogar o usuario
        if (process.browser){
          signOut();
        } else {
          return Promise.reject(new AuthTokenError());
        }
      }
    }
  
    return Promise.reject(error);
  });

  return api;
}