import { Router, Request, Response } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
// @ts-ignore - No types available for passport-apple
import { Strategy as AppleStrategy } from 'passport-apple';
import { OAuthService, OAuthUserData } from '../services/oauth.service';
import { logger } from '../config/logger';

const router = Router();
const oauthService = new OAuthService();

// Google OAuth Strategy (only in production with proper config)
if (process.env.NODE_ENV === 'production' && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/v1/oauth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const userData: OAuthUserData = {
        provider: 'google',
        providerId: profile.id,
        email: profile.emails?.[0]?.value || '',
        firstName: profile.name?.givenName || '',
        lastName: profile.name?.familyName || '',
        profileImageUrl: profile.photos?.[0]?.value,
        providerData: {
          accessToken,
          refreshToken,
          profile: profile._json
        }
      };

      if (!oauthService.validateOAuthData(userData)) {
        return done(new Error('Invalid OAuth data'), null);
      }

      const result = await oauthService.handleOAuthCallback(userData);
      return done(null, result);
    } catch (error) {
      logger.error('Google OAuth error:', error);
      return done(error, null);
    }
  }));
}

// Facebook OAuth Strategy (only in production with proper config)
if (process.env.NODE_ENV === 'production' && process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID!,
    clientSecret: process.env.FACEBOOK_APP_SECRET!,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL || '/api/v1/oauth/facebook/callback',
    profileFields: ['id', 'emails', 'name', 'picture']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const userData: OAuthUserData = {
        provider: 'facebook',
        providerId: profile.id,
        email: profile.emails?.[0]?.value || '',
        firstName: profile.name?.givenName || '',
        lastName: profile.name?.familyName || '',
        profileImageUrl: profile.photos?.[0]?.value,
        providerData: {
          accessToken,
          refreshToken,
          profile: profile._json
        }
      };

      if (!oauthService.validateOAuthData(userData)) {
        return done(new Error('Invalid OAuth data'), null);
      }

      const result = await oauthService.handleOAuthCallback(userData);
      return done(null, result);
    } catch (error) {
      logger.error('Facebook OAuth error:', error);
      return done(error, null);
    }
  }));
}

// Apple OAuth Strategy (only in production with proper config)
if (process.env.NODE_ENV === 'production' && process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID && process.env.APPLE_PRIVATE_KEY) {
  passport.use(new AppleStrategy({
    clientID: process.env.APPLE_CLIENT_ID!,
    teamID: process.env.APPLE_TEAM_ID!,
    keyID: process.env.APPLE_KEY_ID!,
    privateKeyString: process.env.APPLE_PRIVATE_KEY!,
    callbackURL: process.env.APPLE_CALLBACK_URL || '/api/v1/oauth/apple/callback'
  }, async (accessToken: any, refreshToken: any, idToken: any, profile: any, done: any) => {
    try {
      // Apple provides limited profile information
      const userData: OAuthUserData = {
        provider: 'apple',
        providerId: profile.id,
        email: profile.email || '',
        firstName: profile.name?.firstName || '',
        lastName: profile.name?.lastName || '',
        providerData: {
          accessToken,
          refreshToken,
          idToken,
          profile: profile._json
        }
      };

      if (!oauthService.validateOAuthData(userData)) {
        return done(new Error('Invalid OAuth data'), null);
      }

      const result = await oauthService.handleOAuthCallback(userData);
      return done(null, result);
    } catch (error) {
      logger.error('Apple OAuth error:', error);
      return done(error, null);
    }
  }));
}

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user);
});

// Deserialize user from session
passport.deserializeUser((user: any, done) => {
  done(null, user);
});

