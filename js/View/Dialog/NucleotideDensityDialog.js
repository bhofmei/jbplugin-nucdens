define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/dom-construct',
    'dojo/dom-style',
    'dojo/on',
    "dojo/domReady!",
    'dojo/request/script',
    'dijit/focus',
    'dijit/form/NumberSpinner',
    'dijit/form/Button',
    'dijit/form/RadioButton',
    'dijit/form/ValidationTextBox',
    'dijit/form/TextBox',
    "dijit/InlineEditBox",
    'JBrowse/View/Dialog/WithActionBar',
    'dojox/widget/ColorPicker',
    'NucleotideDensityPlugin/View/ColorHandler'
],
function(
    declare,
    array,
    lang,
    dom,
    domStyle,
    on,
    domReady,
    dojoScript,
    focus,
    NumberSpinner,
    Button,
    dijitRadioButton,
    ValidationTextBox,
    TextBox,
    InlineEditBox,
    ActionBarDialog,
    ColorPicker,
    ColorHandler
) {
    return declare(ActionBarDialog, {
        title: 'Set Nucleotide Density Track Options',

        constructor: function(args) {
            this.windowSize      = args.windowSize || 100;
            this.windowDelta     = args.windowDelta || 10;
            this.browser         = args.browser;
            this.contexts = args.contexts | [];
            this.colors = args.colors;
            this.colorType = ColorHandler.getColorType(this.colors);
            this.singleColor = this.colorType === 'single' ? this.colors : '';
            this.randomColors = args.randomColors;
            this.setCallback     = args.setCallback || function() {};
            this.cancelCallback  = args.cancelCallback || function() {};
        },

        _fillActionBar: function(actionBar) {
            new Button({
                label: 'OK',
                onClick: lang.hitch(this, function() {
                    var windowSize = +this.windowSizeSpinner.getValue();
                    var windowDelta = +this.windowDeltaSpinner.getValue();
                    if (isNaN(windowSize) || isNaN(windowDelta)) {
                        return;
                    }
                    var returnCtx = array.map(this.contextInputs, function(input){
                        return input.value.toUpperCase();
                    });
                    //console.log(returnCtx);
                    this.setCallback && this.setCallback(windowSize, windowDelta);
                    this.hide();
                })
            }).placeAt(actionBar);

            new Button({
                label: 'Cancel',
                onClick: lang.hitch(this, function() {
                    this.cancelCallback && this.cancelCallback();
                    this.hide();
                })
            }).placeAt(actionBar);
        },

        show: function(/* callback */) {
            dojo.addClass(this.domNode, 'nuc-dens-dialog');


            var topPane = dom.create('div',{id:'nuc-dens-parameters'});
            this._createTopPane(topPane);
            // bottom pane with nucleotide contexts
            var bottomPane = dom.create('div',{id:'nuc-dens-contexts'});
            this._createBottomPane(bottomPane);
            this.set('content', [
                topPane,
                bottomPane
            ]);

            this.inherited(arguments);
            dojoScript.get('plugins/NucleotideDensityPlugin/js/View/jscolor.js');
        },

        _createTopPane: function(obj){
            var thisB = this;
             this.windowSizeSpinner = new NumberSpinner({
                value: thisB.windowSize,
                smallDelta: 10,
                id: 'nuc-dens-window-size'
            });
            dom.create('label', { for: 'nuc-dens-window-size', innerHTML: 'Window size (bp)', style: {display: 'inline-block', width: '100px'} }, obj);
            this.windowSizeSpinner.placeAt(obj);
            dom.create('br',{},obj);

            this.windowDeltaSpinner = new NumberSpinner({
                value: thisB.windowDelta,
                smallDelta: 10,
                id: 'nuc-dens-window-delta'
            });
            dom.create('label', { for: 'nuc-dens-window-delta', innerHTML: 'Window delta (bp)', style: {display: 'inline-block', width: '100px'} }, obj);
            this.windowDeltaSpinner.placeAt(obj);
            dom.create('br',{},obj);
        },

        _createBottomPane: function(obj){
            var thisB = this;
            var tblo = dom.create('table',{id:'nuc-dens-tbl'}, obj);
            var widths = [75, 100, 100];
            for(var i=0;i<3; i++){
                dom.create('col',{width:widths[i]+'px'},tblo);
            }
            var tbl = dom.create('tbody',{},tblo);
            dom.create('tr',{innerHTML:'<td></td><th class="nuc-dens-tbl-header" colspan="2">Color</th><td></td>'}, tbl);
            var row, data1, data2, data3;

            // row of radio buttons to determine color type
            row = dom.create('tr', {}, tbl);
            data1 = dom.create('th',{innerHTML: "Sequence<br>Context", rowspan:2}, row);
            data2 = dom.create('td',{id:'nuc-dens-tbl-clrtype', className: 'nuc-dens-tbl-clr-col', colspan: 2}, row);
            var types = ['random','single','individual'];
            array.forEach(types, function(t){
                var btn = new dijitRadioButton({
                        checked: t === thisB.colorType,
                        value: t,
                        name: 'nuc-dens-tbl-clrtype-btn',
                        /*className: 'nuc-dens-tbl-clrtype-btn'*/
                    });
                btn.onClick = lang.hitch(thisB, '_setColorType', btn);
                dom.create('span',{innerHTML:t}, data2);
                data2.append(btn.domNode);

            });
            // text box for single color
            row = dom.create('tr', {}, tbl);
            //data1 = dom.create('td',{}, row);
            data2 = dom.create('td',{colspan: 2, className:'nuc-dens-tbl-clr-col'}, row);
            var clrtext = new TextBox({
                name: 'nuc-dens-sngl-clr',
                className: 'nuc-dens-tbl-txt',
                id: 'nuc-dens-sngl-clr-txt',
                value: thisB.singleColor
            });
            clrtext.placeAt(data2);
            dom.create('td',{}, row);

            // row of contexts with color
            var cnt = 0;
            thisB.contextInputs = [];
            thisB.colorInputs = [];
            thisB.inputCounts = [];
            array.forEach(thisB.contexts, function(ctx){
                row = dom.create('tr',{id:'nuc-dens-tbl-row-'+cnt, className: 'nuc-dens-tbl-row'}, tbl);

                // context
                data1 = dom.create('td', {className: 'nuc-dens-tbl-ctx-col'},row);
                var txt = new ValidationTextBox({
                    // name: ''+cnt,
                    className: 'nuc-dens-tbl-txt',
                    id: 'nuc-dens-tbl-ctx-txt-'+cnt,
                    value: ctx,
                    regExpGen: function(){return '[ACGTURYSWKMBDHVNacgturyswkmbdhvn]*'},
                    invalidMessage: 'Not valid nucleotide sequence'
                });
                txt.placeAt(data1);

                thisB.contextInputs.push(txt);

                // color input text box
                data2 = dom.create('td',{className: 'nuc-dens-tbl-clr-col'}, row);
                var clrHex = ColorHandler.getConfigColor(ctx, thisB.contexts, thisB.colors, thisB.randomColors);
                var clr = new TextBox({
                    className: 'nuc-dens-tbl-txt',
                    id: 'nuc-dens-tbl-clr-txt-'+cnt,
                    value: clrHex,
                    //style: 'width:75px;',
                });
                clr.placeAt(data2);
                thisB.colorInputs.push(clr);

                // color preview
                var t = dom.create('td',{},row);
                data3 =dom.create('div', {style: 'background-color:'+clrHex+';', className: 'nuc-dens-tbl-clr-view', id: 'nuc-dens-tbl-clr-view-'+cnt}, t);

                thisB.inputCounts.push(cnt);
                cnt++;

            });
        },

        _setColorType: function(input){
            var singleId = 'nuc-dens-sngl-clr-txt';
            var colorTxtId = 'nuc-dens-tbl-clr-txt-';
            //console.log(input.value);
            // handle random

            // handle single

            // handle indiv

        },

        hide: function() {
            this.inherited(arguments);
            window.setTimeout(lang.hitch(this, 'destroyRecursive'), 500);
        }
    });
});
