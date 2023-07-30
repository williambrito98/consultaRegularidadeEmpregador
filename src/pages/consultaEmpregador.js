const axios = require("axios").default;
const { load } = require("cheerio");
const NaoCadastrado = require("../errors/NaoCadastrado");
const { getRandom } = require("random-useragent");
module.exports = async function consultaEmpregador(
  captchaSolution,
  cnpj,
  javaFacesViewState,
  cookies
) {
  const response = await axios({
    method: "POST",
    url: "https://consulta-crf.caixa.gov.br/consultacrf/pages/consultaEmpregador.jsf",
    data: `AJAXREQUEST=_viewRoot&mainForm%3AtipoEstabelecimento=1&mainForm%3AtxtInscricao1=${cnpj}&mainForm%3Auf=&mainForm%3AtxtCaptcha=${captchaSolution}&mainForm=mainForm&autoScroll=&javax.faces.ViewState=${javaFacesViewState}&mainForm%3AbtnConsultar=mainForm%3AbtnConsultar`,
    headers: {
      Accept: "*",
      "Content-Type": "application/x-www-form-urlencoded",
      "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "sec-ch-ua":
        'Not/A)Brand";v="99", "Google Chrome";v="115", "Chromium";v="115"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "Windows",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "User-Agent": getRandom(),
      cookie: cookies,
    },
    Referer:
      "https://consulta-crf.caixa.gov.br/consultacrf/pages/consultaEmpregador.jsf",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  });

  if (response.status !== 200) {
    throw new Error(JSON.stringify(response.data));
  }

  const $ = load(response.data);
  const naoCadastrado = $(
    "#mainForm > div:nth-child(3) > div:nth-child(2) > div"
  )
    .text()
    .trim();
  if (naoCadastrado) {
    throw new NaoCadastrado(naoCadastrado);
  }
  let situacao = $(
    "#mainForm > div:nth-child(8) > div > span, #mainForm > div:nth-child(9) > div > span"
  )
    .text()
    .trim();
  const razao = $("#mainForm > div:nth-child(11)")
    .text()
    ?.trim()
    .match(/social:.+\n/gim)
    ?.pop()
    ?.replace(/social:|\n/gim, "")
    ?.trim();

  console.log(situacao, razao);
  if (!situacao || !razao) {
    throw new Error("Situacao ou Razão não encontrado. Tentando navamente");
  }
  return { razao, situacao };
};
