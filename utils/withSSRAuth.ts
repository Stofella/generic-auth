import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { destroyCookie, parseCookies } from "nookies";
import { AuthTokenError } from "../services/errors/AuthTokenError";

export function withSSRAuth<P>(fn: GetServerSideProps<P>) {
    return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> =>  {
        const cookies = parseCookies(ctx);

        if(!cookies['genericAuth.token']){
            return {
                redirect: {
                    destination: '/',
                    permanent: false,
                }
            }
        }
        try{
            return await fn(ctx);
        }   catch(err){
            if (err instanceof AuthTokenError)
            {        
                destroyCookie(ctx, 'genericAuth.token')
                destroyCookie(ctx, 'genericAuth.refreshToken')
                
                return {
                    redirect: {
                        destination: "/",
                        permanent: false,
                    }
                }
            }
            return Promise.reject(new AuthTokenError());
        }
    }
}