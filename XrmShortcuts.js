/// <reference path="XrmPage-vsdoc.js" />

var BrcXrmConstants = {
    ///<summary>A set of XRM constants - i.e. requirement levels, mandatory level etc.</summary>
    requirementLevels: {
        required: "required",
        none: "none",
        recommended: "recommended"
    },
    submitModes: {
        always: "always",
        never: "never"
    },
    attributeTypes : {
        datetime: "datetime",
        boolean: "boolean",
        decimal: "decimal",
        double: "double",
        integer: "integer",
        lookup: "lookup",
        memo: "memo",
        money: "money",
        optionset: "optionset",
        string : "string"
    },
    formTypes: {
        Create: 1,
        Update: 2,
        ReadOnly: 3,
        Disabled: 4,
        QuickCreate: 5, //deprecated
        BulkEdit: 6,
        ReadOptimized: 11
    },
    saveModes: {
        Save: 1,
        SaveAndClose: 2
    }

}
$c = BrcXrmConstants;

function BrcXrmUtilities() {
    ///<summary>Utility library</summary>
    var RequiredFields = [];
    var that = this; // does it matter where this goes?
    function getRequiredAttributes() {
        for (var x = 0; x < RequiredFields.length; x++) {
            Xrm.Page.getAttribute(RequiredFields[x]).removeOnChange(this.notifyRequiredAttributes);
            Xrm.Page.ui.clearFormNotification(RequiredFields[x]);
        }
        RequiredFields = [];
        Xrm.Page.ui.controls.forEach(function (control, index) {
            var controlType = control.getControlType();
            if (controlType != "iframe" && controlType != "webresource" && controlType != "subgrid") {
                if (control.getVisible()) {
                    var attribute = control.getAttribute();
                    if (attribute != null) {
                        var req = attribute.getRequiredLevel();
                        if (req == "required") {
                            // control.setNotification("Fill me in");
                            var name = attribute.getName();
                            if (RequiredFields.indexOf(name) < 0) {
                                RequiredFields.push(name);
                                //attribute.addOnChange(this.notifyRequiredAttributes);
                                attribute.addOnChange(that.notifyRequiredAttributes);
                                // console.log(name);
                                // Xrm.Page.getControl(name).setNotification("Fill me in");
                            }
                        }
                    }
                }
            }
        });
    };
    this.notifyRequiredAttributes = function () {
        getRequiredAttributes();
        var notification = "";
        for (var i = 0; i < RequiredFields.length; i++) {

            var field = RequiredFields[i];
            var attribute = Xrm.Page.getAttribute(field);
            var val;
            if (attribute.getAttributeType() != "optionset")
                val = Xrm.Page.getAttribute(field).getValue(); // this sometimes fails...
            else val = Xrm.Page.getAttribute(field).getText();

            // brc_enquirytype,brc_serviceid,new_sectorid,statecode,new_requeststatus,new_requeststatusreason,new_actiontaken
            if (!val || val == "") {
                var label = Xrm.Page.getControl(field).getLabel();
                notification += label + " is required; ";
                Xrm.Page.ui.setFormNotification(label + " is required ", 'INFO', field);
            }
            else
                Xrm.Page.ui.clearFormNotification(field);
        }
    };
    this.writeCurrentIdToConsole = function () {
        this.writeToConsole(Xrm.Page.data.entity.getId());
    };
    this.writeToConsole = function (message, level) {
        ///<summary>if a console is available in the browser, write to it. Can specify the alert level</summary>
        ///<param name="message">String</param>
        ///<param name="level">Type as string: Error, Warning, Info, Default or none</param>
        if (typeof console != 'undefined') {
            if (level) {
                switch (level.toLowerCase()) {
                    case "error":
                        console.error(message);
                        break;
                    case "warning":
                        console.warn(message);
                        break;
                    case "info":
                        console.info(message);
                        break;
                    default:
                        console.log(message);
                        break;
                }
            }
            else
                console.log(message);
        }
    };
    this.addOnSave = function (onSaveFunction) {
        Xrm.Page.data.entity.addOnSave(onSaveFunction);
    };
    this.confirmDialog = function (message, yesCloseCallback, noCloseCallback) {
        Xrm.Utility.confirmDialog(message, yesCloseCallback, noCloseCallback);
    };
    this.hideSubGridAddButton = function (gridName) {
        ///<summary>Hides the + button on sub grids. Uses unsupported getElementById</summary>
        // ServiceAssessments
        document.getElementById(gridName + "_addImageButton").style.visibility = 'hidden';
    };
    this.fixIE8 = function () {
        ///<summary>Add ECMA262-5 method binding if not supported natively</summary>
        /* ie8 fixes */
        if (!('bind' in Function.prototype)) {
            Function.prototype.bind = function (owner) {
                var that = this;
                if (arguments.length <= 1) {
                    return function () {
                        return that.apply(owner, arguments);
                    };
                } else {
                    var args = Array.prototype.slice.call(arguments, 1);
                    return function () {
                        return that.apply(owner, arguments.length === 0 ? args : args.concat(Array.prototype.slice.call(arguments)));
                    };
                }
            };
        }

        // Add ECMA262-5 string trim if not supported natively
        //
        if (!('trim' in String.prototype)) {
            String.prototype.trim = function () {
                return this.replace(/^\s+/, '').replace(/\s+$/, '');
            };
        }

        // Add ECMA262-5 Array methods if not supported natively
        //
        if (!('indexOf' in Array.prototype)) {
            Array.prototype.indexOf = function (find, i /*opt*/) {
                if (i === undefined) i = 0;
                if (i < 0) i += this.length;
                if (i < 0) i = 0;
                for (var n = this.length; i < n; i++)
                    if (i in this && this[i] === find)
                        return i;
                return -1;
            };
        }
        if (!('lastIndexOf' in Array.prototype)) {
            Array.prototype.lastIndexOf = function (find, i /*opt*/) {
                if (i === undefined) i = this.length - 1;
                if (i < 0) i += this.length;
                if (i > this.length - 1) i = this.length - 1;
                for (i++; i-- > 0;) /* i++ because from-argument is sadly inclusive */
                    if (i in this && this[i] === find)
                        return i;
                return -1;
            };
        }
        if (!('forEach' in Array.prototype)) {
            Array.prototype.forEach = function (action, that /*opt*/) {
                for (var i = 0, n = this.length; i < n; i++)
                    if (i in this)
                        action.call(that, this[i], i, this);
            };
        }
        if (!('map' in Array.prototype)) {
            Array.prototype.map = function (mapper, that /*opt*/) {
                var other = new Array(this.length);
                for (var i = 0, n = this.length; i < n; i++)
                    if (i in this)
                        other[i] = mapper.call(that, this[i], i, this);
                return other;
            };
        }
        if (!('filter' in Array.prototype)) {
            Array.prototype.filter = function (filter, that /*opt*/) {
                var other = [], v;
                for (var i = 0, n = this.length; i < n; i++)
                    if (i in this && filter.call(that, v = this[i], i, this))
                        other.push(v);
                return other;
            };
        }
        if (!('every' in Array.prototype)) {
            Array.prototype.every = function (tester, that /*opt*/) {
                for (var i = 0, n = this.length; i < n; i++)
                    if (i in this && !tester.call(that, this[i], i, this))
                        return false;
                return true;
            };
        }
        if (!('some' in Array.prototype)) {
            Array.prototype.some = function (tester, that /*opt*/) {
                for (var i = 0, n = this.length; i < n; i++)
                    if (i in this && tester.call(that, this[i], i, this))
                        return true;
                return false;
            };
        }
        /* End IE8 fixes*/

    };
    this.getLookupName = function (attribute) {
        ///<summary>Returns the text value from a lookup field, or a blank string if it is null</summary>
        ///<param name="lookupVal" type="XrmTypes.Attribute">Lookup value</param>
        ///<returns type="String"></returns>
        var lookup = Xrm.Page.getAttribute(attribute).getValue();
        return (lookup != null && lookup.length > 0 & lookup != "null") ? lookup[0].name : "";

    };
    this.getLookupId = function (attribute) {
        ///<summary>Returns the ID value from a lookup field, or a null</summary>
        ///<param name="attribute" type="Page Attribute ID">Attribute ID</param>
        ///<returns type="ID as String or null"></returns>

        var lookup = Xrm.Page.getAttribute(attribute).getValue();
        return (lookup != null && lookup.length > 0 & lookup != "null") ? lookup[0].id.toLowerCase() : null;
    };
    this.setVisibleTabSection = function (tabname, sectionname, show) {
        ///<summary>Sets visibility of a tab.\nThe sectionname can be null.</summary>
        var tab = Xrm.Page.ui.tabs.get(tabname);
        if (tab !== null) {
            if (sectionname === null)
                tab.setVisible(show);
            else {
                var section = tab.sections.get(sectionname);
                if (section !== null) {
                    section.setVisible(show);
                    if (show)
                        tab.setVisible(show);
                }
            }
        }
        else {
            // alert("?");
        }
    };
}

