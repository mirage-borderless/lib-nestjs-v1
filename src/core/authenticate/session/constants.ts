export namespace CookieKeys {
  export const AUTHORIZATION: string = 's.id'
}
export namespace ErrorMessage {
  export const ALERT = {
    tokenExpired: 'authenticate.alert.token_expired',
    accessDenied: 'authenticate.alert.access_denied',
    invalidToken: 'authenticate.alert.invalid_token',
    unauthorized: 'authenticate.alert.unauthorized'
  }

  export const SIGN_IN = {
    wrongPass:    'authenticate.sign_in.wrong_pass',
    notExistUser: 'authenticate.sign_in.not_exist_user'
  }
}