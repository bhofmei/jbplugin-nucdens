define([
    'dojo/_base/declare',
    'dojo/dom-construct',
    'dojo/on',
    'dijit/focus',
    'dijit/form/NumberSpinner',
    'dijit/form/Button',
    'JBrowse/View/Dialog/WithActionBar'
],
function(
    declare,
    dom,
    on,
    focus,
    NumberSpinner,
    Button,
    ActionBarDialog
) {
    return declare(ActionBarDialog, {
        title: 'Set Nucleotide Density Track Options',

        constructor: function(args) {
            this.windowSize      = args.windowSize || 100;
            this.windowDelta     = args.windowDelta || 10;
            this.browser         = args.browser;
            this.setCallback     = args.setCallback || function() {};
            this.cancelCallback  = args.cancelCallback || function() {};
        },

        _fillActionBar: function(actionBar) {
            new Button({
                label: 'OK',
                onClick: dojo.hitch(this, function() {
                    var windowSize = +this.windowSizeSpinner.getValue();
                    var windowDelta = +this.windowDeltaSpinner.getValue();
                    if (isNaN(windowSize) || isNaN(windowDelta)) {
                        return;
                    }
                    this.setCallback && this.setCallback(windowSize, windowDelta);
                    this.hide();
                })
            }).placeAt(actionBar);

            new Button({
                label: 'Cancel',
                onClick: dojo.hitch(this, function() {
                    this.cancelCallback && this.cancelCallback();
                    this.hide();
                })
            }).placeAt(actionBar);
        },

        show: function(/* callback */) {
            dojo.addClass(this.domNode, 'nuc-dens-dialog');


            var topPane = dom.create('div',{id:'nuc-dens-parameters'});
            this._createTopPane(topPane);

            this.set('content', [
                topPane
            ]);

            this.inherited(arguments);
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

        hide: function() {
            this.inherited(arguments);
            window.setTimeout(dojo.hitch(this, 'destroyRecursive'), 500);
        }
    });
});
