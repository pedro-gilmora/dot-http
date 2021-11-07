export class FetchError extends Error {
  code: number;
  description: string;
  constructor(code: number, message: string, description: string) {
    super(message);
    Object.assign(this, { code, description });
  }
}
