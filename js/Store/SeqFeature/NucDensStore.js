define( 'NucleotideDensityPlugin/Store/SeqFeature/NucDensStore', [
    'dojo/_base/declare',
    'dojo/_base/array',
    'JBrowse/Store/SeqFeature',
    'JBrowse/Util',
    'JBrowse/Model/CoverageFeature'
],
function(
    declare,
    array,
    SeqFeatureStore,
    Util,
    CoverageFeature
){
    /**
        This class is almost identitical to GCContent class published by Colin
        for the GCContent Plugin ()
        This store class is for a single nucleotide context
    */
    return declare(SeqFeatureStore,{
        constuctor: function(args){
            this.store = args.store;
            this.windowSize = args.windowSize;
            this.windowDelta = args.windowDelta;
            this.name = args.name;
            this.nucLength = args.nLength;
            this.nuc = args.nuc; // array of nucleotide sequence contexts to look for
            // note: all possibilities in nuc must be the same length - nucLength
        },

        getGlobalStats: function(callback, errorCallback){
            callback({});
        },

        getFeatures: function(query, featureCallback, finishCallback, errorCallback){
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
                        score: score,
                        name: thisB.name
                    });
                    featureCallback(feat);
                }
                finishCallback();
            },
            finishCallback,
            errorCallback);
        }

    });
});
