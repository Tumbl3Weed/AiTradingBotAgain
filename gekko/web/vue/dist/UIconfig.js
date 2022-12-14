// Note: this file gets copied around, make sure you edit
// the UIconfig located at `gekko/web/vue/dist/UIconfig.js`.

// This config is used by both the frontend as well as the web server.
// see https://gekko.wizb.it/docs/installation/installing_gekko_on_a_server.html#Configuring-Gekko

const CONFIG = {
  headless: true,
  api: {
    host: '127.0.0.1',
    port: 3000,
    timeout: 960000 * 2 // 2 minutes
  },
  api2: {
    host: '127.0.0.2',
    port: 3000,
    timeout: 960000 // 2 minutes
  },
  ui: {
    ssl: false,
    host: 'localhost',
    port: 3000,
    path: '/'
  },
  ui2: {
    ssl: false,
    host: 'localhost2',
    port: 3000,
    path: '/'
  },
  adapter: 'sqlite'
}

if (typeof window === 'undefined')
  module.exports = CONFIG;
else
  window.CONFIG = CONFIG;
