define('NucleotideDensityPlugin/View/ColorHandler',[
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dojox/color',
    'dojo/_base/Color',
],
function(
    declare,
    array,
    lang,
    dojoxColor,
    dojoColor

){
    /*
        Utility class dealing with degenerate nucleotide sequences
    */
var ColorHandler;

ColorHandler = {

    generateRandomColors: function( labels ){
        // take in list of labels and return object with equidistant colors
        var s=100, l=65, sep=360/labels.length;
        var hs=[];
        var i;
        for(i=0; i < labels.length; i++){
            hs.push({name: labels[i], value: sep*i});
        }
        var colors ={};
        array.forEach(hs, function(h){
           var t = dojoxColor.fromHsl(h.value, s, l);
            colors[h.name] =t.toHex();
        });
        return colors;
    },

    getFontColor: function(color){
        // from http://stackoverflow.com/questions/1855884/determine-font-color-based-on-background-color
        var bg = new dojoColor(color);
        var rgb = bg.toRgb();
        var a = 1 - ( 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2])/255;
        if(a >= 0.5)
            return '#F0F0F0';
        else
            return '#010101';
    },

    getConfigColor: function( seqCtx, contextConfig, colorConfig, randomColors ){
        // random
        if(colorConfig === 'random')
            return randomColors[seqCtx]
        // other string
        else if(typeof colorConfig === 'string')
            return colorConfig
        // array
        else if(Array.isArray(colorConfig)){
            var j = array.indexOf(seqCtx, contextConfig);
            j %= colorConfig.length;
            return colorConfig[j];
        }
        // object
        else if(colorConfig.hasOwnProperty(seqCtx))
            return colorConfig[seqCtx]
        else
            return randomColors[seqCtx]
    }

    }
return ColorHandler;
});
