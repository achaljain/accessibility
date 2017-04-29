AccessibilityManager.init(elementsJSON, null, function() {
	
	AccessibilityManager.announceText('WebPage Ready');

	$('.button').on('click', function() {
		// body...
		$('.overlay').css('display', 'block');
	})

	var closePopup = function() {		
		window.location.href = '#';
		AccessibilityManager.panelCloseHandler();
		$('.overlay').css('display', 'none');
	}

	AccessibilityManager.toggleState('#button1', 1);
	AccessibilityManager.toggleState('#button2', 'Active. Dynamic');		
	AccessibilityManager.toggleState('#button3', 'Active. Dynamic');
	AccessibilityManager.registerActionHandler('closePopups', document, '', closePopup);
});