const HTTP_STATUS_CODES = {
  GET: { success: 200, error: 400 },
  POST: { success: 201, error: 400 },
  PUT: { success: 200, error: 400 },
  PATCH: { success: 200, error: 400 },
  DELETE: { success: 204, error: 400 },
};

const DEFAULT_ERROR_CODE = 'ERROR_MESSAGE';

function createResponse({ 
  success = false, 
  code = DEFAULT_ERROR_CODE, 
  data = null, 
  placeholder = null, 
  method = 'GET',
  customStatus = null
} = {}) {
  const methodStatus = HTTP_STATUS_CODES[method.toUpperCase()] || HTTP_STATUS_CODES.GET;
  const status = customStatus || (success ? methodStatus.success : methodStatus.error);

  return {
    success,
    code: success ? 'Error al ejecutar' : code,
    data,
    placeholder,
    status
  };
}

const responseFactory = {
  success: (params = {}) => createResponse({ ...params, success: true }),
  error: (params = {}) => createResponse({ ...params, success: false }),
  get: (params = {}) => createResponse({ ...params, method: 'GET' }),
  post: (params = {}) => createResponse({ ...params, method: 'POST' }),
  put: (params = {}) => createResponse({ ...params, method: 'PUT' }),
  patch: (params = {}) => createResponse({ ...params, method: 'PATCH' }),
  delete: (params = {}) => createResponse({ ...params, method: 'DELETE' }),
};

module.exports = responseFactory;