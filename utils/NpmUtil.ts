import DevelopmentError from "/libs/DevelopmentError.ts";

class NpmUtil {
  static async installPackages() {
    const process = Deno.run({
      cmd: ['npm', 'install'],
      stdout: 'piped',
      stderr: 'piped',
    });

    const { code } = await process.status();

    if (code !== 0) throw new DevelopmentError('Failed when installing packages');
  }
}

export default NpmUtil;
