const authService = require('../services/auth.service');

const COOKIE_NAME = 'auth_token';

function cookieOptions() {
    const isProd = process.env.NODE_ENV === 'production';
    return {
        httpOnly: true,
        secure: isProd, // sameSite:'none' ko browser tabhi allow karta hai jab secure:true ho
        sameSite: isProd ? 'none' : 'lax', // cross-domain (vercel + onrender) ke liye zaroori
        maxAge: 30 * 24 * 60 * 60 * 1000,
    };
}

function mapUser(user) {
    if (!user) return null;
    return {
        id: user.id ?? user.UserId ?? user.userId,
        email: user.email ?? user.Email,
        name: user.name ?? user.Name,
        picture: user.picture ?? user.Picture,
        isAdmin: !!(user.isAdmin ?? user.IsAdmin),
        isSuperAdmin: !!(user.isSuperAdmin ?? user.IsSuperAdmin),
    };
}

async function googleLogin(req, res) {
    try {
        const { idToken } = req.body;
        if (!idToken) {
            return res.status(400).json({ success: false, message: 'idToken is required.' });
        }

        const { user, token } = await authService.loginWithGoogle(idToken);

        res.cookie(COOKIE_NAME, token, cookieOptions());
        res.status(200).json({ success: true, message: 'Logged in successfully', data: { ...mapUser(user), token } });
    } catch (err) {
        console.error('Google login error:', err);
        res.status(err.statusCode || 401).json({ success: false, message: err.message || 'Google login failed.' });
    }
}

// Naya -- email/password signup.
async function signup(req, res) {
    try {
        const { email, password, name } = req.body;
        const { user, token } = await authService.registerWithEmail({ email, password, name });

        res.cookie(COOKIE_NAME, token, cookieOptions());
        res.status(201).json({ success: true, message: 'Account created successfully', data: { ...mapUser(user), token } });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message || 'Signup failed.' });
    }
}

// Naya -- email/password login.
async function login(req, res) {
    try {
        const { email, password } = req.body;
        const { user, token } = await authService.loginWithEmailPassword({ email, password });

        res.cookie(COOKIE_NAME, token, cookieOptions());
        res.status(200).json({ success: true, message: 'Logged in successfully', data: { ...mapUser(user), token } });
    } catch (err) {
        res.status(err.statusCode || 401).json({ success: false, message: err.message || 'Login failed.' });
    }
}

async function getMe(req, res) {
    if (!req.user) {
        return res.status(200).json({ success: true, data: null });
    }
    res.status(200).json({ success: true, data: mapUser(req.user) });
}

async function logout(req, res) {
    res.clearCookie(COOKIE_NAME, cookieOptions());
    // Admin/special-access cookie bhi saath me clear kar do.
    res.clearCookie('admin_access', cookieOptions());
    res.status(200).json({ success: true, message: 'Logged out successfully' });
}

module.exports = { googleLogin, signup, login, getMe, logout };