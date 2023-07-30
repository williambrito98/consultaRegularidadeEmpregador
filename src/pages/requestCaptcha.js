const axios = require("axios").default;
const { load } = require("cheerio");
const submit = require("../utils/captcha/normal/submit");
const solution = require("../utils/captcha/normal/solution");
const { writeFileSync } = require("fs");

module.exports = async (CONFIG) => {
  const response = await axios({
    method: "get",
    url: "https://consulta-crf.caixa.gov.br/consultacrf/pages/consultaEmpregador.jsf",
    headers: CONFIG.headers,
  });
  if (response.status !== 200) {
    throw new Error(JSON.stringify(response.data));
  }

  const cookies = response.headers?.["set-cookie"]?.join(";");
  const $ = load(response.data);
  const javaFacesViewState = $("input[name='javax.faces.ViewState']").val();
  const imgCaptcha = $("#captchaImg_N2").attr("src");
  const captchaRequestId = await submit(imgCaptcha);
  const captchaSolution = await solution(captchaRequestId);
  console.log(captchaSolution, javaFacesViewState);
  return { captchaSolution, javaFacesViewState, cookies };
};
