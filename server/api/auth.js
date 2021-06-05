const router = require('express').Router();

const { User } = require('../db/index');
const { requireToken } = require('./utils/utils');

// POST /api/auth - returns token for email account
router.post('/', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        res.send({ token: await User.authenticate({ email, password }) });
    } catch (ex) {
        next(ex);
    }
});

// POST /api/auth/spotify - return token for spotify account
router.post('/spotify', async (req, res, next) => {
    console.log(3);
    try {
        console.log(4);
        const { id } = req.body;
        res.send({
            token: await User.generateTokenForSpotifyAuth(id),
        });
    } catch (ex) {
        next(ex);
    }
});

// GET /api/auth
router.get('/', requireToken, async (req, res, next) => {
    try {
        const { user } = req;
        const {
            id,
            firstName,
            lastName,
            email,
            fullName,
            imageUrl,
            isAdmin,
            isPublic,
            friends,
            concerts,
        } = user;
        const newUser = {
            id,
            firstName,
            lastName,
            email,
            fullName,
            imageUrl,
            isAdmin,
            isPublic,
            friends,
            concerts,
        };
        res.send(newUser);
    } catch (ex) {
        next(ex);
    }
});

module.exports = router;
