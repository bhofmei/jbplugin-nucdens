#Nucleotide Density Plugin

This is a JBrowse plugin
 
Allows the user to create multi-lined heatmaps for differente nucleotide contexts. Usr can set the color for each context. Initial intended use is for CG, CHG, and CHH frequency.

##Special Thanks
Special thanks to [Colin] who inspired components of this plugin. Particularly, the GC Content plugin (for the stor class) and Multi BigWig plugin (for multiple density tracks).
Additionaly, special thanks for Erik Lyons for the color dialog.

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
        "NucleotideDensityPlugin" : { "location" : "plugins/NucleotideDensityPlugin" }
}
```