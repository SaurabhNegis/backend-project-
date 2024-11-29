class ApiResponce{
    constructor(statusCode, data, massage = "Success"){
    this.statusCode = statusCode
    this.data = data
    this.message =message
    this.success = statusCode < 400

    }
}