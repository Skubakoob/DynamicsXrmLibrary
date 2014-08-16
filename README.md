#Welcome to the Dynamics CRM 2013 Shortcut library with chaining
This is basically a shorthand library. I got tired of typing Xrm.Page.etc.etc. so this cuts the amount of code right down when writing form logic.

A nice benefit of this library is that we can use chaining - hooray! See below for some examples.

##Who this is for
This library is very early in its life but I've found it a great time saver. It's goal is to make coding dynamics crm a little easier and to make the code that does the work a little neater.

##Usage
Add the file to your CRM solution, add it into your project in VS and you should get some friendly code completion working! Just don't forget to include the file in any forms you use it in.

There are (currently) three objects you can use to speed up your coding:

* $x provides us with a shortcut to a (currently limited) set of attribute and control functions. i.e. $x("attribute_name").setVisible(true);
* $u is a set of utility functions. It's currently a pot for anything that isn't directly related to an attribute, such as shortcut to the Xrm.Utility.confirmDialog function, but also any other functions that may come in handy. i.e. you can use $u.fixIE8(); to apply ECMA262-5 fixes for ie8, $u.hideSubGridAddButton("subgrid_name"); to hide the add new button in sub grids, $u.setVisibleTabSection(tabname, sectionname, show); and so on.
* $c is a number of constant values such as the form types. It's essentially an enumerator for these sorts of things. i.e $c.formTypes.Update == 2

##$x Example

```JavaScript
  Xrm.Page.getAtrribute("attribute").setRequiredLevel("required");
  Xrm.Page.getControl("attribute").setVisible(true);
```
Becomes:
```
  $x("attribute").setRequiredLevel("required").setVisible(true);
```
You could also do
```
  $x("attribute").setRequiredLevel("required").setVisible(true).setValue(value);
```
And so on.

Normal Xrm.whatever obviously all still works.

This file also uses Patrick Verbeetens XrmPage-vsdoc.js - www.patrickverbeeten.com - though I've added a couple of bits for 2013
