/// <reference path="XrmPage-vsdoc.js" />
// Shorthand XRM Library with Chaining
var ShorthandXrmConstants = {
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
    attributeTypes: {
        datetime: "datetime",
        boolean: "boolean",
        decimal: "decimal",
        double: "double",
        integer: "integer",
        lookup: "lookup",
        memo: "memo",
        money: "money",
        optionset: "optionset",
        string: "string"
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
$c = ShorthandXrmConstants;

function ShorthandXrmUtilities() {
    ///<summary>Utility library</summary>
    var RequiredFields = [];
    var that = this; // does it matter where this goes?
    function debugAttributes() {
        Xrm.Page.ui.controls.forEach(function (control, index) {
            var controlType = control.getControlType();
            that.writeToConsole(control.getName() + " - " + control.getControlType());
        });
    };
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
    this.compareGuids = function (guid1, guid2) {
        ///<summary>Compares two guids. Converts both to lower case and strips braces. If both are null, will return true</summary>
        if (guid1 && guid2) {
            guid1 = guid1.replace("{", "").replace("}", "").toLowerCase();
            guid2 = guid2.replace("{", "").replace("}", "").toLowerCase();
            if (guid1 == guid2)
                return true;
            else
                return false;
        }
        else {
            // if either has some kind of value, return false - otherwise both null, so return true
            return
            (!guid1 && guid2) ? false :
            (gui1 && !guid2) ? false :
            true;

        }
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
    this.tidyGuid = function (guid) {
        ///<summary>Returns a guid in lowercase with no brackets</summary>
        if (guid) {
            return guid.replace("{", "").replace("}", "").toLowerCase();
        }
    };
    this.hideSubGridOpenAssociatedView = function (gridName) {
        document.getElementById(gridName + "_openAssociatedGridViewImageButton").style.visibility = 'hidden';
    };
    this.hideSubGridAddButton = function (gridName) {
        ///<summary>UNSUPPORTED: Hides the + button on sub grids. Uses unsupported getElementById</summary>
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
    this.sectionControls = function (tabname, sectionname) {
        ///<summary>returns a collection of controls for a section</summary>
        var tab = Xrm.Page.ui.tabs.get(tabname);
        if (tab !== null) {
            var section = tab.sections.get(sectionname);
            if (section !== null) {
                return section.controls.get();
            }
        }

        return null;
    };
    this.CheckUserRole = function (roleName, context) {
        var userHasRole = false;

        //get the current roles for the user
        var userRoles = context.getUserRoles();

        //get the roleids with the rolename
        //the roleids can be multiple for multiple business units
        var roleIdArray = this.FetchUserRoleIdWithName(roleName, context);
        for (var userRole in userRoles) {
            if (jQuery.inArray(userRoles[userRole], roleIdArray) != -1) {
                userHasRole = true;
                break;
            }
        }
        return userHasRole;
    };
    this.setFormNotification = function (message, level, uniqueId) {
        ///<summary>Displays form level notification. If using an attribute, use $x(attribute_name).setFormNotificationfunction</summary>
        ///<param name="message">String: The text of the message </param>
        ///<param name="level">Type: ERROR, WARNING, INFO</param>       
        ///<param name="uniqueId">uniqueId: An ID for the notification.</param>
        
        Xrm.Page.ui.setFormNotification(message, level ? level : "INFO", uniqueId);
    };
    this.clearFormNotification = function (uniqueId) {
        Xrm.Page.ui.clearFormNotification(uniqueId);
    };
    this.getUserId = function () {
        return Xrm.Page.context.getUserId();
    };
    this.getUserName = function () {
        return Xrm.Page.context.getUserName();
    };
    this.getFormType = function () {
        return Xrm.Page.ui.getFormType();
    };
    this.getFormRecordGuid = function () {
        return Xrm.Page.data.entity.getId();
    };
    // Parameters
    // save => A Boolean value to indicate if data should be saved after it is refreshed.
    // successCallback => A function to call when the operation succeed
    // errorCallbak => A function to call when the operation fails. It gets called with 2 parameters (an error code and a localized error message)
    this.refresh = function (save, successCallback, errorCallback) {
        Xrm.Page.data.refresh(save).then(successCallback, errorCallback);
    };

    // Parameters
    // successCallback => A function to call when the operation succeed
    // errorCallbak => A function to call when the operation fails. It gets called with 2 parameters (an error code and a localized error message)
    this.save = function (successCallback, errorCallback) {
        Xrm.Page.data.save().then(successCallback, errorCallback);
    };
    // Checks whether the security role exists in the system by using ODATA call 
    this.FetchUserRoleIdWithName = function (roleName, context) {
        var serverUrl = Xrm.Page.context.getServerUrl();
        var oDataUri = serverUrl + "/XRMServices/2011/OrganizationData.svc/RoleSet?$filter=Name eq '" + roleName + "'&$select=RoleId";
        var jSonArray = new Array();

        jQuery.ajax({
            type: "GET",
            contentType: "application/json; charset=utf-8",
            datatype: "json",
            url: oDataUri,
            async: false,
            beforeSend: function (XMLHttpRequest) {
                //Specifying this header ensures that the results will be returned as JSON.
                XMLHttpRequest.setRequestHeader("Accept", "application/json");
            },
            success: function (data, textStatus, XmlHttpRequest) {
                if (data && data.d != null) {
                    for (var count = 0; count < data.d.results.length; count++) {
                        jSonArray.push(data.d.results[count].RoleId);
                    }
                }
            },
            error: function (XmlHttpRequest, textStatus, errorThrown) {
                alert("Error :  has occured during retrieval of the role " + roleName);
            }
        });
        return jSonArray;
    };
    // compare two arrays - note JSON data can't be compared in here
    this.compareArrays=function(array1, array2){
        // if the either array is a falsy value, return
        if (!array1 || !array2) {
            return false;
        }

        // compare lengths - can save a lot of time 
        if (array1.length != array2.length) {            
            return false;
        }

        for (var i = 0, l = array1.length; i < l; i++) {
            // Check if we have nested arrays
            if (array1[i] instanceof Array && array2[i] instanceof Array) {
                // recurse into the nested arrays
                //if (!this[i].equals(array[i]))
                if(!this.compareArrays(array1[i], array2[i]))
                    return false;
            }
            else if (array1[i] != array2[i]) {
                // console.log("value different");
                // Warning - two different object instances will never be equal: {x:20} != {x:20}
                return false;
            }
        }
        return true;
    }

    //Retrieve Querystring Parameter
    this.getQSParm = function (parameter) {
        var qrStr = window.location.search;

        var spQrStr = qrStr.substring(1);

        var arrQrStr = new Array();

        // splits each of pair

        var arr = spQrStr.split('&');

        for (var i = 0; i < arr.length; i++) {

            // splits each of field-value pair

            var index = arr[i].indexOf('=');

            var key = arr[i].substring(0, index);

            var val = arr[i].substring(index + 1);

            // saves each of field-value pair in an array variable

            arrQrStr[key] = val;

        }

        return arrQrStr[parameter] === null ? "" : decodeURIComponent(arrQrStr[parameter]);
    }

    //Set Field to Lookup SearchText
    this.searchTextToAttribute = function (attribute) {
        Xrm.Page.getAttribute(attribute).setValue($u.getQSParm('_searchText'));
    }
}

var $u = new ShorthandXrmUtilities();

var ShorthandXRM = function (attribute) {
    ///<summary>
    ///Shortcut library for various Xrm.Page functions. If there are no return values, chaining is enabled.\n
    ///Can maybe split into data manipulation and attribute/control manipulation tools
    ///</summary>
    this.getValue = function () {
        ///<summary>Returns the attribute value. Can't be chained</summmary>
        return Xrm.Page.getAttribute(attribute).getValue();
    };
    this.getLookupGuidValue = function () {
        ///<summary>Returns the attributes GUID value with braces, or NULL. Can't be chained</summmary>      
        var field = Xrm.Page.getAttribute(attribute);
        if (field) {
            var lookup = field.getValue();
            return (lookup != null && lookup.length > 0 & lookup != "null") ? lookup[0].id.toLowerCase() : null;
        }
        else
            return null;
    };
    this.addOnChange = function (functionToCall) {
        /// <summary>Add an onchange function to a field</summary>    
        Xrm.Page.getAttribute(attribute).addOnChange(functionToCall);
        return new ShorthandXRM(attribute); // re-initiate for chaining
    };
    this.removeOnChange = function (functionToRemove) {
        Xrm.Page.getAttribute(attribute).removeOnChange(functionToRemove);
        return new ShorthandXRM(attribute); // re-initiate for chaining
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
        return new ShorthandXRM(attribute); // re-initiate for chaining
    };
    this.setRequiredLevel = function (level) {
        ///<summary>Can use $c.requirementlevel</summary>
        ///<param name="level" type="BrcXrmConstants.requirementLevels">One of the values 'required', 'recommended', 'none'.</param>
        Xrm.Page.getAttribute(attribute).setRequiredLevel(level);
        return new ShorthandXRM(attribute); // re-initiate for chaining
    };
    this.setSubmitMode = function (submitMode) {// always");"never"
        ///<summary>Can use $c.submitModes. Set form readonly fields to always if changing value in JS code</summary>
        ///<param name="submitMode" type="BrcXrmConstants.submitModes">One of the values 'always', 'never'</param>
        Xrm.Page.getAttribute(attribute).setSubmitMode(submitMode);
        return new ShorthandXRM(attribute); // re-initiate for chaining
    };
    this.setVisible = function (is_visible) {
        Xrm.Page.getControl(attribute).setVisible(is_visible);
        return new ShorthandXRM(attribute); // re-initiate for chaining
    };
    this.getVisible = function () {
        return Xrm.Page.getControl(attribute).getVisible();
    };
    this.switchVisible = function () {
        ///<summary>Inverts the visbility of a control</summary>
        var isVisible = Xrm.Page.getControl(attribute).getVisible();
        Xrm.Page.getControl(attribute).setVisible(!isVisible);
        return new ShorthandXRM(attribute); // re-initiate for chaining 
    };
    this.setDisabled = function (is_disabled) {
        Xrm.Page.getControl(attribute).setDisabled(is_disabled);
        return new ShorthandXRM(attribute); // re-initiate for chaining
    };
    this.setDateToday = function () {
        ///<summary>Sets the given attribute value to the current datetime. This will only work on a datetime attribute</summary>
        //if (Xrm.Page.ui.getFormType() == 1) // on create       
        if (Xrm.Page.getAttribute(attribute).getAttributeType() == $c.attributeTypes.datetime) {
            Xrm.Page.getAttribute(attribute).setValue(new Date());
        }
        return new ShorthandXRM(attribute); // re-initiate for chaining
    };
    this.setNotification = function (message) {
        Xrm.Page.getControl(attribute).setNotification(message);
    };
    this.clearNotification = function () {
        Xrm.Page.getControl(attribute).clearNotification();
    };
    this.setFormNotification = function (message, level) {
        ///<summary>Displays form level notification for this attribute.</summary>
        ///<param name="message">String: The text of the message </param>
        ///<param name="level">Type: ERROR, WARNING, INFO</param>       
        Xrm.Page.ui.setFormNotification(message, level, attribute);
        return new ShorthandXRM(attribute); // re-initiate for chaining
    };
    this.clearFormNotification = function () {
        Xrm.Page.ui.clearFormNotification(attribute);
        return new ShorthandXRM(attribute); // re-initiate for chaining
    };
    this.setValue = function (value) {
        Xrm.Page.getAttribute(attribute).setValue(value);
        return new ShorthandXRM(attribute); // re-initiate for chaining
    };
    this.setLookupValue = function (id, name, entityType) {
        ///<summary>Sets a value on a lookup field</summary>
        ///<param name="id">Guid: The Guid of the record (lowercase with braces?)</param>
        ///<param name="name">String: The text description value of the record</param>  
        ///<param name="entityType">String: The entity name</param>  
        var value = [{ id: id, name: name, entityType: entityType }];
        Xrm.Page.getAttribute(attribute).setValue(value);
        return new ShorthandXRM(attribute); // re-initiate for chaining
    };
    this.getText = function () {
        ///<summary>Returns the string value for the currently select option set (and null if none) Does not chain</summary>
        return Xrm.Page.getAttribute(attribute).getText();
    };
    this.getAttribute = function () {
        ///<summary>Returns the attribute object. Does not chain</summary>
        return Xrm.Page.getAttribute(attribute);
    };
    this.getControl = function () {
        ///<summary>Returns the attribute object. Does not chain</summary>
        return Xrm.Page.getControl(attribute);
    };
    this.setFocus = function () {
        Xrm.Page.getControl(attribute).setFocus();
        return new ShorthandXRM(attribute);
    };

    this.fireOnChange = function () {
        Xrm.Page.getAttribute(attribute).fireOnChange();
        return new ShorthandXRM(attribute);
    };
    this.getLabel = function () {
        return Xrm.Page.getControl(attribute).getLabel();
    };
    this.setLabel = function (label) {
        Xrm.Page.getControl(attribute).setLabel(label);
        return new ShorthandXRM(attribute);
    }
    this.addPreSearch = function (preSearchFunction) {
        Xrm.Page.getControl(attribute).addPreSearch(preSearchFunction);
        return new ShorthandXRM(attribute);
    };
}

var $x = function (attribute) {
    return new ShorthandXRM(attribute);
};
