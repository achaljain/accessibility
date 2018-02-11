var AccessibilityManager = (function(){

  var masterJSON = {};

  var jQueryScriptOutputted = false;

  var globalTabGroupStack = [];
  var tabCtr = 0;  
  var currentTabGroup = '';
  var childTabGroups = null;
  var currentChildGroupId = 0;
  var cyclicTabbing = false;
  var cycleGroup = [];
  var cyclicTabbingStart = '';
  var cyclicTabbingEnd = '';
  var focusElemRef = null;
  var autoClosePanel = null;
  var arrowKeyGroup = null;
  var focusHandlerFlag = false;
  var panelLauncherElem = null;
  var tabGroupHotkeys = null;
  var activeElementSet = {
    current: null,
    next: null,
    prev: null
  };

  // Aria Labels
  var disableLabelRemoval = false;
  var labelTempObj = null;

  // Custom Actions
  var ActionManager = {};
  ActionManager.actions = {};

  //User Agents
  var isMobile = navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i);

  var globalKeyData = {
    mods: {
      CTRL: false,
      SHIFT: false,
      ALT: false
    },
    8: 'BACKSPACE',
    9: 'TAB',
    13: 'ENTER',
    18: 'ALT',
    27: 'ESCAPE',
    32: 'SPACE',
    33: 'PAGEUP',
    34: 'PAGEDOWN',
    37: 'LEFTARROW',
    38: 'UPARROW',
    39: 'RIGHTARROW',
    40: 'DOWNARROW',
    48: '0',
    49: '1',
    50: '2',
    51: '3',
    52: '4',
    53: '5',
    54: '6',
    55: '7',
    56: '8',
    57: '9',
    65: 'A',
    66: 'B',
    67: 'C',
    68: 'D',
    69: 'E',
    70: 'F',
    71: 'G',
    72: 'H',
    73: 'I',
    74: 'J',
    75: 'K',
    76: 'L',
    77: 'M',
    78: 'N',
    79: 'O',
    80: 'P',
    81: 'Q',
    82: 'R',
    83: 'S',
    84: 'T',
    85: 'U',
    86: 'V',
    87: 'W',
    88: 'X',
    89: 'Y',
    90: 'Z',
    96: '0',
    97: '1',
    98: '2',
    99: '3',
    100: '4',
    101: '5',
    102: '6',
    103: '7',
    104: '8',
    105: '9'
  }

  // 0: Natural, 1: Sequential, 2: Json Configured
  var configOptions = {
    'tabMode': 0,
    'language': 'en',
    'setInitialFocus': 'body'
  };

  function validateJSON(configObj) {
    if(typeof configObj == 'object') {
      return true;
    } else {
      console.error("Config JSON Invalid.");
      return false;
    }
  };

  function initAcs(configObj, options, callback) {

    //if the jQuery object isn't available
    if (typeof(jQuery) == 'undefined') {

        if (!jQueryScriptOutputted) {
            //only output the script once..
            jQueryScriptOutputted = true;

            //output the script (load it from google api)
            document.write("<scr" + "ipt type=\"text/javascript\" src=\"https://code.jquery.com/jquery-3.2.1.min.js\" integrity=\"sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=\" crossorigin=\"anonymous\"></scr" + "ipt>");
        }
        setTimeout(function() {
          initAcs(configObj, options, callback);
        }, 100);
    } else {

        $(function() {  
            //do anything that needs to be done on document.ready
            if(validateJSON(configObj)) {
              console.log('Accessibility Init Success..');
              masterJSON = configObj;
              if(options) {
                $.extend(masterJSON.options, options);
              }        
              setOptions(masterJSON.options);        
              // convertKeysValue(masterJSON);        
              addAcsAttr(masterJSON.elemSeq);        
              addAcsEvents();
              addAriaDiv();
              if(masterJSON.options.setInitialFocus) {
                $(masterJSON.options.setInitialFocus).focus();          
              }
              if(callback) {
                callback();
              }
            }
        });
    }

  }

  function setOptions(optionsObj) {

    $.each(optionsObj, function(k, v) {
      if(configOptions[k] != undefined) {
        configOptions[k] = optionsObj[k];
      } else {
        console.log('Config Option Not Available! OPTION : ' + k);
      }      
    })

    tabCtr = (configOptions.tabMode == 1) ? 1 : 0;
  };

  function addAcsAttr(elemObj) {

    $.each(elemObj, function(k, v) {
      
      var currentElem = $(elemObj[k].selector);
      if(elemObj[k].docRefObj) {
        currentElem = $(elemObj[k].docRefObj.contentIframe).contents().find(elemObj[k].selector);
      }

      if(currentElem) {

        $.each(currentElem ,function(index, el){

          if(configOptions.tabMode != 2) {          
            $(el).attr('tabindex', tabCtr);
            $(el).attr('orginalTabRef', tabCtr);
          }

          if(elemObj[k].ignoreTab) {
            $(el).attr('tabindex', '-1');
            $(el).attr('ignoreTab', 'true');
          } else {
            // $(el).attr('orginalTabRef', $(el).attr('tabindex')); 
            $(el).attr('acsTouch', true); 
          }

          if(elemObj[k].attributes) {
            $.each(elemObj[k].attributes, function(k, v) {          
              if(k == 'aria-label') {            
                v = v[configOptions.language];
              }          
              $(el).attr(k, v);
            })
          }       
          
          if(elemObj[k].dynamicLabel) {
            var lbl = $(el).attr('aria-label');
            $.each(elemObj[k].dynamicLabel, function(idx, elem) {
              var replacePos = '<' + (idx + 1) + '>';
              var textElemObj = $(el).find(elem)[0] || $(elem)[index] || $(elem)[0];                           
              lbl = lbl.replace(replacePos, $(textElemObj).text().trim());
            })
            $(el).attr('aria-label', lbl);
          }

          if(elemObj[k].saveOriginalLabel != false) {
            $(el).attr('originalLabel', $(el).attr('aria-label'));
          }

          if(elemObj[k].data) {            
            $.data(el, 'acsData', elemObj[k].data );
            if(elemObj[k].data.states) {
              setElementState(el, elemObj[k].data.states, true);
            }
          }
          
        });               
      }

      if(!elemObj[k].naturalTabOrder) {
        tabCtr = (tabCtr > 0)? (tabCtr + 1) : tabCtr;
      }          

      if(elemObj[k].children) {
        addAcsAttr(elemObj[k].children);
      }

    });

  };

  function convertKeysValue(masterObj) {    
    $.each(masterObj, function(k, v){        
      if((k == 'hotkeys') || (k == 'keys') || (k == 'registerAction')) {
        var key
        var keys = Object.keys(v);
        var n = keys.length;
        var newobj={}
        while (n--) {
          key = keys[n];
          newobj[key.toUpperCase()] = v[key];
        }
        masterObj[k] = newobj;        
      }
      if((typeof(v) == 'object') && (v != null)) {
        convertKeysValue(v);
      }           
    });
  }

  function addAcsEvents() {    

    $(document).off('keydown').on('keydown', function(evt) {

      if(evt.altKey == true) {
        globalKeyData.mods['ALT'] = true;        
      }
      if(evt.ctrlKey == true) {
        globalKeyData.mods['CTRL'] = true;
      }
      if(evt.shiftKey == true) {
        globalKeyData.mods['SHIFT'] = true;
      }

      var key = evt.which || evt.keyCode || 0;

      if((key == 9) && (evt.shiftKey == false)) {
        tabKeyHandler(evt);
      }

      if((key == 9) && (evt.shiftKey == true)) {
        shiftTabKeyHandler(evt);
      }

      if((key >=37) && (key <= 40)) {
        // evt.preventDefault();
        var dir;
        switch(key) {
          case 37: dir = 0; break;
          case 38: dir = 1; break;
          case 39: dir = 2; break;
          case 40: dir = 3; break;
        }
        arrowKeyHandler(dir, evt);
      }
      
      if(globalKeyData[key]) {

        var keyActionObj = null;
        var isGlobalShortcut = false;

        if(masterJSON['hotkeys'] && masterJSON['hotkeys'][globalKeyData[key].toLowerCase()]) {
          keyActionObj = masterJSON['hotkeys'][globalKeyData[key].toLowerCase()];
          isGlobalShortcut = true;         
        }

        if(tabGroupHotkeys && tabGroupHotkeys[globalKeyData[key].toLowerCase()]) {
          keyActionObj = tabGroupHotkeys[globalKeyData[key].toLowerCase()];
          isGlobalShortcut = true;         
        }
        
        var dataRef = $.data(evt.target, 'acsData');
        if(dataRef && dataRef['keys'] && dataRef['keys'][globalKeyData[key].toLowerCase()]) {
          keyActionObj = dataRef['keys'][globalKeyData[key].toLowerCase()];          
          isGlobalShortcut = false;
        }
        
        if(keyActionObj) {          
          if(keyActionObj.mod) {
            var flag = true;
            if(typeof(keyActionObj.mod) == 'string') {
              if(globalKeyData.mods[keyActionObj.mod.toUpperCase()] != true) {
                flag = false;
              }
            } else if($.isArray(keyActionObj.mod)) {
              $.each(keyActionObj.mod, function(idx, elem) {
                if(globalKeyData.mods[elem.toUpperCase()] != true) {
                  flag = false;
                }
              })
            } else {
              console.log('Invalid Key Mod. Check JSON. - ',keyActionObj);
            }
            if(flag == false) {
              return;
            }            
          }
          if(keyActionObj.preventDefault) {
            evt.preventDefault();
          }
          if(keyActionObj.stopPropagation) {
            evt.stopPropagation();
          }
          var mainTarget = evt.target;
          var actionTarget = (keyActionObj.target) ? ($(evt.target).find(keyActionObj.target)[0] || $(keyActionObj.target)[0]) : $(evt.target)[0];
          if((isGlobalShortcut == true) && keyActionObj.target) {
            mainTarget =  $(keyActionObj.target)[0];
          }
          switch(keyActionObj.action) {
            case 'click': actionTarget.click();
                          acsClickHandler(mainTarget, actionTarget[0]);
                          break;
            case 'focus': actionTarget.focus(); 
                          break;            
            default:  var customTarget = undefined;
	                  if(keyActionObj.target) {
	                    customTarget = actionTarget;
	                    if(keyActionObj.target == "self") {
	                      customTarget = mainTarget;
	                    }
	                  }
	                  dispatchActionHandler(keyActionObj.action, customTarget);
	                  break;              
          }          
          setTimeout(function() {
            if(keyActionObj.autoFocus) {
              $(keyActionObj.autoFocus).focus();            
            }
          }, 150);
        }
      }
    });

    $(document).on('keyup', function(evt) {
      globalKeyData.mods['ALT'] = false;
      globalKeyData.mods['CTRL'] = false;
      globalKeyData.mods['SHIFT'] = false;
    });

    $(document).on('mouseup', function(evt) {
      var elemRef = null;
      if($(evt.target).attr('acsTouch')) {
        elemRef = evt.target;        
      }
      if($(evt.target).closest('[acsTouch = true]').length > 0) {
        elemRef = $(evt.target).closest('[acsTouch = true]')[0];
      }      
      if(elemRef != null) {
        // autoClosePanel = null;
        acsClickHandler(elemRef);        
      }      
    });
    
    $(document).on('touchend', function(evt) {
      var elemRef = null;
      if($(evt.target).attr('acsTouch')) {
        elemRef = evt.target;        
      }
      if($(evt.target).closest('[acsTouch = true]').length > 0) {
        elemRef = $(evt.target).closest('[acsTouch = true]')[0];
      }      
      if(elemRef != null) {
        // autoClosePanel = null;
        acsClickHandler(elemRef);        
      }      
    });

    $('body').on('focus', '*', function(evt) { 
       if($(evt.target).attr('disableLibFocus')){
        return;
      }
        elemRef = $(evt.target).closest('[acsTouch = true]')[0]; 
      if( $(elemRef).attr('checkDisable') && $(elemRef).hasClass($(elemRef).attr('checkDisable')) ) { return; }    
     
     

      if(focusHandlerFlag == true) {
        focusHandlerFlag = false;
        setCurrentActiveSet(evt.target);        
      }
      if(autoClosePanel != null) {
        if(!($.contains($(autoClosePanel.panelSelector)[0], evt.target))) {
          dispatchActionHandler(autoClosePanel.action);
          autoClosePanel = null;
        }
      }
      if(!isMobile) {
        return;
      }

      setTimeout(function() { 
      
        if(searchElementInCycleGroup(evt.target)) {
          return;
        }       
        if((cyclicTabbing == true) && (focusElemRef != null)) { 
          if(searchElementInCycleGroup(evt.target) == false) {
            evt.preventDefault();
            evt.stopPropagation();            
            $(focusElemRef).focus(); 
            focusElemRef = null;
          }          
        }
      }, 150);
    });

    $('body').on('blur', '*', function(evt) {      
      if(searchElementInCycleGroup(evt.target) == true) {
        focusHandlerFlag = true;        
      }      
      if(!isMobile) {
        return;
      }
      if(cyclicTabbing == true) {
        if(evt.target == cyclicTabbingEnd) {
          focusElemRef = cyclicTabbingStart;
        }
        if(evt.target == cyclicTabbingStart) {
          focusElemRef = cyclicTabbingEnd;
        }       
      } else {
        focusElemRef = null;
      }       
    });
  };

  function acsClickHandler(mainElem, clickTgt) {

    if( $(mainElem).attr('checkDisable') && $(mainElem).hasClass($(mainElem).attr('checkDisable')) ) { return; }    
    
    var dataRef = undefined;
    var nextFocusTarget = null;
    var disableFocusTargetAssign = false;
    var disableLibFocus = false;

    if(mainElem) {
      dataRef = $.data(mainElem, 'acsData');
    } else if(clickTgt) {
      dataRef = $.data(mainElem, 'acsData');
    } else {
      // do nothing
    }

    if(dataRef && dataRef.isCyclicTabTrap) {
      currentTabGroup = dataRef.isCyclicTabTrap;
      if(globalTabGroupStack.indexOf(currentTabGroup) < 0) {
        panelLauncherElem = mainElem || clickTgt;
      }
    }    

    // Set Current Group from Json Order
    if(currentTabGroup) {

      if(globalTabGroupStack.indexOf(currentTabGroup) < 0) {
        globalTabGroupStack.push(currentTabGroup);        
      }

      getChildTabGroups(currentTabGroup);

      var obj = searchTabGroupInJSON(currentTabGroup); 
      var domElemRef = $(obj.selector)[0];
      if(obj.docRefObj) {
        domElemRef = $(obj.docRefObj.contentIframe).contents().find(obj.selector)[0];
      }
      if(obj && obj.attributes && obj.attributes.disableLibFocus && ($(mainElem)[0] == domElemRef)) {
        disableLibFocus = true;
      }     
      if(obj && obj.data && !dataRef) {
        dataRef = obj.data;
      }

      cycleGroup = getChildrenGroup(currentTabGroup);
      if(cycleGroup.length > 0)  {
        cyclicTabbingStart = $(cycleGroup[0])[0];
        cyclicTabbingEnd = $($(cycleGroup[cycleGroup.length - 1]).last())[0];
        nextFocusTarget = cyclicTabbingStart;
      }       
    }
    
    if(dataRef) {      
      // Set Current Group from Json Specification if available
      if(dataRef.isCyclicTabTrap) {        
        cyclicTabbing = true;
        updateTabIndex(currentTabGroup);
        if(dataRef.cyclicTab && dataRef.cyclicTab.cyclicGroup) {
          cycleGroup = dataRef.cyclicTab.cyclicGroup;
        }
        if(dataRef.cyclicTab && dataRef.cyclicTab.start) {
          cyclicTabbingStart = $(dataRef.cyclicTab.start)[0];
          nextFocusTarget = cyclicTabbingStart;
        }
        if(dataRef.cyclicTab && dataRef.cyclicTab.end) {
          cyclicTabbingEnd = $(dataRef.cyclicTab.end)[0];
        }       
      }

      if(dataRef.globalHotkeys) {
        tabGroupHotkeys = dataRef.globalHotkeys;
      } else {
        tabGroupHotkeys = null;
      }

      if(dataRef.enableArrowKeys) {
        arrowKeyGroup = dataRef.enableArrowKeys;        
      } else {
        arrowKeyGroup = null;
      }

      if(dataRef.autoClose) {
        autoClosePanel = {};
        autoClosePanel.panelSelector = dataRef.autoClose.panelSelector;
        autoClosePanel.action = dataRef.autoClose.action;
      } else {
        autoClosePanel = null;
      }

      if(dataRef.focusTgt) {
        if(dataRef.focusTgt == 'target') {
          if(mainElem) {
            nextFocusTarget = mainElem;
            disableFocusTargetAssign = true;
          }
        } else if($(dataRef.focusTgt).is(':visible') && ($(dataRef.focusTgt).css('display') != 'none')) {
          nextFocusTarget = dataRef.focusTgt;
          disableFocusTargetAssign = true;
        } else {
          var elemRef = getNextActiveElement(cycleGroup, 1, dataRef.focusTgt);
          if(elemRef) {
            nextFocusTarget = elemRef;
            disableFocusTargetAssign = true;
          }
        }
      }      
    }
    
    // Set Current Group if there are multiple parallel tabgroups at same level
    if(currentTabGroup && childTabGroups && childTabGroups[currentChildGroupId]) {
      updateTabIndex(currentTabGroup);
      cycleGroup = childTabGroups[currentChildGroupId];
      cyclicTabbingStart = $(cycleGroup[0])[0];
      cyclicTabbingEnd = $($(cycleGroup[cycleGroup.length - 1]).last())[0];      
      if((disableFocusTargetAssign == false) || (searchElementInCycleGroup($(nextFocusTarget)[0]) == false)) {
        nextFocusTarget = cyclicTabbingStart;
      }
      $.each(childTabGroups, function(k, v) {        
        disableAcsElems(childTabGroups[k]);        
      });
      enableAcsElems(childTabGroups[currentChildGroupId]);
    }
   
    if(!cyclicTabbingStart || !($(cyclicTabbingStart).is(':visible')) || ($(cyclicTabbingStart).css('display') == 'none')) {
      var elemRef = getNextActiveElement(cycleGroup, 1, cyclicTabbingStart);
      if(elemRef) {
        cyclicTabbingStart = elemRef;
        if((disableFocusTargetAssign == false) || (searchElementInCycleGroup($(nextFocusTarget)[0]) == false)) {
          nextFocusTarget = cyclicTabbingStart;
        }
      }
    }
    if(!cyclicTabbingEnd || !($(cyclicTabbingEnd).is(':visible')) || ($(cyclicTabbingEnd).css('display') == 'none')) {
      var elemRef = getNextActiveElement(cycleGroup, -1, (cyclicTabbingEnd || cyclicTabbingStart));
      if(elemRef) {
        cyclicTabbingEnd = elemRef;
      }
    }
    
    if($(nextFocusTarget).attr('disableLibFocus') || (disableLibFocus == true)) {
      nextFocusTarget = null;
    }
    
    setTimeout(function() {
      if(nextFocusTarget != null) {
        $(nextFocusTarget).focus();
        if((cyclicTabbing == true) && (searchElementInCycleGroup($(nextFocusTarget)[0]) == true) && (activeElementSet.current != $(nextFocusTarget)[0])) {
          setCurrentActiveSet($(nextFocusTarget)[0]);
        }
      }
    }, 100);    
  }

  function tabKeyHandler(evt) {
    if(cyclicTabbing == true) {         
      if(evt.target == cyclicTabbingEnd) {
        evt.preventDefault();           
        $(cyclicTabbingStart).focus();
        if((searchElementInCycleGroup(cyclicTabbingStart) == true) && (activeElementSet.current != cyclicTabbingStart)) {
          setCurrentActiveSet(cyclicTabbingStart);
        }
      }      
    }
  }

  function shiftTabKeyHandler(evt) {
    if(cyclicTabbing == true) {      
      if(evt.target == cyclicTabbingStart) {
        evt.preventDefault();
        $(cyclicTabbingEnd).focus();
        if((searchElementInCycleGroup(cyclicTabbingEnd) == true) && (activeElementSet.current != cyclicTabbingEnd)) {
          setCurrentActiveSet(cyclicTabbingEnd);
        }
      }
    }
  }

  function arrowKeyHandler(dir, evt) {
    var direction = 1;
    if(dir == 0) {
      // Left
      direction = -1;
    }
    if(dir == 1) {
      // Up
      direction = -1;
    }
    if(dir == 2) {
      // Right
      direction = 1;
    }
    if(dir == 3) {
      // Down
      direction = 1;
    }    
    if(arrowKeyGroup != null) {
      var elemRef = getNextActiveElement(arrowKeyGroup, direction);
      if(elemRef) {
        $(elemRef).focus();
      }
    }
  }

  function updateTabIndex(jsonKeyRef) {
    var obj = searchTabGroupInJSON(jsonKeyRef);
    if(!obj) {
      return;
    }
    var domElemRef = $(obj.selector);
    if(obj.docRefObj) {
      domElemRef = $(obj.docRefObj.contentIframe).contents().find(obj.selector);
    }
    if($(domElemRef).attr('orginaltabref')) {
      tabCtr = parseInt($(domElemRef).attr('orginaltabref')) + 1;      
    }
    if(obj.children) {
      // childTabGroups = {};
      addAcsAttr(obj.children);
    }
    // if(obj.data && obj.data.cyclicTab) {      
    //   cyclicTabbingStart = $(obj.data.cyclicTab.start)[0];
    //   cyclicTabbingEnd = $(obj.data.cyclicTab.end)[0];
    // }
  }

  function searchTabGroupInJSON(jsonKeyRef) {
    if(!jsonKeyRef) return;
    var obj = null;    
    function traverseJSON(masterObj, jsonKeyRef) {
      if(masterObj!=undefined) {
        $.each(masterObj, function(k, v){        
          if(k == jsonKeyRef) {
            obj = v;
          }
          if(v.children) {
            traverseJSON(v.children, jsonKeyRef);
          }      
        });
      }
    }
    traverseJSON(masterJSON.elemSeq, jsonKeyRef);
    return obj;
  }

  function searchElementInCycleGroup(elemRef) {
    var flag = false;
    $.each(cycleGroup, function(idx, elem) {
      $(elem).each(function(id, el) {        
        if(elemRef == el) {                   
          flag = true;
        }
      })
    });
    return flag;
  }

  function getChildrenGroup(jsonKeyRef) {
    var groupRef = jsonKeyRef || currentTabGroup;
    var obj = searchTabGroupInJSON(jsonKeyRef);    
    var childrenArr = [];
    function traverse(obj) {
      if(obj && obj.children) {      
        $.each(obj.children, function(k, v) {
          if(v.ignoreTab) {
            // do nothing
          } else {
            childrenArr.push(v.selector);
          }
          if(v.children) {
            traverse(v); 
          }                  
        })        
      }      
    }
    traverse(obj);
    return childrenArr;
  }

  function getChildTabGroups(jsonKeyRef) {
    var groupRef = jsonKeyRef || currentTabGroup;
    var mainObj = searchTabGroupInJSON(jsonKeyRef);
    childTabGroups = null;
    function traverse(obj) {
      if(obj && obj.children) {
        $.each(obj.children, function(k, v) {
          if(v.data && v.data.childTabGroupId) {  
            if(!childTabGroups) { childTabGroups = {}; }
            if(!childTabGroups[v.data.childTabGroupId]) {
              childTabGroups[v.data.childTabGroupId] = [];
            }
            if(v.ignoreTab) {
              // do nothing
            } else {
              if(childTabGroups[v.data.childTabGroupId].indexOf(v.selector) < 0) {
                childTabGroups[v.data.childTabGroupId].push(v.selector);
              }
            }
          }
          if(v.children) {
            traverse(v);
          }
        })      
      }
    }
    traverse(mainObj);        
  }

  function getNextActiveElement(elemGroup, direction, currentElement) {
    var currentActiveElem = document.activeElement;
    if(currentElement) {
      currentActiveElem = $(currentElement)[0];
    }
    var elementsArr = [];
    var elemPosition = -1;
    var nextElem = null;

    $.each(elemGroup, function(idx, elem) {
      $(elem).each(function(id, el) {
        elementsArr.push(el);         
      })
    });

    $.each(elementsArr, function(idx, elem) {
      if(elem == currentActiveElem) {
        elemPosition = idx;
      }
    });

    if(elemPosition >= 0) {
      var pos = elemPosition;
      for(var i=0; i<elementsArr.length; ++i) {
        if(direction == 1) {
          pos = (pos == (elementsArr.length - 1)) ? 0 : (pos + 1);
        }
        if(direction == -1) {
          pos = (pos == 0) ? (elementsArr.length - 1) : (pos - 1);
        }
        if( (pos >= 0) && (pos < elementsArr.length) && $(elementsArr[pos]).is(':visible') && ($(elementsArr[pos]).css('display') != 'none') ) {
          nextElem = elementsArr[pos];
          break;
        }        
      }
      return nextElem;
    } else {
      return false;
    }
  }

  function setCurrentActiveSet(elem) {
    activeElementSet.current = elem;
    activeElementSet.next = getNextActiveElement(cycleGroup, 1, elem);
    activeElementSet.prev = getNextActiveElement(cycleGroup, -1, elem);
    // if(isMobile) {
    //   disableAcsElems(cycleGroup, function() {
    //     enableAcsElems([activeElementSet.prev,activeElementSet.current,activeElementSet.next]);
    //   })    
    // }
  }

  function dispatchActionHandler(actionName, actionTarget) {    
    if(ActionManager.actions[actionName] != undefined) {
      var tgt = $(actionTarget)[0] || $(ActionManager.actions[actionName]['target'])[0];
      if(ActionManager.actions[actionName]['name']) {
        $(tgt).trigger(ActionManager.actions[actionName]['name'], [ActionManager.actions[actionName]['data']]);
      }
      if(ActionManager.actions[actionName]['callback']) {
        (ActionManager.actions[actionName]['callback']).call(tgt, ActionManager.actions[actionName]['data']);
      }      
      // ActionManager.actions[strAction].map(function(func){
      //   func(data);
      // })
    } else {
      console.log("Action Not Registered");
    }
  }

  function setElementState(elem, state, isInitialState) {
    if($(elem).length == 0) {
      console.warn("Element not found - ", elem);
      return;
    }    
    var lbl = $(elem).attr('originalLabel');
    var stataData = $.data($(elem)[0], 'acsData');
    if(!stataData) {
      console.warn('State Data Not Available.');
      return;
    }
    var statesObj = stataData.states;
    if(lbl) {
      var str = '';
      if(statesObj !== undefined) {
        if(statesObj.type == 'dynamic') {
          str = (isInitialState == true) ? $(statesObj.target).text().trim() : state;
        } else {
            str = (isInitialState == true) ? statesObj.statesList['0'][configOptions['language']] : statesObj.statesList[state][configOptions['language']];
        }
      }
      
      lbl = lbl.replace('<>', str); 
      $(elem).attr('aria-label', lbl);
    } else {
      console.log('Original Label Missing. Check JSON');
    } 
  }

  function addAriaDiv() {
    var elemDiv = document.createElement('div');
    elemDiv.id = "statusDiv";
    elemDiv.style['position'] = 'absolute';
    elemDiv.style['height'] = '0px';
    elemDiv.style['width'] = '0px';
    elemDiv.style['opacity'] = 0.01;
    elemDiv.style['overflow'] = 'hidden';
    elemDiv.setAttribute('aria-live', 'polite');
    elemDiv.setAttribute('tabindex', -1);
    // if(Accessibility.isIpad == true) {
    //   elemDiv.setAttribute('role', 'status');
    // }      

    setTimeout(function() {
      document.body.appendChild(elemDiv);     
    }, 10);
  }

  function enableAcsElems(elemArr, callback) {
    $.each(elemArr, function(idx, elemRef) {      
      $(elemRef).each(function(index, elem) {
        if($(elem).attr('orginalTabRef') && !$(elem).attr('ignoreTab')) {
          $(elem).attr('tabindex', $(elem).attr('orginalTabRef'));
        }
        if($(elem).attr('savedLabel')) {
          $(elem).attr('aria-label', $(elem).attr('savedLabel'));
          $(elem).removeAttr('savedLabel');
        }
        if($(elem).attr('savedRole')) {
          $(elem).attr('role', $(elem).attr('savedRole'));
          $(elem).removeAttr('savedRole');
        }
        $(elem).removeAttr('aria-hidden');            
        $(elem).find('*').each(function(index, el) {
          if($(el).attr('orginalTabRef')) {
            $(el).attr('tabindex', $(el).attr('orginalTabRef'));
          } else {
            $(el).removeAttr('tabindex');
          }
        });
      });
    });
    if (callback) {
      callback();
    }
  }

  function disableAcsElems(elemArr, callback) {
    $.each(elemArr, function(idx, elemRef) {
      $(elemRef).each(function(index, elem) {
        $(elem).attr('tabindex', '-1');
        if($(elem).attr('aria-label')) {
          $(elem).attr('savedLabel', $(elem).attr('aria-label'));
          $(elem).attr('aria-label', '');
        }       
        if($(elem).attr('role')) {
          $(elem).attr('savedRole', $(elem).attr('role'));
          $(elem).attr('role', '');
        }      
        $(elem).attr('aria-hidden', 'true');
        $(elem).find('*').attr('tabindex', -1);     
      });       
    });
    if (callback) {
      callback();
    }
  }

  var acs = {
    init: function(configObj, options, callback) {
      initAcs(configObj, options, callback);      
    },

    setConfig: function(obj) {
      setOptions(obj);
    },

    updateTabOrder: function(jsonKeyRef, callback) {
      setTimeout(function() {
        if(jsonKeyRef) {
          updateTabIndex(jsonKeyRef);  
        } else {
          updateTabIndex(currentTabGroup);
        }        
        acsClickHandler();
        if (callback) {
          callback();
        }        
      }, 100);      
    },

    setTabGroup: function(ref) {
      currentTabGroup = ref;
    },

    updateTabGroup: function(groupId) {
      currentChildGroupId = groupId + 1;
    },

    setAutoClosePanel: function(obj) {
      autoClosePanel = {};
      autoClosePanel.panelSelector = obj.panelSelector;
      autoClosePanel.action = obj.action;
    },

    panelCloseHandler: function(callback) {
      cyclicTabbing = false;
      cycleGroup = [];
      globalTabGroupStack.pop();
      if(globalTabGroupStack.length > 0) {
        var ctr = globalTabGroupStack.length - 1;
        while(ctr>=0) {
          currentTabGroup = globalTabGroupStack[ctr];
          if(searchTabGroupInJSON(currentTabGroup))  {
              break;
          } else {
            globalTabGroupStack.pop();
          }
          ctr--;
        }
        
        acsClickHandler();
      } else {
        currentTabGroup = null;
      } 
      if(callback) {
        callback();
      }     
    },

    enableElements: function(elemArr, callback) {
      enableAcsElems(elemArr, callback);
    },

    disableElements: function(elemArr, callback) {
      disableAcsElems(elemArr, callback);
    },

    toggleState: function(elem, state) {
      setElementState(elem, state, false);    
    },

    toggleAttribute: function(elem, attrStr, val) {
      $(elem).attr(attrStr, val);
    },

    removeAriaLabel: function(elemRef) {
      if(disableLabelRemoval == true) {
        return;
      }
      labelTempObj = {};
      labelTempObj.elemId = elemRef;
      labelTempObj.label = $(elemRef).attr('aria-label');
      labelTempObj.role = $(elemRef).attr('role');
      if(labelTempObj.label) {
        $(elemRef).attr('aria-label', '');
        $(elemRef).attr('role', '');
        disableLabelRemoval = true;
      } else {
        labelTempObj = {};
      }
    },

    restoreAriaLabel: function() {

      var elemRef = labelTempObj.elemId;
      if(elemRef) {
        $(elemRef).attr('aria-label', labelTempObj.label);
        $(elemRef).attr('role', labelTempObj.role);
        disableLabelRemoval = false;
      }
      labelTempObj = {};
    },

    announceText: function(str) {      
      setTimeout(function(){
        $('#statusDiv')[0].innerHTML = "";
        $('#statusDiv')[0].innerHTML = str;
      },200);
    },    

    registerActionHandler: function(actionName, targetElem, strAction, actionCallback, actionData) {

      // if(ActionManager.actions[strAction] == undefined)
      // {
      //   ActionManager.actions[strAction] = [];
      // }
      // ActionManager.actions[strAction].push(actionCallback);

      if(ActionManager.actions[actionName] == undefined) {
        ActionManager.actions[actionName] = {};        
        ActionManager.actions[actionName]['target'] = targetElem;
        ActionManager.actions[actionName]['name'] = strAction;
        ActionManager.actions[actionName]['callback'] = actionCallback;
        ActionManager.actions[actionName]['data'] = actionData;
      }      
    },

    dispatchAction: function(strAction, actionTarget) {
      dispatchActionHandler(strAction, actionTarget);
    },

    getPanelLauncher: function() {
      if(panelLauncherElem) {
        return panelLauncherElem;
      }
      return false;
    },
	
	setFocus: function(elemRef) {
		setTimeout(function(){
			$(elemRef).focus();
		},150);
	}
  };

  return acs;
})();