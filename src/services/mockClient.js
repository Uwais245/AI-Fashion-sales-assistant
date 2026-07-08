// Fake network delay so loading states behave like a real API call.
// api/*.js files call this instead of fetch/axios directly for now.
export function mockRequest(data, { delay = 400, failRate = 0 } = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (failRate > 0 && Math.random() < failRate) {
        reject(new Error('Network error — please try again.'));
        return;
      }
      try {
        resolve(typeof data === 'function' ? data() : data);
      } catch (err) {
        reject(err);
      }
    }, delay);
  });
}
