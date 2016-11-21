define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
   'dojo/_base/Color',
    'dojox/color',
    'JBrowse/View/Track/Wiggle/Density',
    'JBrowse/Util',
    'NucleotideDensityPlugin/Store/SeqFeature/NucDensityMulti',
    'NucleotideDensityPlugin/View/ColorHandler',
    'NucleotideDensityPlugin/View/Dialog/NucleotideDensityDialog'
],
function(
    declare,
    array,
    lang,
    Color,
    dojoxColor,
    WiggleDensity,
    Util,
    NucContent,
    ColorHandler,
    NucDensDialog
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
            //var tmp = [''].concat(this.config.context);
            this.labels = array.map(this.config.context, function(ctx){
                return {name: ctx};
            });
            this.randomColors = ColorHandler.generateRandomColors(this.config.context);
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

        /*getConfigColor: function( seqCtx ){
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
        },*/

        getConfigColor: function(seqCtx){
            return ColorHandler.getConfigColor(seqCtx, this.config.contexts, this.config.colors, this.randomColors);
        },

        getConfForFeature: function(opt, feature){
            if(opt === 'style.pos_color')
                return this.getConfigColor(feature.name);
            else
                return this.inherited(arguments);
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
                            color: ColorHandler.getFontColor(bg)
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
        },
        _trackMenuOptions: function() {
            var track = this;
            var options = this.inherited(arguments);
            options.push(
                { type: 'dijit/MenuSeparator' },
                {
                label: 'Track options',
                iconClass: 'dijitIconFunction',
                onClick: function() {
                    new NucDensDialog({
                        setCallback: function(ws, wd, ctx, clr) {
                            track.config.windowSize = ws;
                            track.config.windowDelta = wd;
                            track.config.context = ctx;
                            track.config.colors = clr;
                            track.browser.publish('/jbrowse/v1/c/tracks/replace', [track.config]);
                        },
                        windowSize: track.config.windowSize,
                        windowDelta: track.config.windowDelta,
                        contexts: track.config.context,
                        colors: track.config.colors
                    }).show();
                }
            });
            return options;
        }
    });
});
