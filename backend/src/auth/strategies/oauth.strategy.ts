import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class OAuthStrategy extends PassportStrategy(Strategy, 'oauth') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    const clientID = configService.get('OAUTH_CLIENT_ID');
    const enabled = configService.get('ENABLE_SSO') === 'true';

    // Only initialize if OAuth is enabled
    if (!enabled || !clientID) {
      super({
        authorizationURL: 'http://localhost:8080/disabled',
        tokenURL: 'http://localhost:8080/disabled',
        clientID: 'disabled',
        clientSecret: 'disabled',
        callbackURL: 'http://localhost:4000/api/auth/oauth/callback',
      });
      return;
    }

    super({
      authorizationURL: configService.get('OAUTH_AUTHORIZATION_URL'),
      tokenURL: configService.get('OAUTH_TOKEN_URL'),
      clientID: clientID,
      clientSecret: configService.get('OAUTH_CLIENT_SECRET'),
      callbackURL: configService.get('OAUTH_CALLBACK_URL'),
      scope: ['openid', 'profile', 'email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    return this.authService.validateOAuthUser(profile);
  }

  async userProfile(accessToken: string, done: any) {
    const userInfoUrl = this.configService.get('OAUTH_USER_INFO_URL');

    if (!userInfoUrl) {
      return done(null, {});
    }

    try {
      const response = await fetch(userInfoUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const profile = await response.json();
      done(null, profile);
    } catch (error) {
      done(error);
    }
  }
}
