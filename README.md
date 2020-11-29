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
						{ name: 'Test 1', value: 'Test 1' },
						{ name: 'Test 2', value: 'Test 2' },
						{ name: 'Test 3', value: 'Test 3' },
					],
					default: { 'Test 1': true, 'Test 3': true }
				}
			],
			submit: ['OK', 'Cancel'],
			submitname: 'test_submit'
		},

		onsubmit: function(formvars, formnode, e) {
console.log(formvars);

			this.Destroy();
		},

		onclose: function() {
console.log('Close');

			this.Destroy();
		}
	};

	var dlg = FlexForms.Dialog(document.body, options);
})();
</script>
```

Documentation
-------------

* [FlexForms and FlexForms.Designer](docs/flex_forms.md) - Example usage of using FlexForms by itself plus documentation.
* [FlexForms.Dialog](docs/flex_forms_dialog.md) - Detailed documentation of various FlexForms.Dialog options.
