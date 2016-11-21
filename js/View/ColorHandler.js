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
        var rColors = this.generateNColors(labels.length);
        var colors ={};
        var i;
        for(i=0; i<labels.length; i++){
            colors[labels[i]] = rColors[i];
        }
        return colors;
    },

    generateNColors: function(n){
        var s=100, l=65, sep=360/n;
        var hs=[];
        var i;
        for(i=0; i < n; i++){
            hs.push(sep*i);
        }
        var out = array.map(hs, function(h){
            var t = dojoxColor.fromHsl(h, s, l);
            return t.toHex();
        });
        return out;
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
            return this.contextToColorFromList(seqCtx, contextConfig, colorConfig, true);
        }
        // object
        else if(colorConfig.hasOwnProperty(seqCtx))
            return colorConfig[seqCtx]
        else
            return randomColors[seqCtx]
    },

    getColorType: function( colorConfig ){
        // return "random", "single", or "individual"
        if(colorConfig === 'random')
            return 'random';
        else if(typeof colorConfig === 'string')
            return 'single';
        else
            return 'individual';
    },

    contextToColorFromList: function(seqCtx, contextList, colorList, repeatable=true){
        var k = 0;
        for(k=0; k<contextList.length; k++)
            if(contextList[k]===seqCtx)
                break;
        return this.intToColorFromList(k, colorList, repeatable);
    },

    intToColorFromList: function(n, colorList, repeatable){
        if(n >= colorList.length && !repeatable)
            return undefined;
        n %= colorList.length;
        return colorList[n];
    }

    }
return ColorHandler;
});
