abstract class LOGGER {
  public static info(msg: string) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] INFO - ${msg}`);
  }
  public static error(msg: string) {
    const timestamp = new Date().toISOString();
    const params = `\x1b[31m\x1b[1m\x1b[47m%s\x1b[0m`;
    console.log(`${params}`, `[${timestamp}] ERR - ${msg}`);
  }
  public static warn(msg: string) {
    const timestamp = new Date().toISOString();
    const params = `\x1b[33m\x1b[1m%s\x1b[0m`;
    console.log(`${params}`, `[${timestamp}] WARN - ${msg}`);
  }
}
export { LOGGER };
