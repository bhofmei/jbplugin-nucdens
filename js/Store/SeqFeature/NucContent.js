define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'JBrowse/Store/SeqFeature',
    'JBrowse/Store/DeferredFeaturesMixin',
    'JBrowse/Util',
    'NucleotideDensityPlugin/Model/NamedCoverageFeature',
    'NucleotideDensityPlugin/Store/Util'
],
function(
    declare,
    array,
    SeqFeatureStore,
    DeferredFeaturesMixin,
    Util,
    CoverageFeature,
    StoreUtil
) {
    /*
        Based on GCContent Plugin
        Adapted for nucleotide context and to be used with multitracks
    */
    return declare([SeqFeatureStore, DeferredFeaturesMixin], {
        constructor: function(args) {
            this.store = args.store;
            this.refSeq = this.store.refSeq;
            this.windowSize = args.windowSize;
            this.windowDelta = args.windowDelta;
            this.bothStrands = args.bothStrands;
            this.nuc = args.nuc;
            this.nucLength = args.nuc.length;
            this.nucAr = StoreUtil.getPossibilities(this.nuc, this.bothStrands);
            this._deferred.features.resolve({success: true});
        },

        _getGlobalStats: function(callback){
            return this.getGlobalStats(callback);
        },

        getGlobalStats: function(callback /* , errorCallback */) {
            var s = dojo.mixin(this.stats, {mean: this.stats.sum / this.stats.count});
            callback(s);
        },

        _getFeatures: function(query, featureCallback, finishCallback, errorCallback){
            //console.log(query.end-query.start,this.nuc);

            this.getFeatures(query, featureCallback, finishCallback, errorCallback);

        },

        getFeatures: function(query, featureCallback, finishCallback, errorCallback) {
            //console.log('getFeatures', this.nuc);
            var hw = this.windowSize / 2; // Half the window size
            query.start = Math.max(0, query.start - hw);
            query.end = Math.min(query.end + hw, this.browser.refSeq.length);
            var thisB = this;

            if (query.end < 0 || query.start > query.end) {
                finishCallback();
                return;
            }
            thisB.stats = {sum: 0, count: 0, min: 5, max: 0};

            this.store.getReferenceSequence(query, function(residues) {
                //console.log(residues.length);
                for (var i = hw; i < residues.length - hw; i += thisB.windowDelta) {

                    //console.log(thisB.nuc);
                    var r = residues.slice(i - hw, i + hw);
                    var rn = r.length - thisB.nucLength;
                    var nc = 0;
                    var ng = 0;
                    for (var j = 0; j < rn; j++) {
                        /*if (r[j] === 'c' || r[j] === 'C') {
                            nc++;
                        } else if (r[j] === 'g' || r[j] === 'G') {
                            ng++;
                        }*/
                        var rs = r.slice(j, j+thisB.nucLength);
                        if(array.indexOf(thisB.nucAr, rs.toUpperCase()) !== -1)
                            nc++;
                    }
                    var pos = query.start;
                    var score = nc / rn;
                    if(thisB.bothStrands)
                        score /= 2;

                    // add to stats
                    thisB.stats.count++;
                    thisB.stats.sum += score;
                    if(score < thisB.stats.min)
                        thisB.stats.min = score;
                    if(score > thisB.stats.max)
                        thisB.stats.max = score;
                    /*if (thisB.gcMode === 'content') {
                        score = (ng + nc) / r.length;
                    } else if (thisB.gcMode === 'skew') {
                        score = (ng - nc) / (ng + nc);
                    }*/
                    var n = thisB.nuc;

                    var feat = new CoverageFeature({
                        start: pos + i,
                        end: pos + i + thisB.windowDelta,
                        score: score,
                        name: n
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
