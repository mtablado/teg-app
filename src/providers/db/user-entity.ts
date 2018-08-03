export class User {
  // Database id.
  public rowid;
  // Backend id ¿Should we remove it?
  public id;
  public username;
  public name;
  public lastname;

  public toString() {
    return "rowid: " + this.rowid
      + ", id: " + this.id
      + ", username: " + this.username
      + ", name: " + this.name
      + ", lastname: " + this.lastname;
  }
}
