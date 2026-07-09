class ApiResponse {
  static success(res, statusCode, message, data = {}) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(res, statusCode, message, error = {}) {
    return res.status(statusCode).json({
      success: false,
      message,
      error,
    });
  }
}

module.exports = ApiResponse;