import { useContext } from "react"
import { AuthContext } from "../../contexts/AuthContext"

export default function Dashboard () {
    const { user} = useContext(AuthContext)
    return (
        <>
            <h1>Dashboard</h1>
            <h2>{user?.email}</h2>
        </>
    )
}