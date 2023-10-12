export class ResponseUtil<T> {
  constructor(private data: T, private message: string, private code: number) {}

  static success<T>(data: T, message = "ok", code = 1) {
    return new ResponseUtil(data, message, code);
  }

  static error(message = "服务器错误无可奉告", code = 0) {
    return new ResponseUtil<null>(null, message, code);
  }
}
