
export default function errorMiddleware(err, req, res, next) {
    
    const statusCode = err.statusCode || 500;

    const payload = {
        success : false,
        message : err.message || 'Internal Server Error'
    }

    console.log(err)
    console.trace()

    if(err.name === 'ValidationError') {
        const errors = Object.values(err.errors || {}).map(err => err.message);
        return res.status(400).json({
            success : false,
            message : 'Validation Error',
            errors,
        }
        );
    }

    if(err.name === 'CastError') {
        return res.status(400).json({
            success : false,
            message : `Invalid ${err.path} : ${err.value}`, 
        }
        );
    }

    if(err.code && err.code === 11000) {
        const dupKeys = Object.keys(err.keyValue || {}).join(', ');
        return res.status(409).json({
            success : false,
            message : `Duplicate key error: ${dupKeys}`,
            fields : err.keyValue,
        })
    }

    if(err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success : false,
            message : 'Invalid Token',
        }
        );
    }

    if(err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success : false,
            message : 'Token Expired',
        }
        );
    }

    if(err.type === 'express-validator') {
        return res.status(400).json({
            success : false,
            message : 'Validation Error',
            errors : err.errors || [],
        })
    }

    return res.status(statusCode).json(payload);
}