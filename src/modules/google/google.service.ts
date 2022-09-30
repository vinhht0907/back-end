import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleService {
  constructor( private configService: ConfigService){
  }

  async getAccessTokenFromCode(request) {
    const client = new OAuth2Client(
      this.configService.get('GOOGLE_CLIENT_ID'),
      this.configService.get('GOOGLE_CLIENT_SECRET'),
      this.configService.get('GOOGLE_REDIRECT_URI')
      ,
    );

    const r = await client.getToken(request.query.code);
    const ticket = await client.verifyIdToken({ idToken: r.tokens.id_token });
    if (ticket) {
      const data = await ticket.getPayload();
      return data;
    } else {
      return null
      // throw new ServiceUnavailableException('UserDatabase service unavaiable');
    }
  }
}
