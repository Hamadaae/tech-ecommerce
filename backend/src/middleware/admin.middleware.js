export default function adminMiddleware(req, res ,next){
    try{
        if(!req.user || req.user.role !== 'admin'){
            const err = new Error('Unauthorized')
            err.statusCode = 401
            return next(err)
        }
        next()
    } catch(error){
        error.statusCode = 403
        next(error)
    }
}