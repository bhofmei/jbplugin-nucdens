define('NucleotideDensityPlugin/Store/Util',[
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/json',
    'dojo/text!plugins/NucleotideDensityPlugin/nucleotide_table.json'
],
function(
    declare,
    array,
    lang,
    JSON,
    nucleotidetable
){
    /*
        Utility class dealing with degenerate nucleotide sequences
    */
    var Util;
    var ntable = JSON.parse(nucleotidetable);

    Util = {

    _transformNuc: function(inStr){
        var n = inStr.length;
        var outAr = [''];
        var i;
        for(i=0; i < n; i++){
            var p = inStr.charAt(i).toUpperCase();
            var v=ntable[p];
            var newAr= [];
            array.forEach(outAr, function(item){
                var m = array.map(v,function(nuc){
                    return item+nuc;
                });
                newAr.push.apply(newAr, m);
            });

            outAr = newAr;
        }
        return outAr;
    },

    _reverseComplement: function(inStr){
        var baseAr = ['A','C','G','T'];
        var out = '';
        var i,k;
        for(i=0; i < inStr.length; i++){
            k = array.indexOf(baseAr, inStr.charAt(i).toUpperCase());
            if(k===-1)
                out = 'X'+out;
            else
                out = baseAr[3-k] + out;
        }
        return out;
    },

    getPossibilities: function(inStr, bothStrands){
        // first get forward possibilities
        var nucAr = Util._transformNuc(inStr);
        // get reverse
        if(bothStrands){
            var revAr = array.map(nucAr, function(x){
                return Util._reverseComplement(x);
            });
            // combine
            nucAr.push.apply(nucAr, revAr);
        }
        return nucAr;
    }
}
return Util;
});
