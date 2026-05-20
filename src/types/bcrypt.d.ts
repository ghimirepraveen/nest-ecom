declare module 'bcrypt' {
  export function hash(data: string, saltRounds: number): Promise<string>;
  export function compare(data: string, encrypted: string): Promise<boolean>;

  const bcrypt: {
    hash(data: string, saltRounds: number): Promise<string>;
    compare(data: string, encrypted: string): Promise<boolean>;
  };

  export = bcrypt;
}
