const axios = require("axios").default;

module.exports = async (imgBase64) => {
  const response = await axios({
    method: "POST",
    url: process.env.URL_SUBMIT_CAPTCHA,
    data: {
      key: process.env.API_KEY_CAPTCHA,
      method: "base64",
      body: imgBase64,
      json: 1,
      regsense: 1,
    },
  });
  if (response.data?.status !== 1) {
    throw new Error(JSON.stringify(response.data));
  }
  return response.data?.request;
};
