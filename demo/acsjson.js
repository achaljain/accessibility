var elementsJSON = {};

elementsJSON['options'] = {
  'tabMode': 1,
  'language': 'en',
  'setInitialFocus': '#button1'
}

elementsJSON['hotkeys'] = { 
  'a': {
    mod: 'alt',
    action: 'click',
    target: '#button1'
  },
  'b': {
    mod: 'alt',
    action: 'click',
    target: '#button2'
  },
  'escape': {
    action: 'closePopups',
    autoFocus: '#button1'
  }
}

elementsJSON['elemSeq'] = {
  'elem1': {
    selector: '#button1',
    attributes: {
      'role': 'button',
      'aria-label': {
        "en":"Cyclic Tab Demo. <>"
      }
    },    
    data: {
      'keys': {
        'enter': {
          action: 'click'
        }
      },
      'isCyclicTabTrap': 'elem1',
      'states': {        
        statesList: {
          0:  {
                en: "Inactive"
              },
          1:  {
                en: "Active"
              }    
        }
      },
      'focusTgt': '#popup1 .content'
    },
    children: {
      'elem1_1': {
        selector: '#popup1 .content',
        attributes: {
          'role': 'region',
          'aria-label': {
            "en":"<1>. <2>"
          }
        },
        dynamicLabel: [
          '#popup1 h2', '#popup1 .content'
        ]        
      },
      'elem1_2': {
        selector: '#popup1 .close',
        attributes: {
          'role': 'button',
          'aria-label': {
            "en":"Close Popup"
          }
        },
        data: {
          'keys': {
            'enter': {
              action: 'closePopups',
              autoFocus: '#button1'
            }
          }          
        }        
      }            
    }
  },
  'elem2': {
    selector: '#button2',
    attributes: {
      'role': 'button',
      'aria-label': {
        "en":"Auto close Demo. <>"
      }
    },    
    data: {
      'keys': {
        'enter': {
          action: 'click'
        }
      },
      'globalHotkeys': {
        'escape': {
          action: 'closePopups',
          autoFocus: '#button2'       
        }
      },      
      'autoClose': {
        panelSelector: '#popup2 .popup',
        action: 'closePopups'
      },
      'states': {
        type: 'dynamic'        
      },
      'focusTgt': '#popup2 .content'
    },
    children: {
      'elem2_1': {
        selector: '#popup2 .content',
        attributes: {
          'role': 'region',
          'aria-label': {
            "en":"<1>. <2>"
          }
        },
        dynamicLabel: [
          '#popup2 h2', '#popup2 .content'
        ]       
      },
      'elem2_2': {
        selector: '#popup2 .close',
        attributes: {
          'role': 'button',
          'aria-label': {
            "en":"Close Popup"
          }
        },
        data: {
          'keys': {
            'enter': {
              action: 'closePopups',
              autoFocus: '#button2'
            }
          }
        }        
      }            
    }
  },
   'elem3': {
    selector: '#button3',
    attributes: {
      'role': 'button',
      'aria-label': {
        "en":"Arrow keys. <>"
      }
    },
    data: {
      'keys': {
        'enter': {
          action: 'click'
        }
      },
      'isCyclicTabTrap': 'elem3',
      'enableArrowKeys': ['#popup3 li'],
      'states': {
        type: 'dynamic'
      },
      'focusTgt': '#popup3 .content span'
    },
    children: {
      'elem2_1': {
        selector: '#popup3 .content span',
        attributes: {
          'role': 'region',
          'aria-label': {
            "en":"<1>. <2>"
          }
        },
        dynamicLabel: [
          '#popup3 h2', '#popup3 .content span'
        ]       
      },
      'elem2_2': {
        selector: '#popup3 .content li',
        attributes: {
          'role': 'listitem',
          'aria-label': {
            "en":"<1>"
          }
        },
        dynamicLabel: [
          'li'
        ]       
      },
      'elem2_3': {
        selector: '#popup3 .close',
        attributes: {
          'role': 'button',
          'aria-label': {
            "en":"Close Popup"
          }
        },
        data: {
          'keys': {
            'enter': {
              action: 'closePopups',
              autoFocus: '#button3'
            }
          }
        }        
      }            
    }
  }   
  }
