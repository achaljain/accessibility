[![Build Status](https://travis-ci.org/achaljain/accessibility.svg?branch=master)](https://travis-ci.org/achaljain/accessibility)

# Web Accessibility
A library to make any webpage accessible.

Web accessibility aims at making websites accessible to people with disabilities. Web accessibility standards and guidelines are managed by W3C. WCAG - Web Content Accessibility Guidelines are the list of guidelines developed for implementation and testing of accessible webpages. W3C has also started a separate program called WAI-ARIA (Accessible Rich Internet Applications) which provides support for new advanced features in web such as sliders, drag and drops, dropdowns etc. 

This library is based on javascript and jquery. It requires a JSON object as input in which sequence of html selectors, attributes and other properties are specified. User has to initialise the library with input JSON once entire DOM structure has been loaded and application is ready to use.

## [Demo](https://achaljain.github.io/accessibility/demo/)

## Installation
```
npm install webacs
```

## Input JSON

```
var obj = {
	'options': {},
	'hotkeys': {},
	'elemSeq': {}
}
```

### Configurable properties

This section specify configuration options to use while initialising the library. Following options are avaialble:

```
obj['options']: {
  'tabMode': 1,
  'language': 'en',
  'setInitialFocus': 'anySelector'
}	
```
- tabmode: It can take value 0, 1 or 2.
	- 0: Natural tab ordering. This will give zero tabindex to entire DOM.
	- 1: Incremental tab ordering.
	- 2: Tabindex has to be specified in JSON for each element.
- language: Specify language for webpage. Alt text and states will be applied in the selected language. Default is 'en'.
- setInitialFocus: Selector for element where initial focus should be kept when web page is launched.

### Shortcut Keys

This section lists all keyboard shortcuts and corresponding actions. Available keys: ENTER, ESCAPE, BACKSPACE, PAGEUP/DOWN, LEFT/RIGHT/UP/DOWN ARROW, TAB, A-Z, 0-9 with modifiers CTRL, ALT and SHIFT.
Modifiers cannot be used alone.

```javascript
obj['hotkeys'] = {
	'y': {
		mod: 'alt',
		action: 'click',
		target: 'anySector',
		autoFocus: 'anySelector'
	}
}		
```
For multiple mods write 'mod' property as array- mod: ['ctrl', 'shift']
'action': can be 'click', 'focus' or any custom action registered with library.
'target': 'action' will be perfomed on 'target' if specified. For custom actions, use 'self' to set target as current element.
'autoFocus': if avaialble focus will set to the specified element after action is perfomed


### Element Sequence

This section lists DOM nodes where accessibility has to be applied. Each item in the list is a object which contains selector for DOM node, attributes object, data object and children object. Data object contains keyboard actions and library features to be made avaialble for the DOM node. JSON is traversed recursively. Each child will have same structure as parent.

Below is a dummy JSON to demonstrate correct place for each property.

```javascript
obj['elemSeq'] = {
'elem1': {
    selector: 'anySelector',
    docRefObj: {
      contentIframe: ".iframeSelector"
    },
    attributes: {
      'role': 'button',
      'aria-label': {
        "en":"string",
        "es":"string"
      },
      'checkDisable': 'classname'
    },
    dynamicLabel: [
      'anySelector'
    ],
    ignoreTab: true,
    naturalTabOrder: true,    
    data: {
      'keys': {
        'enter': {
          action: 'click'
        }
      },
      'globalHotkeys': {
        'escape': {
          action: 'actionName',
          autoFocus: 'anySelector'
        }
      },
      'isCyclicTabTrap': 'elem1',
      'childTabGroupId': 1,
      'enableArrowKeys': ['anySelector', 'anySelector'],
      'autoClose': {
        panelSelector: 'anySelector',
        action: 'actionName'
      },
      'states': {
        type: 'dynamic',
        target: 'anySelector',
        statesList: {
          0:  {
                en: "Some Text",
                es: "Some Text"
              }
        }
      },
      'focusTgt': 'anySelector'
    },
    children: { ... }
    }
}
```			

## JSON Options

### docRefObj
Add this object to change parent object for selector. Useful for iframes in page. In iframes tab focus may not work, use key events to manage focus transition between main document and iframe contents.

### dynamicLabel
An array of selectors from which alt text will be generated dynamically. Label is applied once during initilisation. To update label or part of it dynamically use states property.

```
Example: 'aria-label': {
    			'en': 'some text <1> some text <2>'
    		 }
    		 dynamicLabel': ['selector1', 'selector2']
```		 

### globalHotkeys
An object that lists keyboard shortcuts which overwrite global hotkeys. This can appear only once outside all children. The specified shortcut key will be functional whenever focus is on any of the children.

### isCyclicTabTrap
Set this to name of json object ('elem1') if tab has to be trapped in the children is cyclic manner.

### enableArrowKeys
An array of selectors from children in which focus can be moved using arrow keys. Useful for dropdown menus.

### autoClose
Autoclose the panel whenever focus is moved out of the panel. Requires selector for outermost parent which contains the entire focusable items for the panel and a custom action registered with library which closes that panel.

### states
Adds state of element along with alt text. If 'type' is 'dynamic', one time initial state is applied from text of specified target on application load. If 'type' is not dynamic, statesList contains a list of available states. States can be toggled through library function call inside application.

### focusTgt
Sets focus on specified area whenever element is clicked.

### ignoreTab
If true, the element will be recieve tab focus

### naturalTabOrder
If true and tabindex is incremental, tab counter will not be increased and next element will recieve the same tab index.

### childTabGroupId
It is used when there multiple tabgroups at same level. It is a natural number provided for each child. It divides all the children in different groups and tab moves in one group at a time. Update group number from application code when required.

### checkDisable
Add classname that identifies disabled state of an element, accessibility events will not work for the element if it is disabled.


## Methods

### init
Apply accessibility properties to DOM. Call this function when entire application in initialised and ready to use.
```
@param {object} configObj - json with element sequence
@param {object} options - overwrite configurable property in json
@param {function} callback - callback function
```

### setTabGroup
Sets current tab group
```
@param {string} ref - name of json object whose children constitute a tab group
```

### updateTabGroup
Updates current child tab group number
```
@param {number} groupID - a number indicating a section of children in current tab group
```

### updateTabOrder
Updates taborder, accessibility properties and sets initial focus in the specified tab group. Useful for dynamic DOM
```
@param {string} jsonKeyRef - name of json object whose children constitute a tab group
@param {function} callback - callback function
```

### panelCloseHandler
Call this function when leaving a tabgroup. This will pop the current tab group from global stack and refresh the previous tab group which recieves the focus. A global stack is maintained to keep track of the position of user in application across diffrent tab groups
```
@param {function} callback - callback functional
```

### setAutoClosePanel
Over-write current autoClose panel object.
```
@param {object} obj
```

### enableElements
Enable accessibility on elements
```
@param {array} elemArr - Array of selectors
@param {function} callback - callback function
```

### disableElements
Disable accessibility on elements
```
@param {array} elemArr - Array of selectors
@param {function} callback - callback function
```

### toggleAttribute
Change attribute value of an element
```
@param {string} elem - selector
@param {string} attrstr - attribute name
@param {string} val - attribute value
```

### toggleState
Change state of element.
```	
Example: 'aria-label': {
    			'en': 'some text: <>'
    		 }		 
    		 Dynamic state: AccessibilityManager.toggleState('.elemClass', 'the state');
    		 JSON stateList: AccessibilityManager.toggleState('.elemClass', 1);
```		 

### removeAriaLabel
Remove accessibility properties from an element
```
@param {string} elemRef - Selector for element
```

### restoreAriaLabel
Apply accessibility properties to the element on which removeAriaLabel was called. 'removeAriaLabel' will not work again until 'restoreAriaLabel' is called.

### getPanelLauncher
Returns owner of current tab group through which user entered in the tab group.

### registerActionHandler
Registers a application level method with library which can invoked within library and through keyboard shortcuts.
```
@param {string} actionName - any name for your custom action
@param {object} targetElem - target element, this reference for the action
@param {string} strAction - method name if applicable
@param {function} actionCallback - method definition, skip strAction to use this
@param {object} actionData - data object to pass with event/method

	
Example: AccessibilityManager.registerActionHandler('action1', '.myDiv', 'click');
    		 AccessibilityManager.registerActionHandler('action1', document, '', function(arg){
    		 	// Some action to perform.
    		 }, args);
```		 

### dispatchAction
Executes a custom method registered with library.

### announceText
Updates aria-live section, which is read by screen readers when updated.
```
@param {string} str - text to be read
```

### setFocus
Sets tab focus to a specified element
```
@param {string} elemRef - selector
```