import readline from "node:readline";

/**
 * Reads a line of input
 * Will automatically add a space between prompt and input, if the prompt
 * doesn't end with a " " or a "\n"
 *
 * @example
 * const name = await readInput("What's your name?")
 * // What's your name? ▏         // [T][o][m]
 * // What's your name? Tom▏      // [Enter]
 * // returns "Tom"
 * */
export const readInput = async (promptMessage: string): Promise<string> => {
  const readlineInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const isEmpty = promptMessage === "";
  const hasWhiteSpaceEnd = promptMessage.endsWith(" ") || promptMessage.endsWith("\n");
  const question = hasWhiteSpaceEnd || isEmpty ? promptMessage : promptMessage + " ";

  return new Promise((resolve) => {
    readlineInterface.question(question, (answer) => {
      readlineInterface.close();
      resolve(answer);
    });
  });
};
