import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { BearerStrategy, IBearerStrategyOptionWithRequest } from 'passport-azure-ad';
import User from '../models/User';
import config from '../config/config';

// Local Strategy
passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email: string, password: string, done: any) => {
    try {
      const user = await User.findByEmail(email);
      if (!user) {
        return done(null, false, { message: 'That email is not registered' });
      }

      const isMatch = await user.validPassword(password);
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Password incorrect' });
      }
    } catch (err) {
      return done(err);
    }
  })
);

// Azure AD Bearer Strategy
const options: IBearerStrategyOptionWithRequest = {
  identityMetadata: `https://login.microsoftonline.com/${config.azure.tenantId}/v2.0/.well-known/openid-configuration`,
  clientID: config.azure.clientId,
  validateIssuer: true,
  issuer: `https://sts.windows.net/${config.azure.tenantId}/`,
  passReqToCallback: false,
  audience: config.azure.clientId,
  scope: ["access_as_user"]
};

passport.use(
  new BearerStrategy(options, (token: any, done: any) => {
    User.findByEmail(token.preferred_username)
      .then((user) => {
        if (!user) {
          return done(null, false);
        }
        return done(null, user, token);
      })
      .catch((err) => done(err, null));
  })
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await User.findById(id);
    if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  } catch (err) {
    done(err);
  }
});

export default passport;
