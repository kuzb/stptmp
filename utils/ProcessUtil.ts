import { green, red } from 'std/fmt/colors';
import { wait } from 'wait';

type Status = 'warn' | 'fail' | 'success' | 'start';

class ProcessUtil {
  static async run(
    callback: () => Promise<void | Status>,
    { startText, successText, failText, warnText }: {
      startText: string;
      successText: string;
      failText: string;
      warnText?: string;
    },
  ) {
    const spinner = wait(green(startText)).start();

    try {
      const status = await callback() || { text: successText, status: 'success' };

      if (status === 'warn') spinner.warn(warnText);
      else spinner.succeed(successText);
    } catch (error) {
      spinner.fail(red(failText));

      throw error;
    }
  }
}

export default ProcessUtil;
