define([
           'dojo/_base/declare',
           'JBrowse/Plugin',
    'NucleotideDensityPlugin/Store/Util'
       ],
       function(
           declare,
           JBrowsePlugin,
            storeUtil
       ) {
return declare( JBrowsePlugin,
{
    constructor: function( args ) {
        var browser = args.browser;

        // do anything you need to initialize your plugin here
        console.log( "NucleotideDensityPlugin plugin starting" );
        // register new track type

        browser.registerTrackType({
           label: 'NucDensity',
            type: 'NucleotideDensityPlugin/View/Track/NucDensityMulti'
        });
        /*var p = new ndstore({context:['CG'], windowDelta: 100, windowSize: 500, browser: browser, refSeq: 'stuff'});
        console.log(p);*/
        /*var m = 'chg';
        var t = storeUtil._transformNuc(m);
        //console.log(m,t);
        m='whh';
        var t = storeUtil._transformNuc(m);
        //console.log(m,t);
        //console.log('jls', storeUtil._reverseComplement('jls'));
        console.log('chh',storeUtil.getPossibilities('chh'));*/
    }
});
});
