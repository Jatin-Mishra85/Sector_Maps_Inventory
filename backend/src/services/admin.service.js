function verifyCode(code) {
    if (!code || typeof code !== 'string' || code.trim() === '') {
        const error = new Error('Admin code is required.');
        error.statusCode = 400;
        throw error;
    }

    const expectedCode = process.env.ADMIN_ACCESS_CODE;

    if (!expectedCode) {
        const error = new Error('Admin access is not configured on the server.');
        error.statusCode = 500;
        throw error;
    }

    if (code.trim() !== expectedCode) {
        const error = new Error('Invalid admin code.');
        error.statusCode = 401;
        throw error;
    }

    return true;
}

module.exports = { verifyCode };