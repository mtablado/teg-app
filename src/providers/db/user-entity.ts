export class User {
  // Database id.
  public rowid;
  // Backend id ¿Should we remove it?
  public id;
  public username;
  public name;
  public lastname;
  // This is a user preference or app configuration that could be
  // stored in another entity. Currently it doesn't worth another service.
  public shareLocation;

  public toString() {
    return "rowid: " + this.rowid
      + ", id: " + this.id
      + ", username: " + this.username
      + ", name: " + this.name
      + ", lastname: " + this.lastname;
  }
}
