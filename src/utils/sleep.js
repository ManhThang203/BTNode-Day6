function sleep(ms) {
  // Trả về một Promise sẽ được giải quyết sau ms milliseconds
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

module.exports = sleep;
