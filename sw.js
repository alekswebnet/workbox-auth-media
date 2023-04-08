// Import Workbox using CDN
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');
// Import idb-keyval using CDN
importScripts('https://cdn.jsdelivr.net/npm/idb-keyval@6/dist/umd.js');

// Load the necessary Workbox modules
workbox.loadModule('workbox-strategies');
workbox.loadModule('workbox-routing');
workbox.loadModule('workbox-expiration');

const { registerRoute, Route } = workbox.routing; 
const { NetworkFirst } = workbox.strategies;

// Define a custom plugin to add an auth header with a bearer token to the request
const authenticationPlugin = {
  requestWillFetch: async ({ request }) => {
    const headers = new Headers(request.headers);
    try {
      const token = await self.idbKeyval.get('ACCESS_TOKEN');
      console.warn(token)
      headers.append('authorization', `Bearer ${token}`);
    } catch (error) {
      console.warn('Authorization token not found!');
      console.warn(error);
    }
    return new Request(request, {
      mode: 'same-origin',
      headers
    });
  },
};

// Define a new route for protected media files using NetworkFirst strategy and the authentication plugin
const protectedMediaRoute = new Route(({ request }) => 
  request.url.includes('media/'),
  new NetworkFirst({
    plugins: [
      authenticationPlugin
    ]
  })
);

// Register the protected media route with the Workbox router
registerRoute(protectedMediaRoute);