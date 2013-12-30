#Welcome to the Dynamics CRM 2013 Shortcut library with chaining
This is basically a shorthand library. I got bored of typing Xrm.Page.etc.etc. and not remembering if it's Xrm.Page.getAttribute or Xrm.Page.getControl.. 9 times out of 10 I don't care which one it is.

A nice benefit of this library is that we can use chaining.

##Usage

There are (currently) three objects you can use to speed up your coding.

* $x provides us with a shortcut to a (currently limited) set of attribute and control functions. i.e. $x("attribute_name").setVisible(true);
* $u is a set of utility functions. It's currently a pot for anything that isn't directly related to an attribute, such as shortcut to the Xrm.Utility.confirmDialog function, but also any other functions that may come in handy. i.e. you can use $u.fixIE8(); to apply ECMA262-5 fixes for ie8, $u.hideSubGridAddButton("subgrid_name"); to hide the add new button in sub grids, $u.setVisibleTabSection(tabname, sectionname, show); and so on.
* $c is a number of constant values such as the form types. It's essentially an enumerator for these sorts of things. i.e $c.formTypes.Update == 2

$x ##Example

For example:
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
