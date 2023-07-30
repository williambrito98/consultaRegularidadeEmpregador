const { setTimeout } = require("timers/promises");
const axios = require("axios").default;

module.exports = async function solution(requestId) {
  await setTimeout(process.env.TIMEOUT_NORMAL_CAPTCHA);
  const response = await axios({
    method: "GET",
    url: process.env.URL_SOLUTION_CAPTCHA,
    params: {
      key: process.env.API_KEY_CAPTCHA,
      action: "get",
      id: requestId,
      json: 1,
    },
  });
  if (response.data?.status !== 1) {
    if (response.data?.request === "CAPCHA_NOT_READY") {
      return await solution(requestId);
    }
    throw new Error(JSON.stringify(response.data));
  }
  return response.data?.request;
};
