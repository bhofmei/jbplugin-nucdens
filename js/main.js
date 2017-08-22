define([
  'dojo/_base/declare',
  'JBrowse/Plugin'
       ],
  function (
    declare,
    JBrowsePlugin
  ) {
    return declare(JBrowsePlugin, {
      constructor: function (args) {
        var browser = args.browser;

        // do anything you need to initialize your plugin here
        console.log("NucleotideDensityPlugin starting");
        // register new track type
        this.config.version = 'v1.1.0';

        browser.registerTrackType({
          label: 'NucDensity',
          type: 'NucleotideDensityPlugin/View/Track/NucleotideDensity'
        });
      }
    });
  });
