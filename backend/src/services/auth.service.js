const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const authRepository = require('../repositories/auth.repository');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(idToken) {
    const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload();
}

async function loginWithGoogle(idToken) {
    const payload = await verifyGoogleToken(idToken);

    let user = await authRepository.findByGoogleId(payload.sub);
    if (!user) {
        user = await authRepository.createUser({
            googleId: payload.sub,
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
        });
    }

    const token = jwt.sign(
        { userId: user.UserId, email: user.Email },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );

    return { user, token };
}
async function getUserById(userId) {
    const user = await authRepository.findById(userId);
    if (!user) return null;
    return {
        userId: user.UserId,
        email: user.Email,
        name: user.Name,
        picture: user.Picture,
    };
}

module.exports = { loginWithGoogle, getUserById };