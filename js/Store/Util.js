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
    }
}
return Util;
});
