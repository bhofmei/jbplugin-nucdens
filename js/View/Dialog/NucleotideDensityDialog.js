define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/dom',
    'dojo/dom-construct',
    'dojo/dom-style',
    'dojo/dom-attr',
    'dojo/on',
    "dojo/domReady!",
    'dojo/request/script',
    'dijit/focus',
    "dijit/registry",
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
    domConstr,
    domStyle,
    domAttr,
    on,
    domReady,
    dojoScript,
    focus,
    registry,
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
            this.windowSize = args.windowSize || 100;
            this.windowDelta = args.windowDelta || 10;
            this.minScore = args.minScore || 0;
            this.maxScore = args.maxScore || 1;
            this.browser = args.browser;
            this.contexts = args.contexts || [];
            this.colors = args.colors;
            this.colorType = ColorHandler.getColorType(this.colors);
            this.singleColor = this.colorType === 'single' ? this.colors : 'red';
            this.randomColors = ColorHandler.generateNColors(this.contexts.length);
            var thisB = this;
            this.indivColors = array.map(this.contexts, function(ctx){
                if(thisB.colorType === 'individual' && thisB.colors.hasOwnProperty(ctx))
                    return thisB.colors[ctx];
                else
                    return ColorHandler.contextToColorFromList(ctx, thisB.contexts, thisB.randomColors, false);
            });

            this.setCallback     = args.setCallback || function() {};
            this.cancelCallback  = args.cancelCallback || function() {};
        },

        _fillActionBar: function(actionBar) {
            new Button({
                label: 'OK',
                onClick: lang.hitch(this, function() {
                    var windowSize = +this.windowSizeSpinner.getValue();
                    var windowDelta = +this.windowDeltaSpinner.getValue();
                    var minScore = +this.minDensitySpinner.getValue();
                    var maxScore = +this.maxDensitySpinner.getValue();
                    if (isNaN(windowSize) || isNaN(windowDelta) || isNaN(minScore) || isNaN(maxScore)) {
                        return;
                    }
                    var returnCtxA = array.map(this.contextInputs, function(input){
                        return input.value.toUpperCase();
                    });
                    //console.log(returnCtxA);
                    var returnCtx = array.filter(returnCtxA, function(ctx){
                        return ctx !== '';
                    });
                    //console.log(returnCtx);
                    var returnClr = this._getColorCallback();

                    this.setCallback && this.setCallback(windowSize, windowDelta, minScore, maxScore, returnCtx, returnClr);
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

            var topPane = domConstr.create('div',{id:'nuc-dens-parameters'});
            this._createTopPane(topPane);

            var bottomPane = domConstr.create('div',{id:'nuc-dens-contexts'});
            this._createBottomPane(bottomPane);

            this.set('content', [
                topPane,
                bottomPane
            ]);

            this._setColorType(this.colorType);
            this.inherited(arguments);
        },

        _createTopPane: function(obj){
            var thisB = this;
            // create table for these parameters
            var tblo = domConstr.create('table',{id:'nuc-dens-tbl-param', className: 'nuc-dens-dialog-tbl'}, obj);
            var widths = [100, 75, 75, 50];
            // delete, ctx, color preview, color input
            for(var i=0;i<widths.length; i++){
                domConstr.create('col',{width:widths[i]+'px'},tblo);
            }
            var tbl = domConstr.create('tbody',{},tblo);
            var row, data0, data1, data2, data3;

            // row 1 - window size and min score
            row = domConstr.create('tr', {}, tbl);
            // window size
            data0 = domConstr.create('td',{}, row);
            domConstr.create('span',{className: 'nuc-dens-param-lbl', innerHTML: 'Window size (bp)'}, data0);
            data1 = domConstr.create('td',{className: 'nuc-dens-param-wnd-spin-col'}, row);
            this.windowSizeSpinner = new NumberSpinner({
                value: thisB.windowSize,
                smallDelta: 10,
                style: 'width:70px;'
            });
            /*domConstr.create('label', { for: 'nuc-dens-window-size', innerHTML: 'Window size (bp)', className: 'nuc-dens-param-lbl' }, obj);*/
            this.windowSizeSpinner.placeAt(data1);

            // min density
            data2 = domConstr.create('td',{className: 'nuc-dens-param-dens-col'}, row);
            domConstr.create('span',{className: 'nuc-dens-param-lbl', innerHTML: 'Min. density'}, data2);
            data3 = domConstr.create('td',{}, row);
            this.minDensitySpinner = new NumberSpinner({
                value: thisB.minScore,
                smallDelta: 0.1,
                constraints:{min:0,max:1,places:2},
                style: 'width:50px;'
            });
            this.minDensitySpinner.placeAt(data3);

            // row 2 - window delta and max score
            row = domConstr.create('tr', {}, tbl);
            // window size
            data0 = domConstr.create('td',{}, row);
            domConstr.create('span',{className: 'nuc-dens-param-lbl', innerHTML: 'Window delta (bp)'}, data0);
            data1 = domConstr.create('td',{className: 'nuc-dens-param-wnd-spin-col'}, row);
            this.windowDeltaSpinner = new NumberSpinner({
                value: thisB.windowDelta,
                smallDelta: 10,
                style: 'width:70px;'
            });
            this.windowDeltaSpinner.placeAt(data1);

            // min density
            data2 = domConstr.create('td',{className: 'nuc-dens-param-dens-col'}, row);
            domConstr.create('span',{className: 'nuc-dens-param-lbl', innerHTML: 'Max. density'}, data2);
            data3 = domConstr.create('td',{}, row);
            this.maxDensitySpinner = new NumberSpinner({
                value: thisB.maxScore,
                smallDelta: 0.1,
                constraints:{min:0,max:1,places:2},
                style: 'width:50px;'
            });
            this.maxDensitySpinner.placeAt(data3);

        },

        _createBottomPane: function(obj){
            var thisB = this;
            var tblo = domConstr.create('table',{id:'nuc-dens-tbl', className: 'nuc-dens-dialog-tbl'}, obj);
            var widths = [25, 75, 100, 100];
            // delete, ctx, color preview, color input
            for(var i=0;i<widths.length; i++){
                domConstr.create('col',{width:widths[i]+'px'},tblo);
            }
            var tbl = domConstr.create('tbody',{},tblo);
            domConstr.create('tr',{innerHTML:'<td rowspan="3"></td><td></td><th class="nuc-dens-tbl-header" colspan="2">Color</th><td></td>'}, tbl);
            var row, data0, data1, data2, data3, dbtn;

            // row of radio buttons to determine color type
            row = domConstr.create('tr', {}, tbl);
            data1 = domConstr.create('th',{innerHTML: "Sequence<br>Context", rowspan:2}, row);
            data2 = domConstr.create('td',{id:'nuc-dens-tbl-clrtype', className: 'nuc-dens-tbl-clr-view-col', colspan: 2}, row);
            var types = ['random','single','individual'];
            array.forEach(types, function(t){
                var btn = new dijitRadioButton({
                        checked: t === thisB.colorType,
                        value: t,
                        name: 'nuc-dens-tbl-clrtype-btn',
                        id: 'nuc-dens-tbl-clrtype-btn-'+t
                    });
                btn.onClick = lang.hitch(thisB, '_setColorType', btn);
                domConstr.create('span',{innerHTML:t}, data2);
                data2.append(btn.domNode);
            });

            // text box for single color
            row = domConstr.create('tr', {}, tbl);
            //data1 = domConstr.create('td',{}, row);
            data2 = domConstr.create('td',{colspan: 3, className:'nuc-dens-tbl-clr-view-col'}, row);
            var clrtext = new TextBox({
                name: 'nuc-dens-sngl-clr',
                className: 'nuc-dens-tbl-txt',
                id: 'nuc-dens-sngl-clr-txt',
                intermediateChanges: true,
                value: thisB.singleColor
            });
            clrtext.placeAt(data2);
            clrtext.onChange = lang.hitch(thisB, '_updateSingleColor', clrtext);
            domConstr.create('td',{}, row);

            // row of contexts with color
            var cnt = 0;
            thisB.contextInputs = [];
            thisB.colorInputs = [];
            thisB.colorPreviews = [];
            thisB.deleteButtons = [];
            array.forEach(thisB.contexts, function(ctx){
                var row = domConstr.create('tr',{className: 'nuc-dens-tbl-row'}, tbl);
                thisB._createRow(row, ctx, cnt);
                cnt++;
            });
            // add btn row
            var row = domConstr.create('tr',{className: 'nuc-dens-tbl-row'}, tbl);
            thisB._createAddBtnRow(row);
        },

        _createRow: function(row, ctx, cnt){
            // create sequence context row that includes delete btn, text input for context,
            // color preview, and text box for color
            var data0, data1, data2, data3, dbtn;
            var thisB = this;

            data0 = domConstr.create('td',{class:'nuc-dens-tbl-del-col'}, row);
            // delete button
            dbtn = new Button({
                '_index': cnt,
                iconClass: 'nucDensRemoveIcon',
                className: 'nuc-dens-tbl-btn',
                title: 'Delete context'
            });
            dbtn.placeAt(data0);
            thisB.deleteButtons.push(dbtn);
            dbtn.onClick = lang.hitch(thisB, '_removeRow', dbtn);

            // context
            data1 = domConstr.create('td', {className: 'nuc-dens-tbl-ctx-col'},row);
            var txt = new ValidationTextBox({
                className: 'nuc-dens-tbl-txt',
                value: ctx,
                intermediateChanges: true,
                '_index': cnt,
                placeholder: 'sequence',
                regExpGen: function(){return '[ACGTURYSWKMBDHVNacgturyswkmbdhvn]*'},
                invalidMessage: 'Not valid nucleotide sequence'
            });
            txt.placeAt(data1);
            txt.onChange = lang.hitch(thisB, '_updateContext', txt);
            thisB.contextInputs.push(txt);

            // color preview
            var clrHex = thisB._getColor((ctx===''? cnt: ctx));
            data2 = domConstr.create('td',{className: 'nuc-dens-tbl-clr-view-col'}, row);
            var clrPre = domConstr.create('div', {
                style: 'background-color:'+clrHex+';',
                className: 'nuc-dens-tbl-clr-view',
                '_index': cnt
            }, data2);
            thisB.colorPreviews.push(clrPre);

            // color input text box
            data3 = domConstr.create('td',{className: 'nuc-dens-tbl-clr-col'},row);
            var clr = new TextBox({
                className: 'nuc-dens-tbl-txt',
                value: clrHex,
                intermediateChanges: true,
                '_index': cnt
            });
            clr.placeAt(data3);
            clr.onChange = lang.hitch(thisB, '_updateIndividualColor', clr);
            thisB.colorInputs.push(clr);
        },

        _createAddBtnRow: function(row){
            // add row to bottom of table which has button to add more contexts
            var thisB = this;
            var data0, dbtn;
            data0 = domConstr.create('td',{className: 'nuc-dens-tbl-del-col'}, row);
            dbtn = new Button({
                iconClass: 'nucDensAddIcon',
                className: 'nuc-dens-tbl-btn',
                title: 'Add additional context'
            });
            dbtn.placeAt(data0);
            dbtn.onClick = lang.hitch(thisB, '_addRow', dbtn);
        },

        _getColor: function(ctx){
            // if ctx is int, that means context is empty, use number
            if(this.colorType === 'single' )
                return this.singleColor;
            else if(typeof ctx === 'string')
                return ColorHandler.contextToColorFromList(ctx, this.contexts, (this.colorType==='random' ? this.randomColors : this.indivColors), false);
            else
                return ColorHandler.intToColorFromList(ctx, (this.colorType==='random' ? this.randomColors : this.indivColors), false);
        },

        _setColorType: function(input){
            // input is either a widget with value attribute or string with input type (from initialization)
            var singleId = 'nuc-dens-sngl-clr-txt';
            var thisB = this;

            var val, init;
            if(typeof input === 'string'){
                val = input;
                init = true;
            } else{
                val = input.value;
                init = false;
            }
            // hide single if random or indiv
            // hide color inputs if single
            if( ((val === 'single' ? 1 : 0) ^ (thisB.colorType === 'single' ? 1 : 0)) || init ){
                domStyle.set(registry.byId(singleId).domNode, 'visibility', (val === 'single' ? 'visible' : 'hidden'));
                array.forEach(thisB.colorInputs, function(clrInputs){
                    domStyle.set(clrInputs.domNode, 'visibility', (val === 'single' ? 'hidden' : 'visible'));
                });
            }

            if(val === 'random' && !init){
                this._updateRandomColor();
                this.indivColors = lang.clone(thisB.randomColors);
            }
            else if (val === 'single' && !init && thisB.singleColor)
                this._updateSingleColor({value: thisB.singleColor});

            else if(val === 'individual' && !init){
                array.forEach(this.colorInputs, function(clrInputs){
                    thisB._updateIndividualColor(clrInputs);
                });
            }
            this.colorType = lang.clone(val);

        },

        _updateRandomColor: function(){
            //console.log('update random colors', this.randomColors);
            var thisB = this;
            var cnt = 0;
            var clr, clrIn;
            // update color previews and inputs
            array.forEach(this.colorPreviews, function(clrPre){
                clr = thisB.randomColors[cnt];
                domStyle.set(clrPre, 'backgroundColor', clr);
                // to avoid calling the onChange method of colorInput
                // set _onChangeActive to false, make change, reset to true
                thisB.colorInputs[cnt].set('_onChangeActive', false);
                thisB.colorInputs[cnt].set("value",clr);
                thisB.colorInputs[cnt].set('_onChangeActive', true);
                cnt++;

            });
        },

        _updateSingleColor: function(input){
            if(input.hasOwnProperty('value')){
                array.forEach(this.colorPreviews, function(clrPre){
                    domStyle.set(clrPre, 'backgroundColor', input.value);
                });
            }
            this.singleColor = input.value;
        },

        _updateIndividualColor: function(input){
            var thisB = this;
            var idx = input._index;
            var clrPre = this.colorPreviews[idx];
            if((input.hasOwnProperty('value'))){
                domStyle.set(clrPre, 'backgroundColor', input.value);
                this.indivColors[idx] = input.value;
            }

            // if colorType not indiv before, set indiv now
            if(thisB.colorType !== 'individual'){
                var prevClrType = lang.clone(this.colorType);
                registry.byId('nuc-dens-tbl-clrtype-btn-'+prevClrType).set("checked", false);
                registry.byId('nuc-dens-tbl-clrtype-btn-individual').set("checked", true);
                thisB.colorType = 'individual';
            }
        },

        _updateContext: function( input ){
            var idx = input._index;
            this.contexts[idx] = input.value;
        },

        _removeRow: function( deleteBtn ){
            var idx = deleteBtn._index;
            // update indexes of all rows after idx
            for(var i=idx+1; i<this.contexts.length; i++){
                this.deleteButtons[i]['_index'] --;
                this.contextInputs[i]['_index'] --;
                this.colorPreviews[i]['_index']--;
                this.colorInputs[i]['_index']--;
            }
            // pop elements of row and destory
            var rmWid = [];
            var rm = this.deleteButtons.splice(idx, 1);
            rmWid.concat(rm);
            rm = this.contextInputs.splice(idx, 1);
            rmWid.concat(rm);
            rm = this.colorInputs.splice(idx, 1);
            rmWid.concat(rm);
            this.colorPreviews.splice(idx, 1);
            array.forEach(rmWid, function(wid){
                wid.destroy();
            });
            // remove from contexts, invidual colors, and update random colors
            this.contexts.splice(idx, 1);
            this.indivColors.splice(idx, 1);
            this.randomColors = ColorHandler.generateNColors(this.contexts.length);
            // remove row
            var tbl = dom.byId('nuc-dens-tbl');
            tbl.deleteRow(idx+3);
            // update random color preview if necessary
            if(this.colorType === 'random')
                this._updateRandomColor();
        },

        _addRow: function( ){
            var newIndex = this.contexts.length;
            var insertPoint = newIndex + 3;
            // update context list, random colors list, individual color list
            this.contexts.push('');
            this.randomColors = ColorHandler.generateNColors(newIndex+1);
            this.indivColors.push(this.randomColors[newIndex]);
            // get tbl, create row
            var tbl = dom.byId('nuc-dens-tbl');
            var row = tbl.insertRow(insertPoint);
            this._createRow(row, '', newIndex);

            if(this.colorType === 'random')
                this._updateRandomColor();
            if(this.colorType === 'single' )
                domStyle.set(this.colorInputs[newIndex].domNode, 'visibility', 'hidden');
        },

        _getColorCallback: function(){
            var thisB = this;
            if(this.colorType === 'random')
                return 'random';
            else if(this.colorType === 'single')
                return this.singleColor;
            else {
                var outObj = {};
                var cnt=0;
                // loop through context inputs
                array.forEach(thisB.contextInputs, function(ctx){
                   if(ctx.value !== ''){
                       outObj[ctx.value] = thisB.indivColors[cnt];
                   }
                    cnt++;
                });
                return outObj;
            }
        },

        hide: function() {
            this.inherited(arguments);
            window.setTimeout(lang.hitch(this, 'destroyRecursive'), 500);
        }
    });
});
