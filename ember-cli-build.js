'use strict';

const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function(defaults) {
  let app = new EmberAddon(defaults, {
    // Add options here
  });

  app.import('node_modules/bootstrap/dist/css/bootstrap.css');
  app.import('node_modules/bootstrap/dist/css/bootstrap.css.map', {
    destDir: 'assets'
  });

  return app.toTree();
};
