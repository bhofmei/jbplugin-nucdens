require([
    'dojo/_base/declare',
    'dojo/_base/array',
    'JBrowse/Browser',
    'NucleotideDensityPlugin/View/ColorHandler',
    'NucleotideDensityPlugin/View/Track/NucleotideDensity',
    'NucleotideDensityPlugin/Store/SeqFeature/NucDensity',
    'NucleotideDensityPlugin/Store/Util'
    ], function(
        declare,
        array,
        Browser,
        ColorHandler,
        nucDensTrack,
        nucDensStore,
        nucDensUtil
    ) {

    describe( 'Initial test', function() {
        var test = true;
        it('jasmine is working', function() {
            expect(test).toBe(true);
        });
    }); // end initial test

    describe( 'Test degenerate nucleotide utilities', function(){
        it('non-degenerate test, forward only', function(){
            var cgAr = nucDensUtil.getPossibilities('CG',false);
            var gttAr = nucDensUtil.getPossibilities('GTT',false);
            expect(cgAr.length).toBe(1);
            expect(gttAr.length).toBe(1);
        });

        it('non-degenerate test, both strands', function(){
            var cgAr = nucDensUtil.getPossibilities('CG',true);
            var gttAr = nucDensUtil.getPossibilities('GTT',true);
            expect(cgAr.length).toBe(2);
            expect(gttAr.length).toBe(2);
        });

        it('degenerate test, forward only', function(){
            var cnAr = nucDensUtil.getPossibilities('CN',false);
            var chhAr = nucDensUtil.getPossibilities('CHH',false);
            var gbrAr = nucDensUtil.getPossibilities('GBR',false);
            var nnAr = nucDensUtil.getPossibilities('NN',false);
             var nnnAr = nucDensUtil.getPossibilities('NNN',false);
            expect(cnAr.length).toBe(4);
            expect(chhAr.length).toBe(9);
            expect(gbrAr.length).toBe(6);
            expect(nnAr.length).toBe(16);
            expect(nnnAr.length).toBe(64);
        });

        it('degenerate test, both strands', function(){
            var cnAr = nucDensUtil.getPossibilities('CN',true);
            var chhAr = nucDensUtil.getPossibilities('CHH',true);
            var gbrAr = nucDensUtil.getPossibilities('GBR',true);
            var nnAr = nucDensUtil.getPossibilities('NN',true);
            expect(cnAr.length).toBe(8);
            expect(chhAr.length).toBe(18);
            expect(gbrAr.length).toBe(12);
            expect(nnAr.length).toBe(32);
        });
    }); // end test util

    describe('test color handler utility', function(){
        it('generate n colors', function(){
            var clr5 = ColorHandler.generateNColors(5);
            expect(clr5.length).toBe(5);
            expect(clr5).toEqual(["#ff00a2", "#ea8500", "#00bb20", "#00c2ff", "#0097ff"]);
        });

        it('generate random colors', function(){
            var clr2 = ColorHandler.generateRandomColors(["CG","CH"]);
            expect(clr2).toEqual({CG:"#ff00a2",CH:'#00c29b'});
        });

        it('get font color', function(){
            var cr1 = ColorHandler.getFontColor('#284996');
            expect(cr1).toBe('#F0F0F0');
            var cr2 = ColorHandler.getFontColor('#f1b982');
            expect(cr2).toBe('#010101');
        });

        it('get color from list', function(){
            var colorList = ['blue','red','pink','purple']

            var clr2 = ColorHandler.intToColorFromList(1, colorList, true);
            expect(clr2).toBe('red');

            var clr2 = ColorHandler.contextToColorFromList('CN', ['TA','WCN','CN','NY'],['blue','red','pink','purple'], true);
            expect(clr2).toBe('pink');
        });

        it('get color from list not defined', function(){
            var un = ColorHandler.contextToColorFromList('NN',['NH','GT','AC'],['blue','red','pink'], false);
            expect(un).not.toBeDefined()
        });

        it('get color from repeatable list', function(){
            var colorList = ['blue','red','pink'];
            var ctxList = ['AA','AC','AT','CC','CG','CT','GA','GC','TT'];

            var clr1 = ColorHandler.contextToColorFromList('CC',ctxList, colorList, true);
            expect(clr1).toBe('blue');
            var clr2 = ColorHandler.contextToColorFromList('TT',ctxList, colorList, true);
            expect(clr2).toBe('pink');
        });
    }); // end test color handler

});

