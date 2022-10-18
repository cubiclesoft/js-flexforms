FlexForms.Dialog Class:  'flexforms/flex_forms_dialog.js'
=========================================================

The FlexForms.Dialog Javascript class adds a moveable, resizeable, modal dialog to FlexForms.  FlexForms.Dialog is a useful layer to display a FlexForms form in a dialog.

FlexForms is a powerful HTML forms generator/builder class to output HTML forms from Javascript using a natural JSON-style arrays approach.

Example usage:

```html
<script type="text/javascript" src="flexforms/flex_forms.js"></script>
<script type="text/javascript" src="flexforms/flex_forms_dialog.js"></script>

<script type="text/javascript">
(function() {
	var options = {
		title: 'Dialog Title',

		content: {
			fields: [
				'startrow',
				{
					title: 'First Name',
					width: '19em',
					type: 'text',
					name: 'first_name',
					default: 'Joe'
				},
				{
					title: 'Last Name',
					width: '18em',
					type: 'text',
					name: 'last_name',
					default: 'Smith'
				},
				'endrow',
				{
					title: 'Test Multiselect',
					width: '38em',
					type: 'select',
					multiple: true,
					name: 'test_select',
					options: [
						{ key: 'Test 1', display: 'Test 1' },
						{ key: 'Test 2', display: 'Test 2' },
						{ key: 'Test 3', display: 'Test 3' },
					],
					default: { 'Test 1': true, 'Test 3': true }
				}
			],
			submit: ['OK', 'Cancel'],
			submitname: 'test_submit'
		},

		onsubmit: function(formvars, formnode, e, lastactiveelem) {
console.log(formvars);

			this.Destroy();

			lastactiveelem.focus();
		},

		onclose: function(lastactiveelem) {
console.log('Close');

			this.Destroy();

			lastactiveelem.focus();
		}
	};

	var dlg = FlexForms.Dialog(document.body, options);
})();
</script>
```

FlexForms.Dialog(parentelem, options)
-------------------------------------

Category:  Constructor

Parameters:

* parentelem - A DOM node to append the root of the dialog to (document.body is recommended).
* options - An object containing options to use to construct the dialog.

Returns:  A Javascript function hierarchy.

This function sets up a new FlexForms.Dialog instance.

The options object can contain the following:

* modal - A boolean indicating whether or not the dialog will be modal (Default is true).
* backgroundcloses - A boolean indicating whether or not clicking off the dialog will close the dialog (Default is false).
* move - A boolean indicating whether or not the dialog can be moved by dragging the title bar (Default is true).
* resize - A boolean indicating whether or not the dialog can be resized by dragging the edges (Default is true).
* title - A string containing a title to use for the title bar of the dialog (Default is '').
* content - An object containing FlexForms.Generate() options (Default is an empty object).
* errors - An object containing FlexForms.Generate() errors (Default is an empty object).
* request - An object containing FlexForms.Generate() request variables (Default is an empty object).
* onposition(elem) - An optional callback that is called whenever the position or size of the dialog has changed (Default is null).
	* elem - The main DOM element of the dialog.
* onsubmit(formdata, formelem, e) - An optional callback that is called when a form submission happens (Default is null).
	* formdata - An object containing all the field name/value pairs of submitted data including the button that was pressed.
	* formelem - A DOM element pointing to the form.
	* e - An event object containing the submit event.
* onclose() - An optional callback that is called when the dialog should close (Default is null).
* ondestroy() - An optional callback that is called when the dialog instance is destroyed (Default is null).
* langmap - An object containing translation strings.  Support exists for most of the user interface (Default is an empty object).

FlexForms.Dialog.settings
-------------------------

Category:  Settings

The `settings` object contains the settings for the instance.  Changing the settings after creating the instance will have little to no effect.

FlexForms.Dialog.addEventListener(eventname, callback)
------------------------------------------------------

Category:  Events

Parameters:

* eventname - A string containing a name of a FlexForms.Dialog event to listen to.
* callback - A function to call when the event fires.

Returns:  Nothing.

This function presents a familiar function for registering for custom events emitted by FlexForms.Dialog.

Known events:

* position - Dispatched when the dialog position or size changes.
* submit - Dispatched when a dialog submit button is pressed or the form is submitted.
* close - Dispatched when the dialog should close.
* destroy - Dispatched when the Destroy() function is called.

