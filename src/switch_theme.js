

let sketch = require('sketch')
let Artboard = sketch.Artboard
var Text = require('sketch').Text
var ShapePath = require('sketch/dom').ShapePath
var Group = require('sketch/dom').Group


let document = sketch.getSelectedDocument()
let page = document.selectedPage


var selection = context.selection;
var fromTheme, toTheme;
var currentArtboard
var newArtboardName
var instance
var group_name

var move = 0;
var master_iterator = -1;

var CreateArtboard = true;
let TextLibrary
let ColourLibrary

var myArtboard



function removeArtboardNames() {

    //removes current artboard naming

    if (newArtboardName.includes("Dark")) { newArtboardName = newArtboardName.replace('Dark', '') }
    else if (newArtboardName.includes("Light")) { newArtboardName = newArtboardName.replace('Light', ''); }

    if (newArtboardName.includes("dark")) { newArtboardName = newArtboardName.replace('dark', '') }
    else if (newArtboardName.includes("light")) { newArtboardName = newArtboardName.replace('light', ''); }

    if (newArtboardName.includes("dakr")) { newArtboardName = newArtboardName.replace('dakr', '') }
    else if (newArtboardName.includes("lihgt")) { newArtboardName = newArtboardName.replace('lihgt', ''); }
}

function createArtboatd() {
    if (CreateArtboard) {
        myArtboard = new Artboard({
            parent: page,
            name: newArtboardName + toTheme,
            frame: {
                x: currentArtboard.frame.x + currentArtboard.frame.width + move,
                y: currentArtboard.frame.y,
                width: currentArtboard.frame.width,
                height: currentArtboard.frame.height
            }
        });

        myArtboard.background.enabled = true;

        if (toTheme == "Dark") {
            myArtboard.background.color = '#000000ff';
        }
        CreateArtboard = false
    }

}


var libraries = require('sketch/dom').getLibraries()
for (var l = 0; l < Object.keys(libraries).length; l++) {
    if (libraries[l].name.includes('Type') || libraries[l].name.includes('Text') || libraries[l].name.includes('Fonts') || libraries[l].name.includes('Tyepface')) {
        TextLibrary = sketch.getLibraries()[l]
    }

    if (libraries[l].name.includes('Color') || libraries[l].name.includes('Colour') || libraries[l].name.includes('Colours') || libraries[l].name.includes('Tyepface')) {
        ColourLibrary = sketch.getLibraries()[l]
    }
}

var textstyleReferences = TextLibrary.getImportableTextStyleReferencesForDocument(document)
var layerstyleReferences = ColourLibrary.getImportableLayerStyleReferencesForDocument(document)



//for each layer selected in the document, checking if there are artboards with sublayers



var UI = require('sketch/ui')


UI.getInputFromUser(
    "Switch to",
    {
        type: UI.INPUT_TYPE.selection,
        possibleValues: ['Light', 'Dark'],
    },
    (err, value) => {
        if (err) {
            // most likely the user canceled the input
            return
        }

        if (value == 'Light') {
            fromTheme = 'Dark'
            toTheme = 'Light'

        }
        if (value == 'Dark') {
            fromTheme = 'Light'
            toTheme = 'Dark'

        }
    }
)



