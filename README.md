#Nucleotide Density Plugin

This is a JBrowse plugin
 
Allows the user to create multi-lined heatmaps for different nucleotide contexts. User can set the color for each context, a single color for all contexts, or "random" colors will be chosen (see [below]).
##Special Thanks
Special thanks to [Colin Diesh](http://cmdcolin.github.io/) who inspired components of this plugin. Particularly, the [GC Content plugin](https://github.com/elsiklab/gccontent) (for the storage class) and [Multi BigWig plugin](https://github.com/elsiklab/multibigwig) (for multiple density tracks).

##Install

For JBrowse 1.11.6+ in the _JBrowse/plugins_ folder, type:  
`git clone https://github.com/bhofmei/jbplugin-nucdens.git NucleotideDensityPlugin`

**or**

downloaded the latest release version at [releases](https://github.com/bhofmei/jbplugin-nucdens/releases).  
Unzip the downloaded folder, place in _JBrowse/plugins_, and rename the folder _NucleotideDensityPlugin_

##Activate

Add this to _jbrowse.conf_ under `[GENERAL]`:
```
    [plugins.NucleotideDensityPlugin]
    location = plugins/NucleotideDensityPlugin
```

If that doesn't work, add this to _jbrowse_conf.json_:
```
    "plugins" : {
        "NucleotideDensityPlugin" : { 
            "location" : "plugins/NucleotideDensityPlugin"
        }
    }
```

##Using Nucleotide Density Traacks
###Example
    {  
        "key" : "Nucleotide Density",
        "label" : "nuc_dens",
        "storeClass" : "JBrowse/Store/SeqFeature/SequenceChunks",
        "urlTemplate" : "seq/{refseq_dirpath}/{refseq}-",
        "context" : ["CG", "CHG", "CHH", "NNN"]
    }
    
Sequence contexts must be specified in an array.   
[Degenerate/IUPAC](http://www.bioinformatics.org/sms/iupac.html) nucleotides are supported. Gaps are not. Nucleotides can be lowercase or uppercase.
    
###Color Parameters
For all contexts, density is indicated by the intensity of color. Color is computed as a blend between the background color and specified color weighted by the scaled density.  
Density is scaled to the track configuration `min_score` and `max_score`.
 
Color can be specified in four ways.
 
1. Random [default]    
Equidistant colors are assigned to each context based on the number of contexts specified. 
```
    "colors": "random"
```

2. Single Color    
A single color is used for all contexts. Color can be specified as a string or hexidecimal value
```
    "colors" : "hotpink"
```

3. Array    
Colors in the array for assigned to each context based on order. If there are more contexts than colors specified, colors are reused in order.
```
    "colors" : ["red", "orange", "yellow", "greenyellow"]
```

4. Object    
Colors can be specified using a javascript object assigning a color to each context. If a context is not assigned a color, the cooresponding "random" color is used.
```
    "colors" : { "CG" : "#A36085", "CHG": "#0072B2", "CHH" : "#CF8F00", "CH" : "#88C043" }
```

![Example for color parameters]('img/example_colors.png')
  
###Addititional Parameters
Additional parameters that can be specified for the track configuration.
* `"min_score" : 0`  , minimum density when computing color
* `"max_score" : 1`  , maximum density when computing color
* `"windowSize" : 100`  , window size for sliding window when computing density
* `"windowDelta" : 10`  , window step size for sliding window
* `"showLabels" : true`  , show context sublabels on track
* `"bothStrands" : false`  , use sequence on forward strand only or both strands to compute density
* `"style" : { "height" : 70 }`  , track height


##Future Plans
- Show pixel score along track for each sequence context
- Ability to add track locally by adding option to menu bar, "File"