class ApiError extends Error{
    constructor(
        statusCode,
        massage="Something went-wrong",
        errors = [],
        statck = ""
    ){         
        super(massage)
        this.statusCode = statusCode
        this.data = null
        this.message =message
        this.success = false
        this.errors = errors

        if (stack) {
            this.stack = statck

        }else{
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export default ApiError