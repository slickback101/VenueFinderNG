const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_REDIRECT_URI || "/api/v1/google-calendar/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
    // Check if user already exists with this Google ID
    let user = await User.findOne({
    where: { google_id: profile.id }
    });

    if (user) {
      // Update tokens if user exists
    await user.update({
        google_access_token: accessToken,
        google_refresh_token: refreshToken,
    });
    return done(null, user);
    }

    // Check if user exists with same email
    user = await User.findOne({
    where: { email: profile.emails[0].value }
    });

    if (user) {
      // Link Google account to existing user
    await user.update({
        google_id: profile.id,
        google_access_token: accessToken,
        google_refresh_token: refreshToken,
        profile_picture: profile.photos[0].value,
        first_name: profile.name.givenName,
        last_name: profile.name.familyName,
    });
    return done(null, user);
    }

    // Create new user
    const newUser = await User.create({
    google_id: profile.id,
    first_name: profile.name.givenName,
    last_name: profile.name.familyName,
    email: profile.emails[0].value,
    profile_picture: profile.photos[0].value,
    google_access_token: accessToken,
    google_refresh_token: refreshToken,
      is_verified: true, // Google accounts are pre-verified
    });

    return done(null, newUser);
    } catch (error) {
    console.error('Google OAuth Error:', error);
    return done(error, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
    const user = await User.findByPk(id);
    done(null, user);
    } catch (error) {
    done(error, null);
    }
});

module.exports = passport;