selection.forEach(function (layer) {
    if (layer.layers && layer.class() == "MSArtboardGroup") {
        master_iterator++; move += 150;
        var children = layer.children();
        currentArtboard = sketch.getSelectedDocument().selectedLayers.layers[master_iterator]

        //artboard name handling

        newArtboardName = sketch.getSelectedDocument().selectedLayers.layers[master_iterator].name;
        removeArtboardNames();

        CreateArtboard = true;
        createArtboatd();
    

        for (var f = 0; f < children.count(); f++) {
            if (children[f].class() != "MSArtboardGroup") {
                var extracted_children_id = children[f].toString().split('(').pop().split(')')[0];
                var current_layer_in_artboard = document.getLayerWithID(extracted_children_id)

                if (current_layer_in_artboard.type == "Group")
                {

                    var group = new Group({
                        name: current_layer_in_artboard.name,
                        frame: current_layer_in_artboard.frame,
                        transform: current_layer_in_artboard.transform,
                        sharedStyle: current_layer_in_artboard.sharedStyle,
                        sharedStyleId: current_layer_in_artboard.sharedStyleId,
                        style: current_layer_in_artboard.style,
                        smartLayout: current_layer_in_artboard.smartLayout


                    })
                    group.transform.rotation = current_layer_in_artboard.transform.rotation
                    group.parent = myArtboard
                }

                if (current_layer_in_artboard.type == "SymbolInstance") {

                    //I use the extracted ID and found layer to match the correct library & master references

                    var library_linked = current_layer_in_artboard.master.getLibrary()
                    var symbolReferences = library_linked.getImportableSymbolReferencesForDocument(document)


                    symbolReferences.forEach((ImportableObject) => {
                        if (ImportableObject.id == current_layer_in_artboard.symbolId) {

                            var imported_symbol_name = ImportableObject.name.replace(fromTheme, toTheme)
                            var to_Import = symbolReferences.filter(element => element.name == imported_symbol_name)

                            var symbolMaster = to_Import[0].import();
                            instance = symbolMaster.createNewInstance();

                            //sizes checked to match symbol to existing instance

                            var new_frame = current_layer_in_artboard.frame
                            var new_x = new_frame.x
                            var new_y = new_frame.y
                            var new_width = new_frame.width
                            var new_height = new_frame.height
                            var new_rotation = current_layer_in_artboard.transform.rotation
                            var new_transform = current_layer_in_artboard.transform
                            var new_instance_name = current_layer_in_artboard.name

                            instance.name = new_instance_name
                            instance.transform = new_transform
                            instance.transform.rotation = new_rotation;
                            instance.frame = { x: new_x, y: new_y, width: new_width, height: new_height };
                            instance.parent = myArtboard;


                            //going through overrides for symbols and texts separately

                            for (var w = 0; w < (Object.keys(instance.overrides).length); w++) {

                                //only get the override if the value is differnet from the default one, otherwise let the symbol handle it

                                if (current_layer_in_artboard.overrides[w].property == 'stringValue' && !(current_layer_in_artboard.overrides[w].isDefault)) {
                                    instance.overrides[w].value = current_layer_in_artboard.overrides[w].value
                                }

                                if (current_layer_in_artboard.overrides[w].property == 'layerStyle' && !(current_layer_in_artboard.overrides[w].isDefault)) {
                                    layerstyleReferences.forEach((element) => {

                                        if (element.id == current_layer_in_artboard.overrides[w].value) {
                                            var layer_style_switch_name = element.name.replace(fromTheme, toTheme)
                                            layerstyleReferences.forEach((sub_element) => {

                                                if (sub_element.name == layer_style_switch_name) {

                                                    var sharedStyle = sub_element.import()
                                                    instance.overrides[w].value = sharedStyle.id
                                                }

                                            })
                                        }
                                    })
                                }

                                if (current_layer_in_artboard.overrides[w].property == 'textStyle' && !(current_layer_in_artboard.overrides[w].isDefault)) {

                                    textstyleReferences.forEach((element) => {

                                        if (element.id == current_layer_in_artboard.overrides[w].value) {
                                            var text_stlye_override_switch_name = element.name.replace(fromTheme, toTheme)
                                            //look for the switched text style by its name

                                            textstyleReferences.forEach((sub_element) => {
                                                if (sub_element.name == text_stlye_override_switch_name) {
                                                    var textStyle_to_import = sub_element.import()
                                                    instance.overrides[w].value = textStyle_to_import.id
                                                }
                                            });

                                        }
                                    })
                                }

                                if (current_layer_in_artboard.overrides[w].property == 'symbolID' && !(current_layer_in_artboard.overrides[w].isDefault)) {
                                    var override_symbol_master = document.getSymbolMasterWithID(current_layer_in_artboard.overrides[w].value)
                                    var override_library_linked = override_symbol_master.getLibrary()

                                    var override_symbolReferences = override_library_linked.getImportableSymbolReferencesForDocument(document)

                                    override_symbolReferences.forEach((element) => {

                                        if (element.id == current_layer_in_artboard.overrides[w].value) {


                                            var symbol_override_switch_name = element.name.replace(fromTheme, toTheme)
                                            //look for the switched symbol by its name

                                            override_symbolReferences.forEach((sub_element) => {
                                                if (sub_element.name == symbol_override_switch_name) {

                                                    //importing the same symbol into the artboard , deleting it afterward to have it as a reference

                                                    var master_to_delte = sub_element.import();
                                                    var instance_to_delete = master_to_delte.createNewInstance();

                                                    instance_to_delete.parent = myArtboard
                                                    instance.overrides[w].value = instance_to_delete.symbolId
                                                    instance_to_delete.remove()

                                                }

                                            });
                                        }
                                    })
                                }

                            }
                        }

                    })
                }

                if (current_layer_in_artboard.type == 'Text') {

                    var text = new Text({
                        text: current_layer_in_artboard.text,
                        frame: current_layer_in_artboard.frame,
                        style: current_layer_in_artboard.style,
                        name: current_layer_in_artboard.name,
                        sharedStyleId: current_layer_in_artboard.sharedStyleId,
                        sharedStyle: current_layer_in_artboard.sharedStyle
                    })
                    text.behaviour = current_layer_in_artboard.behaviour;
                    text.parent = myArtboard

                    if (text.sharedStyle.name != null) {
                        if (text.sharedStyle.name.includes(fromTheme)) {
                            var switch_text_style = text.sharedStyle.name.replace(fromTheme, toTheme)

                            textstyleReferences.forEach((element) => {
                                if (element.name == switch_text_style) {
                                    var new_text_style = element.import();
                                    text.sharedStyle = new_text_style;
                                    text.style.syncWithSharedStyle(new_text_style)
                                }
                            })

                        }

                    }
                    else
                        log("Use Color palettes for Texts")

                }

                if (current_layer_in_artboard.type == 'ShapePath') {

                    const shapePath = new ShapePath({
                        shapeType: current_layer_in_artboard.shapeType,
                        sharedStyleId: current_layer_in_artboard.sharedStyleId,
                        frame: current_layer_in_artboard.frame,
                        points: current_layer_in_artboard.points,
                        transform: current_layer_in_artboard.transform,
                        name: current_layer_in_artboard.name,
                        style: current_layer_in_artboard.style,
                        parent: myArtboard

                    })

                    shapePath.transform.rotation = current_layer_in_artboard.transform.rotation
 
                    if (shapePath.sharedStyleId != null) {

                        layerstyleReferences.forEach((element) => {
                            if (element.id == shapePath.sharedStyleId) {

                                var switch_layer_style = element.name
                                switch_layer_style = switch_layer_style.replace(fromTheme, toTheme)

                                layerstyleReferences.forEach((sub_element) => {
                                    if (sub_element.name == switch_layer_style) {
                                        var new_new_layer_style = sub_element.import();
                                        shapePath.sharedStyleId = new_new_layer_style.id;
                                        shapePath.style.syncWithSharedStyle(new_new_layer_style)
                                    }
                                })
                            }
                        })
                    }

                    else
                        log("Use Color palettes for Shapes")
                }
            }




        }
    }

    else
    {
        UI.message('Please select one or more artboards')
    }
});




