const { join } = require("path");
const CONFIG = require("../config.json");
const requestCaptcha = require("./pages/requestCaptcha");
const consultaEmpregador = require("./pages/consultaEmpregador");
const { appendFileSync } = require("fs");
const NaoCadastrado = require("./errors/NaoCadastrado");

module.exports = async (data, selector, log) => {
  let lastIndex;
  try {
    for (const [index, cliente] of Object.entries(data.values)) {
      lastIndex = index;
      console.log(cliente.Nome, cliente.CNPJ);
      const { captchaSolution, javaFacesViewState, cookies } =
        await requestCaptcha(CONFIG);
      const { razao, situacao } = await consultaEmpregador(
        captchaSolution,
        cliente.CNPJ?.toString().trim(),
        javaFacesViewState,
        cookies
      );

      appendFileSync(
        join(global.pathSaida, "relatorio.csv"),
        `${cliente.Nome};${cliente.CNPJ};${razao};${situacao}\n`
      );
      global.attempts = 0;
    }
  } catch (error) {
    log(error);
    if (error instanceof NaoCadastrado) {
      return {
        status: false,
        continue: true,
        repeat: false,
        lastIndex,
        error: error.message,
      };
    }

    return {
      status: false,
      continue: true,
      repeat: true,
      lastIndex,
      error: error?.message,
    };
  }
};
