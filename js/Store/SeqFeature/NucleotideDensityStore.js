define( 'NucleotideDensityPlugin/Store/SeqFeature/NucleotideDensityStore', [
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/promise/all',
    'JBrowse/Store/SeqFeature',
    'JBrowse/Util',
    'NucletotideDensityPlugin/Store/Util',
    'NucleotideDensityPlugin/Store/SeqFeature/NucDensStore'
],
function(
    declare,
    array,
    lang,
    all,
    SeqFeatureStore,
    Util,
    storeUtil,
    NucDens
){
    /**
        This class is similar to the bigwig storage class used in MethylationPlugin
        Used to store multiple storage tracks, one for each sequence context
    */
    return declare(SeqFeatureStore,{
        constuctor: function(args){
            var thisB = this;
            this.windowSize = args.windowSize;
            this.windowDelta = args.windowDelta;
            if(args.config.context == undefined )
                this.config.context = ['CG', 'CHG', 'CHH'];
            else
                this.config.context = array.map(args.config.context, function(x){ x.toUpperCase()});
            // get prep info
            var contextInfo = array.map(this.config.context, function(ctx){
                return {name: ctx, nuc: storeUtil.getPossibilities(ctx), nLength:ctx.length};
            })

            // get storage classes
            this.stores = array.map(contextInfo, function(ctx){
                return new NucDens( lang.mixin(args, ctx));
            });

            // get the features
            all( array.map( this.stores, function(store) {
                return store._deferred.features
            })).then( function() {
                thisB._deferred.features.resolve({success: true});
            },
                lang.hitch( this, '_failAllDeferred' )
                );
        },

        getGlobalStats: function(callback, errorCallback){
            callback({});
        },
        getRegionStats: function(query, callback, errorCallback){
            callback({});
        },

        _getFeatures( query, featureCallback, endCallback, errorCallback){
            var thisB = this;
            var finished = 0;
            var finishCallback = function() {
                if(thisB.stores.length == ++finished) {
                    endCallback();
                }
            }
            array.forEach( this.stores, function(store) {
                store._getFeatures( query,
                featureCallback, finishCallback, errorCallback
                );
            });
        }

        /*getFeatures: function(query, featureCallback, finishCallback, errorCallback){
            // generate features
            var hw = this.windowSize / 2; // Half the window size
            query.start = Math.max(0, query.start - hw);
            query.end = Math.min(query.end + hw, this.browser.refSeq.length);
            var thisB = this;

            if (query.end < 0 || query.start > query.end) {
                finishCallback();
                return;
            }

            this.store.getReferenceSequence(query, function(residues) {
                for (var i = hw; i < residues.length - hw; i += thisB.windowDelta) {
                    var r = residues.slice(i - hw, i + hw);
                    var rn = r.length - thisB.nucLength;
                    var count = 0
                    for (var j = 0; j <= rn; j++) {
                        var rs = r.slice(j, j+thisB.nucLength);
                        if( array.indexOf(thisB.nuc, rs.toUpperCase()) !== -1 )
                            count ++;
                    }
                    var pos = query.start;
                    var score = count / rn;

                    var feat = new CoverageFeature({
                        start: pos + i,
                        end: pos + i + thisB.windowDelta,
                        score: score
                    });
                    featureCallback(feat);
                }
                finishCallback();
            },
            finishCallback,
            errorCallback);
        }*/

    });
});
