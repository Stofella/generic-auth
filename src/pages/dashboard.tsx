import { useContext } from "react"
import { Can } from "../../components/Can"
import { AuthContext } from "../../contexts/AuthContext"
import { setupAPIClient } from "../../services/api"
import { withSSRAuth } from "../../utils/withSSRAuth"

export default function Dashboard () {
    const { user} = useContext(AuthContext)

    return (
        <>
            <h1>Dashboard</h1>
            <h2>{user?.email}</h2>
            <Can permissions={['metrics.list']}>
                <div>Métricas</div>
            </Can>
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