Most of these events have equivalents in the settings object and associated callbacks will automatically be registered as event listeners during initialization.

FlexForms.Dialog.removeEventListener(eventname, callback)
---------------------------------------------------------

Category:  Events

Parameters:

* eventname - A string containing a name of a FlexForms.Dialog event to stop listening to.
* callback - A function containing a registered callback to remove.

Returns:  Nothing.

This function presents a familiar function for unregistering from custom events emitted by FlexForms.Dialog.

FlexForms.Dialog.hasEventListener(eventname)
--------------------------------------------

Category:  Events

Parameters:

* eventname - A string containing a name of a FlexForms.Dialog event to check.

Returns:  A boolean of true if there are event listeners for the specified event, false otherwise.

This function checks for the existence of an event and whether or not there are any listeners registered for the event.

FlexForms.Dialog.HasErrors()
----------------------------

Category:  Forms

Parameters:  None.

Returns:  A boolean of true if there are keys set in the settings errors object, false otherwise.

This function determines whether or not the settings errors object has any keys set.  A useful helper function for handling complex dialog validation logic.

FlexForms.Dialog.UpdateContent()
--------------------------------

Category:  Forms

Parameters:  None.

Returns:  Nothing.

This function regenerates the FlexForms form and updates the dialog in-place.  Useful for emitting error messages after validating submitted information.

FlexForms.Dialog.GetElements()
------------------------------

Category:  Miscellaneous

Parameters:  None.

Returns:  The internal elems object for the widget.

This function returns the internal elements object.  While element keys are not likely to change, there is no guarantee as this is an internal structure.

FlexForms.Dialog.UpdateSizes()
------------------------------

Category:  Miscellaneous

Parameters:  None.

Returns:  Nothing.

This function adjusts the dialog and recalculates internal position and size tracking information.  Used by SnapToScreen() and CenterDialog().

FlexForms.Dialog.SnapToScreen()
-------------------------------

Category:  Position and Size

Parameters:  None.

Returns:  Nothing.

This function snaps the dialog so that it fits on the screen.  Generally only called if the dialog has been moved or resized.

FlexForms.Dialog.CenterDialog()
-------------------------------

Category:  Position and Size

Parameters:  None.

Returns:  Nothing.

This function moves the dialog to the center of the screen unless it has been manually moved or resized.

FlexForms.Dialog.Close()
------------------------

Category:  Closing

Parameters:  None.

Returns:  Nothing.

This function calls registered close callbacks for the dialog.

FlexForms.Dialog.Destroy()
--------------------------

Category:  Destructor

Parameters:  None.

Returns:  Nothing.

This function cleans up the DOM and destroys the instance.  Calling other functions after this function will result in an error or undefined behavior.

FlexForms.Dialog.Alert(title, content, closecallback, timeout)
--------------------------------------------------------------

Category:  Dialog

Parameters:

* title - A string containing a title.
* content - A string containing the message to display OR an object containing FlexForms.Generate() options.
* closecallback - An optional function to call upon closing the dialog.
* timeout - An optional integer containing the amount of time to display the dialog before automatically closing it.

Returns:  The FlexForms.Dialog instance that is created.

This helper function provides approximate equivalence to window.alert() to display a dialog title, message, and an OK button in a FlexForms.Dialog.

FlexForms.Dialog.Confirm(title, content, yesbutton, nobutton, yescallback, nocallback, closecallback)
-----------------------------------------------------------------------------------------------------

Category:  Dialog

Parameters:

* title - A string containing a title.
* content - A string containing the message to display OR an object containing FlexForms.Generate() options.
* yesbutton - A string containing the text of the "Yes/OK" button.  This is the default button clicked when pressing Enter/Return.
* nobutton - A string containing the text of the "No/Cancel" button.
* yescallback - An optional function to call when the "Yes/OK" button is clicked.  Can be the same as the other callbacks.
* nocallback - An optional function to call when the "No/Cancel" button is clicked.  Can be the same as the other callbacks.
* closecallback - An optional function to call when the close button is clicked.  Can be the same as the other callbacks.

Returns:  The FlexForms.Dialog instance that is created.

This helper function provides approximate equivalence to window.confirm() to display a dialog title, message, and Yes/No buttons in a FlexForms.Dialog.

Each callback receives a type parameter as follows:

* -1 - The close button was clicked.
* 0 - The No/Cancel button was clicked.
* 1 - The Yes/OK button was clicked.
