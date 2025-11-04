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
* autowidth - An optional string containing the CSS width to size the dialog to (Default is null).
* title - A string containing a title to use for the title bar of the dialog (Default is '').
* content - An object containing FlexForms.Generate() options (Default is an empty object).
* errors - An object containing FlexForms.Generate() errors (Default is an empty object).
* request - An object containing FlexForms.Generate() request variables (Default is an empty object).
* onupdatecontent(formelem) - An optional callback that is called whenever the dialog form content is updated (Default is null).
	* formelem - A DOM element pointing to the form.
* onsuspend() - An optional callback that is called when the dialog is suspended by a modal dialog (Default is null).
* onresume() - An optional callback that is called when the dialog is resumed after having been previously suspended (Default is null).
* onposition(elem) - An optional callback that is called whenever the position or size of the dialog has changed (Default is null).
	* elem - The main DOM element of the dialog.
* onlockresize() - An optional callback that is called when resizing is temporarily locked via LockResize() (Default is null).
* onunlockresize() - An optional callback that is called when resizing is resumed via UnlockResize() (Default is null).
* onresized(elem) - An optional callback that is called when the dialog has been resized (Default is null).
	* elem - The main DOM element of the dialog.
* onsubmit(formdata, formelem, e, lastactiveelem) - An optional callback that is called when a form submission happens (Default is null).
	* formdata - An object containing all the field name/value pairs of submitted data including the button that was pressed.
	* formelem - A DOM element pointing to the form.
	* e - An event object containing the submit event.
	* lastactiveelem - A DOM element pointing to the last active element before the dialog was created.
* onclose() - An optional callback that is called when the dialog should close (Default is null).
* ondestroy() - An optional callback that is called when the dialog instance is destroyed (Default is null).
* langmap - An object containing translation strings.  Support exists for most of the user interface (Default is an empty object).

FlexForms.Dialog.settings
-------------------------

Category:  Settings

The `settings` object contains the settings for the instance.  Changing the settings after creating the instance will have little to no effect.

FlexForms.Dialog.GetID()
------------------------

Category:  Informational

Parameters:  None.

Returns:  The unique integer ID of the FlexForms Dialog.

This function returns the ID of the dialog.

FlexForms.Dialog.addEventListener(eventname, callback)
------------------------------------------------------

Category:  Events

Parameters:

* eventname - A string containing a name of a FlexForms.Dialog event to listen to.
* callback - A function to call when the event fires.

Returns:  Nothing.

This function presents a familiar function for registering for custom events emitted by FlexForms.Dialog.

Known events:

* updatecontent - Dispatched when the dialog content is updated via FlexForms.Dialog.UpdateContent().
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

FlexForms.Dialog.GetFlexFormsObjects()
--------------------------------------

Category:  Modules

Parameters:  None.

Returns:  An array of FlexForms objects.

This function returns the FlexForms objects created by modules during UpdateContent().

FlexForms.Dialog.GetElements()
------------------------------

Category:  Miscellaneous

Parameters:  None.

Returns:  The internal elems object for the widget.

This function returns the internal elements object.  While element keys are not likely to change, there is no guarantee as this is an internal structure.

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

FlexForms.Dialog.Suspend()
--------------------------

Category:  Miscellaneous

Parameters:  None.

Returns:  Nothing.

This function suspends the dialog and detaches it from the DOM (but NOT the modal overlay) until it is resumed later.  Multiple calls increase the refcount.  Automatically called when creating a new modal dialog.

FlexForms.Dialog.Resume()
-------------------------

Category:  Miscellaneous

Parameters:  None.

Returns:  Nothing.

This function attaches the dialog to the DOM and resumes it if it is suspended.  Multiple calls decrease the refcount until it reaches zero.  Automatically called when closing a modal dialog that previously suspended the dialog.

FlexForms.Dialog.IsSuspended()
------------------------------

Category:  Miscellaneous

Parameters:  None.

Returns:  An integer containing whether or not the dialog is suspended.

This function returns whether or not the dialog is suspended.

FlexForms.Dialog.LockResize(name)
---------------------------------

Category:  Position and Size

Parameters:

* name - A string containing the name of the lock requestor.

Returns:  Nothing.

This function locks automatic resizing of the dialog until all locks have been released.  The 'name' parameter allows each holder of a resize lock to independently do reference counting.  Multiple calls with the same name increase the refcount.  Primarily used by FlexForms modules.

FlexForms.Dialog.UnlockResize(name)
-----------------------------------

Category:  Position and Size

Parameters:

* name - A string containing the name of the lock requestor.

Returns:  Nothing.

This function unlocks a previously obtained lock on dialog resizing.  Multiple calls with the same name decrease the refcount until it reaches zero.  Once all locks have been removed, any resizing operations that were queued during the lock(s) are then run.

FlexForms.Dialog.UpdateSizes()
------------------------------

Category:  Miscellaneous

Parameters:  None.

Returns:  Nothing.

This function adjusts the dialog and recalculates internal position and size tracking information.  Used by SnapToScreen() and CenterDialog().  Limited to one call per animation frame.

FlexForms.Dialog.SnapToScreen(resetscroll)
------------------------------------------

Category:  Position and Size

Parameters:

* resetscroll - An optional boolean that specifies whether or not to scroll to the top.

Returns:  Nothing.

This function snaps the dialog so that it fits on the screen.  Generally only called if the dialog has been moved or resized.

FlexForms.Dialog.CenterDialog(resetscroll)
------------------------------------------

Category:  Position and Size

Parameters:

* resetscroll - An optional boolean that specifies whether or not to scroll to the top.

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
