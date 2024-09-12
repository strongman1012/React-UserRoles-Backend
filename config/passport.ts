import passport from 'passport';
import { Request } from 'express';
import { Strategy as LocalStrategy } from 'passport-local';
import { BearerStrategy, IBearerStrategyOptionWithRequest } from 'passport-azure-ad';
import User from '../models/User';
import config from '../config/config';
import { createLoginReport } from '../controllers/loginReportController';

// Local Strategy
passport.use(
  new LocalStrategy({ usernameField: 'email', passReqToCallback: true }, async (req: Request, email: string, password: string, done: any) => {
    try {
      const user = await User.findByEmail(email);
      // Current timestamp
      const date = new Date().toISOString();
      const { application } = req.body;
      if (!user) {
        return done(null, false, { message: 'That email is not registered' });
      }
      if (!user.status) {
        createLoginReport(user.id, date, "Login", application, false, null);
        return done(null, false, { message: "You are not allowed" });
      }

      const isMatch = await user.validPassword(password);
      if (isMatch) {
        return done(null, user);
      } else {
        createLoginReport(user.id, date, "Login", application, false, null);
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
  passReqToCallback: true,
  audience: config.azure.clientId,
  scope: ["access_as_user"]
};

passport.use(
  new BearerStrategy(options, (req: Request, token: any, done: any) => {
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
