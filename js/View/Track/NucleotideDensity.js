define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
   'dojo/_base/Color',
    'dojox/color',
    'NucleotideDensityPlugin/Store/SeqFeature/NucContentMulti',
    'JBrowse/View/Track/Wiggle/Density',
    'JBrowse/Util',
    'dijit/Tooltip'
],
function(
    declare,
    array,
    lang,
    Color,
    dojoxColor,
    NucContent,
    WiggleDensity,
    Util,
     Tooltip
) {
    return declare(WiggleDensity, {
        constructor: function() {
            this.store = new NucContent({
                store: this.store,
                browser: this.browser,
                windowSize: this.config.windowSize,
                windowDelta: this.config.windowDelta,
                bothStrands: this.config.bothStrands,
                contexts: this.config.context
            });
            var tmp = [''].concat(this.config.context);
            this.labels = array.map(this.config.context, function(ctx){
                return {name: ctx};
            });
            this.randomColors = this._generateRandomColors(this.config.context);
        },

        _defaultConfig: function() {
            return Util.deepUpdate(lang.clone(this.inherited(arguments)), {
                min_score: 0,
                max_score: 1,
                windowSize: 100,
                windowDelta: 10,
                //scoreType: 'avgScore',
                logScaleOption: false,
                showLabels: true,
                colors: 'random',
                bothStrands: false
                /*style:{
                    pos_color: 'red',
                    neg_color: 'white'
                }*/
            });
        },

        getConfigColor: function( seqCtx ){
            var color = this.config.colors;
            // random
            if(color === 'random')
                return this.randomColors[seqCtx]
            // other string
            else if(typeof color === 'string')
                return color
            // array
            else if(Array.isArray(color)){
                var j = array.indexOf(seqCtx, this.config.context);
                j %= color.length;
                return color[j];
            }
            // object
            else if(color.hasOwnProperty(seqCtx))
                return color[seqCtx]
            else
                return this.randomColors[seqCtx]
        },

        getConfForFeature: function(opt, feature){
            if(opt === 'style.pos_color')
                return this.getConfigColor(feature.name);
            else
                return this.inherited(arguments);
        },

        getFontColor: function(color){
            // from http://stackoverflow.com/questions/1855884/determine-font-color-based-on-background-color
            var bg = new Color(color);
            var rgb = bg.toRgb();
            var a = 1 - ( 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2])/255;
            if(a >= 0.5)
                return '#F0F0F0';
            else
                return '#010101';
        },

        _generateRandomColors: function( labels ){
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

        _calculatePixelScores: function(canvasWidth, features, featureRects) {
            var pixelValues = new Array(canvasWidth);
            array.forEach(features, function(f, i) {
                var fRect = featureRects[i];
                var jEnd = fRect.r;
                var score = f.get('score');
                /*if(score!==0)
                    console.log(f);*/
                for (var k = 0; k < this.labels.length; k++) {
                    //console.log(this.labels[k].name, f.get('name'));
                    if (this.labels[k].name === f.get('name')) {
                        break;
                    }
                }
                //console.log(k,f.name);
                for (var j = Math.round(fRect.l); j < jEnd; j++) {
                    if (!pixelValues[j]) {
                        pixelValues[j] = new Array(this.labels.length);
                    }
                    //console.log(j,k,f.name);
                    if (!pixelValues[j][k]) {

                        pixelValues[j][k] = { score: score, feat: f };
                    }
                }
            }, this);

            return pixelValues;
        },

        _drawFeatures: function(scale, leftBase, rightBase, block, canvas, pixels, dataScale) {
            //console.log(pixels);
            var thisB = this;
            var context = canvas.getContext('2d');
            var canvasHeight = canvas.height;
            var featureColor = typeof this.config.style.color === 'function' ? this.config.style.color :
                (function() { // default color function uses conf variables
                    var disableClipMarkers = thisB.config.disable_clip_markers;
                    var normOrigin = dataScale.normalize(dataScale.origin);

                    return function(p, n) {
                        var feature = p.feat;
                        var ret;
                        // not clipped
                        if (disableClipMarkers || n <= 1 && n >= 0) {
                            ret = Color.blendColors(
                                new Color(thisB.getConfForFeature('style.bg_color', feature)),
                                new Color(thisB.getConfForFeature(n >= normOrigin ? 'style.pos_color' : 'style.neg_color', feature)),
                                Math.abs(n - normOrigin)
                            ).toString();
                        } else {
                            ret = (n > 1 ? thisB.getConfForFeature('style.pos_color', feature)
                                       : thisB.getConfForFeature('style.neg_color', feature));
                        }
                        return ret;
                    };
                })();

            var resolution = Util.getResolution(context, this.browser.config.highResolutionMode);
            var kheight = canvasHeight / (this.labels.length * resolution);

            array.forEach(pixels, function(p, i) {
                if (p) {
                    array.forEach(p, function(pi, j) {
                        if (pi) {
                            var score = pi.score;
                            var n = dataScale.normalize(score);
                            context.fillStyle = '' + featureColor(pi, n);
                            thisB._fillRectMod(context, i, j * kheight, 1, kheight);
                        }
                    });
                }
            });
        },

        makeTrackLabel: function() {
            var canvasHeight = this.config.style.height;
            var kheight = canvasHeight / (this.labels.length);
            var thisB = this;
            this.inherited(arguments);
            if (this.config.showLabels) {
                var subTable =  dojo.create('div',{className:'track-sublabels'},this.div);
                this.sublabels = array.map(this.labels, function(elt) {
                    var bg = thisB.getConfigColor(elt.name);
                    var htmlnode = dojo.create('div', {
                        className: 'nuc-dens-sublabel',
                        id: elt.name,
                        style: {
                            position: 'absolute',
                            height: (kheight - 1) + 'px',
                            width: thisB.config.labelWidth ? thisB.config.labelWidth + 'px' : null,
                            font: thisB.config.labelFont,
                            backgroundColor: bg,
                            color: thisB.getFontColor(bg)
                        },
                        innerHTML: elt.name,
                        title: elt.name
                    }, subTable);
                    return htmlnode;
                });
            }
        },
        updateStaticElements: function(/** Object*/ coords) {
            this.inherited(arguments);
            var height = this.config.style.height - 2;
            if (this.sublabels && 'x' in coords) {
                var len = this.sublabels.length;
                array.forEach(this.sublabels, function(sublabel, i) {
                    sublabel.style.left = coords.x + 'px';
                    sublabel.style.top = i * height / len + 'px';
                    if (i == len - 1) {
                        dojo.addClass(sublabel, 'last');
                    }
                }, this);
            }
        }
        /*_trackMenuOptions: function() {
            var track = this;
            var options = this.inherited(arguments);
            options.push({
                label: 'GC Track Options',
                onClick: function() {
                    new WindowSize({
                        setCallback: function(ws, wd, mode) {
                            track.config.windowSize = ws;
                            track.config.windowDelta = wd;
                            track.config.gcMode = mode;
                            if (mode === 'skew') {
                                track.config.min_score = -1;
                                track.config.bicolor_pivot = 0;
                            } else {
                                track.config.min_score = 0;
                                track.config.bicolor_pivot = 0.5;
                            }
                            track.browser.publish('/jbrowse/v1/c/tracks/replace', [track.config]);
                        },
                        windowSize: track.config.windowSize,
                        windowDelta: track.config.windowDelta,
                        gcMode: track.config.gcMode
                    }).show();
                }
            });
            return options;
        }*/
    });
});
