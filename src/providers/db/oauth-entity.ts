export class OAuthEntity {
  // Database id.
  public username;
  public accessToken;
  public refreshToken;

  public toString() {
    return "username: " + this.username
      + ", accessToken: " + this.accessToken
      + ", refreshToken: " + this.refreshToken;
  }
}
