import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-saml';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class SamlStrategy extends PassportStrategy(Strategy, 'saml') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    const entryPoint = configService.get('SAML_ENTRY_POINT');
    const enabled = configService.get('ENABLE_SSO') === 'true';

    // Only initialize if SAML is enabled
    if (!enabled || !entryPoint) {
      super({
        entryPoint: 'http://localhost:8080/disabled',
        issuer: 'disabled',
        callbackUrl: 'http://localhost:4000/api/auth/saml/callback',
        cert: 'disabled',
      });
      return;
    }

    super({
      entryPoint: entryPoint,
      issuer: configService.get('SAML_ISSUER') || 'framedrop',
      callbackUrl: configService.get('SAML_CALLBACK_URL'),
      cert: configService.get('SAML_CERT'),
      acceptedClockSkewMs: -1,
      identifierFormat: null,
    });
  }

  async validate(profile: any) {
    return this.authService.validateSamlUser(profile);
  }
}
