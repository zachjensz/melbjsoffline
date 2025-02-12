const cacheFirst = self.addEventListener("install", (event) => {
  event.waitUntil(async () => {
    const cache = await caches.open("v1");
    await cache.addAll(["./", "./index.html", "./avatars/*"]);
  });
});

self.addEventListener("fetch", (event) => {
  event.respondWith(async (request = event.request) => {
    const responseFromCache = await caches.match(request);
    if (responseFromCache) {
      return responseFromCache;
    }

    try {
      const responseFromNetwork = await fetch(request.clone());
      const cache = await caches.open("v1");
      await cache.put(request, responseFromNetwork.clone());
      return responseFromNetwork;
    } catch (error) {
      const fallbackResponse = await caches.match("./index.html");
      if (fallbackResponse) {
        return fallbackResponse;
      }
      return new Response("Could not find resource", {
        status: 404,
        headers: { "Content-Type": "text/plain" },
      });
    }
  });
});
