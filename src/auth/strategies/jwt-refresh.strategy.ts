export class JwtRefreshStrategy {
  constructor() {}

  validate(payload: { sub: string; email: string }) {
    return payload;
  }
}
