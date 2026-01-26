const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../model/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // THIS URL MUST MATCH YOUR GOOGLE CLOUD SCREENSHOT EXACTLY:
      callbackURL: 'https://eco-exchange-api.onrender.com/auth/google/callback',
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      // 🔍 DEBUG LOGS: This will print to your Render Dashboard
      console.log("🌟 GOOGLE LOGIN ATTEMPT DETECTED!");
      console.log("👤 Profile ID:", profile.id);
      
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          console.log("✅ User already exists:", user.email);
          return done(null, user);
        }

        console.log("🆕 Creating NEW User...");
        // This is the code that actually saves to MongoDB
        user = await User.create({
          googleId: profile.id,
          displayName: profile.displayName,
          email: profile.emails[0].value,
          image: profile.photos[0].value,
          role: 'user' // Default role
        });
        
        console.log("🎉 User Created Successfully:", user.email);
        done(null, user);
      } catch (err) {
        console.error("❌ DATABASE ERROR:", err);
        done(err, null);
      }
    }
  )
);