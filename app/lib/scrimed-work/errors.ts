export class ScrimedWorkPolicyError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status = 403) {
    super(message);
    this.name = "ScrimedWorkPolicyError";
    this.code = code;
    this.status = status;
  }
}
