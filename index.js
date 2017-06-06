/* eslint-env node */
'use strict';

var fs = require('fs');
var path = require('path');

var Funnel = require('broccoli-funnel');
var mergeTrees = require('broccoli-merge-trees');
var map = require('broccoli-stew').map;

module.exports = {
  name: 'ember-bootstrap-datepicker',

  included: function(app) {
    this._super.included.apply(this, arguments);

    // see: https://github.com/ember-cli/ember-cli/issues/3718
    while (typeof app.import !== 'function' && app.app) {
        app = app.app;
    }

    this.app = app;
    this.bootstrapDatepickerOptions = this.getConfig();

    var vendor = this.treePaths.vendor;

    app.import({
	    development: vendor + '/bootstrap-datepicker/js/bootstrap-datepicker.js',
      production: vendor + '/bootstrap-datepicker/js/bootstrap-datepicker.min.js'
		});

    app.import({
	    development: vendor + '/bootstrap-datepicker/css/bootstrap-datepicker.css',
      production: vendor +  '/bootstrap-datepicker/css/bootstrap-datepicker.min.css'
		}, { prepend: true });

    if (this.bootstrapDatepickerOptions.includeLocales.length) {
        this.bootstrapDatepickerOptions.includeLocales.forEach(function(locale) {
          app.import(vendor +
            '/bootstrap-datepicker/locales/bootstrap-datepicker.' + locale + '.min.js'
			   );
	    });
    }
  },

  getConfig: function() {
    var projectConfig = ((this.project.config(process.env.EMBER_ENV) || {}).bootstrapDatepicker || {});
    var bootstrapDatepickerPath = path.join(
      path.dirname(require.resolve('bootstrap-datepicker')),
      '../'
    );

    var config = Object.assign({ includeLocales: [] }, projectConfig, {
      path: bootstrapDatepickerPath
    })

    config.includeLocales = config.includeLocales
      .filter(function(locale) {
        return typeof locale === 'string';
      })
      .map(function(locale) {
        return locale.replace('.js', '').trim().toLowerCase();
      })
      .filter(function(locale) {
        if (locale === 'en') {
          // english is the default language, skip
          return false;
        }

        var localePath = bootstrapDatepickerPath +
          '/locales/bootstrap-datepicker.' + locale + '.min.js';

        if (!fs.existsSync(localePath)) {
          console.error(
            'ember-cli-bootstrap-datepicker: Specified locale "' + locale +
            '" not found.'
          );

          return false;
        }

        return true;
      });

    return config;
  },

  treeForVendor: function(vendorTree) {
    var trees = [];

    if (vendorTree) {
      trees.push(vendorTree);
    }

    var bootstrapDatepickerPath = this.bootstrapDatepickerOptions.path;
    var datePickerJsTree =  new Funnel(bootstrapDatepickerPath, {
      destDir: 'bootstrap-datepicker',
      include: ['js/*.js']
    });

    datePickerJsTree = map(datePickerJsTree,
        (content) => `if (typeof FastBoot === 'undefined') { ${content} }`);

    trees.push(datePickerJsTree);
    trees.push(new Funnel(bootstrapDatepickerPath, {
      destDir: 'bootstrap-datepicker',
      include: ['css/*.css']
    }));

    if (this.bootstrapDatepickerOptions.includeLocales.length) {
      trees.push(new Funnel(bootstrapDatepickerPath, {
        srcDir: 'locales',
        destDir: 'bootstrap-datepicker/locales'
      }));
    }
    return mergeTrees(trees);
  }
};
