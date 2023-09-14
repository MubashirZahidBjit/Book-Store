const success = (message, data = null) => {
  return {
    success: true,
    message: message,
    data: data,
  };
};

const failure = (message, error) => {
  return {
    success: false,
    message: message,
    error: error,
  };
};

module.exports = { success, failure };
