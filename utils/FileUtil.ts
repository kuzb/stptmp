import { isAbsolute, join } from 'std/path';

class FileUtil {
  static async exists(base: string): Promise<boolean> {
    const path = isAbsolute(base) ? base : join(Deno.cwd(), base);

    try {
      await Deno.stat(path);

      return true;
    } catch {
      return false;
    }
  }

  static existsSync(base: string): boolean {
    const path = isAbsolute(base) ? base : join(Deno.cwd(), base);

    try {
      Deno.statSync(path);

      return true;
    } catch {
      return false;
    }
  }
}

export default FileUtil;
