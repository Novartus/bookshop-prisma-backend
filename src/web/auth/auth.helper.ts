import * as bcrypt from 'bcrypt';

export class AuthHelper {
  static async validate(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  static async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }
}
