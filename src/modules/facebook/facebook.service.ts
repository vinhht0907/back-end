import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FacebookService {
  constructor( private configService: ConfigService){

  }

  async getAccessTokenFromCode(code) {
    try {
      const { data } = await axios({
        url: 'https://graph.facebook.com/v4.0/oauth/access_token',
        method: 'get',
        params: {
          client_id: this.configService.get('FACEBOOK_CLIENT_ID'),
          client_secret: this.configService.get('FACEBOOK_CLIENT_SECRET'),
          redirect_uri: this.configService.get('FACEBOOK_REDIRECT_URI'),
          code,
        },
      });
      if (data.access_token) {
        return this.getFacebookUserData(data.access_token);
      } else {
        return null;
      }
    } catch (e) {
      return null;
      console.log(e);
    }
  };

  async getFacebookUserData(access_token) {
    try {
      const { data } = await axios({
        url: 'https://graph.facebook.com/me',
        method: 'get',
        params: {
          fields: ['id', 'email', 'first_name', 'last_name', 'name', 'picture'].join(','),
          access_token: access_token,
        },
      });
      if (data) {
        return data;
      } else {
        return null;
      }
    } catch (e) {
      return null;
      console.log(e);
    }
  };
}
