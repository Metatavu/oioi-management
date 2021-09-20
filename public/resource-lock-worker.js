/* eslint-disable no-restricted-globals */
self.addEventListener("message", async event => {
  const { url, method, headers, body } = event.data;

  try {
    await fetch(url, {
      method: method,
      headers: headers,
      body: body
    });
  } catch (error) {
    console.error("error", error);
  }
});