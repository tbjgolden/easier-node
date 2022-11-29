import readline from "node:readline";

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
