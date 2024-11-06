const errorController = require("../controllers/errorSocketController");

module.exports = async function (fn, isAsync, params = {}) {
  try {
    const fnBind = fn.bind(this);
    if (isAsync) {
      return await fnBind(...Object.values(params));
    }
    return fnBind(...Object.values(params));
  } catch (err) {
    if (params.socket) {
      errorController(params.socket, err);
    } else {
      console.error("Error sin socket disponible:", err);
    }
  }
};