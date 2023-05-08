import axios from "axios"
import usersSvr from './API services/users_service'

//Interceptors for requests and responses of all server API calls
const interceptor = (store) => {
    axios.interceptors.request.use(req => {
        req.headers['x-access-token'] = usersSvr.getToken()
        return req
    })

    axios.interceptors.response.use(
        response => {
            
            return response
        },
        (error)=> {
            console.log("error is ")
            console.log(error)
            if (error.response.status === 401 && 
                sessionStorage["token"]) {
                store.dispatch({ type: "LOGOUT" })
                usersSvr.logout()
                
                return Promise.reject(error)
            }

            return Promise.reject(error)
        }
    )
}


export default { interceptor }