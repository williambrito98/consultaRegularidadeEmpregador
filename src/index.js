const {
  workerData,
  Worker,
  isMainThread,
  parentPort,
} = require("worker_threads");
const app = require("./app");
const setVariables = require("./setVariables");
const { join, parse, resolve } = require("path");
const { rmSync } = require("fs");
const { appendFileSync } = require("fs");
const parseXLSToJson = require("./utils/excel/parseXLSXToJson");

(async () => {
  if (isMainThread) {
    const worker = new Worker(__filename, {
      workerData: {
        values: parseXLSToJson(resolve("./entrada"), "Planilha1"),
        __root_dir: process.cwd(),
      },
    });
    require("dotenv").config({
      path: join(parse(__dirname).dir, ".env"),
    });
    worker.on("message", (message) => {
      process.stdout.write(message + "\n");
      if (process.env.CREATE_CONSOLE_FILE === "false") return true;
      appendFileSync(
        join(process.cwd(), "saida", "console.txt"),
        `${message}\n`
      );
    });
    worker.on("exit", () => console.log("FIM"));
    worker.on("online", () => console.log("running"));
    worker.on("error", (error) => console.log("error: " + error));
    // worker.postMessage('close')
  } else {
    require("dotenv").config({
      path: join(workerData.__root_dir, ".env"),
    });

    setVariables(workerData.__root_dir);
    const data = workerData;
    while (true) {
      const execution = await app(
        data,
        {},
        parentPort.postMessage.bind(parentPort)
      );
      const messageError = `${data.values[execution.lastIndex]?.Nome};${
        data.values[execution.lastIndex]?.CNPJ
      };${execution.error}\n`;
      if (!execution.status) {
        console.log(global.attempts);
        if (!execution.continue) {
          appendFileSync(join(global.pathSaida, "erros.csv"), messageError);
          break;
        }
        if (execution.repeat) {
          if (global.attempts > 3) {
            appendFileSync(join(global.pathSaida, "erros.csv"), messageError);
            data.values = data.values.filter(
              (item, index) => index > execution.lastIndex
            );
            global.attempts = 0;
            continue;
          }
          data.values = data.values.filter(
            (item, index) => index >= execution.lastIndex
          );
          global.attempts++;
          continue;
        }
        appendFileSync(join(global.pathSaida, "erros.csv"), messageError);
        data.values = data.values.filter(
          (item, index) => index > execution.lastIndex
        );

        global.attempts = 0;
        continue;
      }
      break;
    }

    rmSync(global.pathTemp, { force: true, recursive: true });
    process.exit();
  }
})();
