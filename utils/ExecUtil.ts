import DevelopmentError from '/libs/DevelopmentError.ts';

class ExecUtil {
  static async single(cmd: string[]) {
    const process = Deno.run({
      cmd,
      stdout: 'piped',
      stderr: 'piped',
    });

    const { code } = await process.status();

    if (code !== 0) {
      throw new DevelopmentError(new TextDecoder().decode(await process.stderrOutput()));
    }

    return new TextDecoder().decode(await process.output());
  }

  static async sequence(cmds: string[][]) {
    const response = [];

    for (const cmd of cmds) {
      response.push(await ExecUtil.single(cmd));
    }

    return response;
  }
}

export default ExecUtil;
