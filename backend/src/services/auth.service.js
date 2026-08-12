const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authRepository = require('../repositories/auth.repository');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const SALT_ROUNDS = 10;

function generateToken(user) {
    return jwt.sign(
        { userId: user.UserId, email: user.Email },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
}

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
        // Agar isi email se pehle email/password wala account bana hai, wahi use karo --
        // taaki ek insaan ke 2 alag accounts na ban jayein.
        user = await authRepository.findByEmail(payload.email);
        if (!user) {
            user = await authRepository.createUser({
                googleId: payload.sub,
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
            });
        }
    }

    if (user.IsBlocked) {
        const err = new Error('Your account has been blocked.');
        err.statusCode = 403;
        throw err;
    }

    const token = generateToken(user);
    return { user, token };
}

// ---- Email / Password ----

async function registerWithEmail({ email, password, name }) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !password) {
        throw new Error('Email and password are required.');
    }
    if (password.length < 6) {
        throw new Error('Password must be at least 6 characters.');
    }

    const existing = await authRepository.findByEmail(cleanEmail);
    if (existing) {
        throw new Error('An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await authRepository.createUserWithPassword({
        email: cleanEmail,
        name: name || cleanEmail.split('@')[0],
        passwordHash,
    });

    const token = generateToken(user);
    return { user, token };
}

async function loginWithEmailPassword({ email, password }) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const user = await authRepository.findByEmail(cleanEmail);

    // Google se bana account ho sakta hai jiska password hi na ho -- generic
    // message hi do, kisi ko pata na chale account exist karta hai ya nahi.
    if (!user || !user.PasswordHash) {
        throw new Error('Invalid email or password.');
    }

    const match = await bcrypt.compare(password, user.PasswordHash);
    if (!match) {
        throw new Error('Invalid email or password.');
    }

    if (user.IsBlocked) {
        const err = new Error('Your account has been blocked.');
        err.statusCode = 403;
        throw err;
    }

    const token = generateToken(user);
    return { user, token };
}

async function getUserById(userId) {
    const user = await authRepository.findById(userId);
    if (!user) return null;
    if (user.IsBlocked) return null; // blocked -> treat as logged out
    return {
        userId: user.UserId,
        email: user.Email,
        name: user.Name,
        picture: user.Picture,
        isAdmin: !!user.IsAdmin,
        isSuperAdmin: !!user.IsSuperAdmin,
    };
}

module.exports = {
    loginWithGoogle,
    registerWithEmail,
    loginWithEmailPassword,
    getUserById,
};