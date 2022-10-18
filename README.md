FlexForms for Javascript
========================

FlexForms is a powerful HTML forms generator/builder class to output HTML forms using JSON-style arrays.  FlexForms.Dialog adds a moveable, resizeable, modal dialog to FlexForms.  Choose from a MIT or LGPL license.

This is a port of [FlexForms for PHP](https://github.com/cubiclesoft/php-flexforms).  The same FlexForms but now for client-side Javascript.

[![FlexForms Dialog](https://user-images.githubusercontent.com/1432111/89797915-6299d680-dae0-11ea-93a7-0863780635ef.png)](https://cubiclesoft.com/demos/js-flexforms/demo.html)

[Live demo](https://cubiclesoft.com/demos/js-flexforms/demo.html)

[![Donate](https://cubiclesoft.com/res/donate-shield.png)](https://cubiclesoft.com/donate/) [![Discord](https://img.shields.io/discord/777282089980526602?label=chat&logo=discord)](https://cubiclesoft.com/product-support/github/)

Features
--------

* Simplifies HTML forms and eliminates error-prone, hand-crafted HTML form code for 99% of all use-cases.
* Supports per-field custom HTML output for the remaining 1% of use-cases.
* Automatic dependency chains for both external and inline CSS and Javascript.
* Per-field error message support.
* Highly extensible.
* AJAX-ready.
* FlexForms.Dialog for clean, easy presentation of in-page forms and data processing.
* FlexForms.Dialog.Alert() and FlexForms.Dialog.Confirm() dialogs to replace window.alert() and window.confirm() respectively.
* Has a liberal open source license.  MIT or LGPL, your choice.
* Designed for relatively painless integration into your project.
* Sits on GitHub for all of that pull request and issue tracker goodness to easily submit changes and ideas respectively.

Getting Started
---------------

The most common use-case is to use the FlexForms.Dialog class to generate and display a form in a dialog like this:

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

	window.MainDialog = function() {
		var dlg = FlexForms.Dialog(document.body, options);

		return false;
	};

	window.TempAlertDialog = function() {
		FlexForms.Dialog.Alert('An Error Occurred', 'Woah!  An unexpected error occurred.  Try again later.', function() { console.log('Closed'); }, 10000);

		return false;
	};

	window.ConfirmDeleteDialog = function() {
		var DeleteContentCallback = function(type) {
console.log(type);
		};

		FlexForms.Dialog.Confirm('Delete Content', 'Are you sure you want to delete the content?', 'Yes', 'No', DeleteContentCallback, DeleteContentCallback);

		return false;
	};
})();
</script>

<p><a href="#" onclick="return MainDialog();">Display a FlexForms.Dialog()</a></p>
<p><a href="#" onclick="return TempAlertDialog();">Display a FlexForms.Dialog.Alert() for 10 seconds</a></p>
<p><a href="#" onclick="return ConfirmDeleteDialog();">Display a FlexForms.Dialog.Confirm()</a></p>
```

Projects
--------

Here are a couple of projects that use FlexForms:

* [Offline Forms](https://github.com/cubiclesoft/offline-forms) - A pure client side form designer and data gathering tool for use in areas with spotty or unknown Internet connectivity.
* [PHP File Manager](https://github.com/cubiclesoft/php-filemanager) - A powerful uploader tool and file manager built specifically for the purpose of embedding into any application out of the box.

Documentation
-------------

* [FlexForms and FlexForms.Designer](docs/flex_forms.md) - Example usage of using FlexForms by itself plus documentation.
* [FlexForms.Dialog](docs/flex_forms_dialog.md) - Detailed documentation of various FlexForms.Dialog options.