var $u = new BrcXrmUtilities();

var BrcXrmShortcuts = function (attribute) {
    ///<summary>
    ///Shortcut library for various Xrm.Page functions. If there are no return values, chaining is enabled.\n
    ///Can maybe split into data manipulation and attribute/control manipulation tools
    ///</summary>
    this.getValue = function () {
        ///<summary>Returns the attribute value. Can't be chained</summmary>
        return Xrm.Page.getAttribute(attribute).getValue();
    };
    this.addOnChange = function (functionToCall) {
        /// <summary>Add an onchange function to a field</summary>    
        Xrm.Page.getAttribute(attribute).addOnChange(functionToCall);
        return new BrcXrmShortcuts(attribute); // re-initiate for chaining
    };
    this.removeOnChange = function (functionToRemove) {
        Xrm.Page.getAttribute(attribute).removeOnChange(functionToRemove);
        return new BrcXrmShortcuts(attribute); // re-initiate for chaining
    };
    this.setRequired = function (is_Required) {
        ///<summary>Set the requirement level by Boolean value
        ///&#10;Sets to none if false or required if true
        ///</summary>
        ///<param name="is_Required" type="Boolean">True or false</param>
        if (is_Required)
            Xrm.Page.getAttribute(attribute).setRequiredLevel($c.requirementLevels.required); // could just use the text value here
        else
            Xrm.Page.getAttribute(attribute).setRequiredLevel($c.requirementLevels.none);
        return new BrcXrmShortcuts(attribute); // re-initiate for chaining
    };
    this.setRequiredLevel = function (level) {
        ///<summary>Can use $c.requirementlevel</summary>
        ///<param name="level" type="BrcXrmConstants.requirementLevels">One of the values 'required', 'recommended', 'none'.</param>
        Xrm.Page.getAttribute(attribute).setRequiredLevel(level);
        return new BrcXrmShortcuts(attribute); // re-initiate for chaining
    };
    this.setSubmitMode = function (submitMode) {// always");"never"
        ///<summary>Can use $c.submitModes. Set form readonly fields to always if changing value in JS code</summary>
        ///<param name="submitMode" type="BrcXrmConstants.submitModes">One of the values 'always', 'never'</param>
        Xrm.Page.getAttribute(attribute).setSubmitMode(submitMode);
    };
    this.setVisible = function (is_visible) {
        Xrm.Page.getControl(attribute).setVisible(is_visible);
        return new BrcXrmShortcuts(attribute); // re-initiate for chaining
    };
    this.setDisabled = function (is_disabled) {
        Xrm.Page.getControl(attribute).setDisabled(is_disabled);
        return new BrcXrmShortcuts(attribute); // re-initiate for chaining
    };
    this.setDateToday = function () {
        ///<summary>Sets the given attribute value to the current datetime. This will only work on a datetime attribute</summary>
        //if (Xrm.Page.ui.getFormType() == 1) // on create        
        if (Xrm.Page.getAttribute(attribute).getAttributeType() == $c.attributeTypes.datetime)
            Xrm.Page.getAttribute(attribute).setValue(new Date());
        return new BrcXrmShortcuts(attribute); // re-initiate for chaining
    };
    this.setFormNotification = function (message, level) {
        ///<summary>Displays form level notification for this attribute.</summary>
        ///<param name="message">String: The text of the message </param>
        ///<param name="level">Type: ERROR, WARNING, INFO</param>       
        Xrm.Page.ui.setFormNotification(message, level, attribute);
        return new BrcXrmShortcuts(attribute); // re-initiate for chaining
    };
    this.clearFormNotification = function () {
        Xrm.Page.ui.clearFormNotification(attribute);
        return new BrcXrmShortcuts(attribute); // re-initiate for chaining
    };
    this.setValue = function (value) {
        Xrm.Page.getAttribute(attribute).setValue(value);
        return new BrcXrmShortcuts(attribute); // re-initiate for chaining
    };
    this.getText = function () {
        ///<summary>Returns the string value for the currently select option set (and null if none) Does not chain</summary>
        return Xrm.Page.getAttribute(attribute).getText();
    };
    this.getAttribute = function () {
        ///<summary>Returns the attribute object. Does not chain</summary>
        return Xrm.Page.getAttribute(attribute);
    };
    this.setFocus = function () {
        Xrm.Page.getControl(attribute).setFocus();
        return new BrcXrmShortcuts(attribute);
    };
}

var $x = function (attribute) {
    return new BrcXrmShortcuts(attribute);
};
