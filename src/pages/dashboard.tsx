import { useContext } from "react"
import { AuthContext } from "../../contexts/AuthContext"
import { useCan } from "../../hooks/useCan"
import { setupAPIClient } from "../../services/api"
import { withSSRAuth } from "../../utils/withSSRAuth"

export default function Dashboard () {
    const { user} = useContext(AuthContext)

    const userCanSeeMetrics = useCan({
        roles: ['administrator', 'editor']
    });

    return (
        <>
            <h1>Dashboard</h1>
            <h2>{user?.email}</h2>

            { userCanSeeMetrics && <div>Métricas</div>}
        </>
    )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {  
    const apiClient = setupAPIClient(ctx);

    const response = await apiClient.get('/me');

    console.log(response.data);

    return {
      props: {}
    }
  });