// Google OAuth routes (only in production with proper config)
if (process.env.NODE_ENV === 'production' && process.env.GOOGLE_CLIENT_ID) {
  router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
  }));

  router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login?error=oauth_failed' }),
    (req: Request, res: Response) => {
      try {
        const { user, accessToken, refreshToken } = req.user as any;
        
        // Redirect to frontend with tokens
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const redirectUrl = `${frontendUrl}/auth/callback?token=${accessToken}&refresh=${refreshToken}&user=${encodeURIComponent(JSON.stringify(user))}`;
        
        res.redirect(redirectUrl);
      } catch (error) {
        logger.error('Google OAuth callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_failed`);
      }
    }
  );
} else {
  router.get('/google', (_req: Request, res: Response) => {
    res.status(503).json({
      success: false,
      error: {
        code: 'OAUTH_NOT_AVAILABLE',
        message: 'Google OAuth is only available in production mode with proper configuration'
      }
    });
  });

  router.get('/google/callback', (_req: Request, res: Response) => {
    res.status(503).json({
      success: false,
      error: {
        code: 'OAUTH_NOT_AVAILABLE',
        message: 'Google OAuth is only available in production mode with proper configuration'
      }
    });
  });
}

// Facebook OAuth routes (only in production with proper config)
if (process.env.NODE_ENV === 'production' && process.env.FACEBOOK_APP_ID) {
  router.get('/facebook', passport.authenticate('facebook', {
    scope: ['email']
  }));

  router.get('/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login?error=oauth_failed' }),
    (req: Request, res: Response) => {
      try {
        const { user, accessToken, refreshToken } = req.user as any;
        
        // Redirect to frontend with tokens
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const redirectUrl = `${frontendUrl}/auth/callback?token=${accessToken}&refresh=${refreshToken}&user=${encodeURIComponent(JSON.stringify(user))}`;
        
        res.redirect(redirectUrl);
      } catch (error) {
        logger.error('Facebook OAuth callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_failed`);
      }
    }
  );
} else {
  router.get('/facebook', (_req: Request, res: Response) => {
    res.status(503).json({
      success: false,
      error: {
        code: 'OAUTH_NOT_AVAILABLE',
        message: 'Facebook OAuth is only available in production mode with proper configuration'
      }
    });
  });

  router.get('/facebook/callback', (_req: Request, res: Response) => {
    res.status(503).json({
      success: false,
      error: {
        code: 'OAUTH_NOT_AVAILABLE',
        message: 'Facebook OAuth is only available in production mode with proper configuration'
      }
    });
  });
}

// Apple OAuth routes (only in production with proper config)
if (process.env.NODE_ENV === 'production' && process.env.APPLE_CLIENT_ID) {
  router.get('/apple', passport.authenticate('apple'));

  router.post('/apple/callback',
    passport.authenticate('apple', { failureRedirect: '/login?error=oauth_failed' }),
    (req: Request, res: Response) => {
      try {
        const { user, accessToken, refreshToken } = req.user as any;
        
        // Redirect to frontend with tokens
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const redirectUrl = `${frontendUrl}/auth/callback?token=${accessToken}&refresh=${refreshToken}&user=${encodeURIComponent(JSON.stringify(user))}`;
        
        res.redirect(redirectUrl);
      } catch (error) {
        logger.error('Apple OAuth callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_failed`);
      }
    }
  );
} else {
  router.get('/apple', (_req: Request, res: Response) => {
    res.status(503).json({
      success: false,
      error: {
        code: 'OAUTH_NOT_AVAILABLE',
        message: 'Apple OAuth is only available in production mode with proper configuration'
      }
    });
  });

  router.post('/apple/callback', (_req: Request, res: Response) => {
    res.status(503).json({
      success: false,
      error: {
        code: 'OAUTH_NOT_AVAILABLE',
        message: 'Apple OAuth is only available in production mode with proper configuration'
      }
    });
  });
}

// OAuth status endpoint
router.get('/status', (_req: Request, res: Response) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.json({
    success: true,
    message: isProduction ? 'OAuth service is running in production mode' : 'OAuth service is disabled in development mode',
    environment: process.env.NODE_ENV || 'development',
    providers: {
      google: isProduction && !!process.env.GOOGLE_CLIENT_ID,
      facebook: isProduction && !!process.env.FACEBOOK_APP_ID,
      apple: isProduction && !!process.env.APPLE_CLIENT_ID
    },
    note: isProduction ? 'OAuth providers are available' : 'OAuth providers are disabled in development. Set NODE_ENV=production and configure OAuth credentials to enable.'
  });
});

export default router;
