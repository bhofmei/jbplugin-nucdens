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
        // register new track type
        this.config.version = '1.1.0';
        console.log("NucleotideDensityPlugin starting - version ", this.config.version);

        browser.registerTrackType({
          label: 'NucDensity',
          type: 'NucleotideDensityPlugin/View/Track/NucleotideDensity'
        });
      }
    });
  });
