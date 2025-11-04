// FlexForms Javascript Dialog class.
// (C) 2025 CubicleSoft.  All Rights Reserved.

(function() {
	if (!window.hasOwnProperty('FlexForms') || !window.FlexForms.hasOwnProperty('Designer'))
	{
		console.error('[FlexForms.Dialog] Error:  FlexForms and FlexForms.Designer must be loaded before FlexForms.Dialog.');

		return;
	}

	if (window.FlexForms.hasOwnProperty('Dialog'))  return;

	var EscapeHTML = window.FlexForms.EscapeHTML;
	var FormatStr = window.FlexForms.FormatStr;
	var CreateNode = window.FlexForms.CreateNode;
	var DebounceAttributes = window.FlexForms.DebounceAttributes;
	var Translate = window.FlexForms.Translate;

	var dialogs = {};
	var nextid = 1;

	var DialogInternal = function(parentelem, options) {
		if (!(this instanceof DialogInternal))  return new DialogInternal(parentelem, options);

		var id, triggers = {}, loaded = false, suspended = 0, suspendeddialogs = [];
		var $this = this;

		id = nextid;
		nextid++;
		dialogs[id] = $this;

		var defaults = {
			modal: true,
			backgroundcloses: false,
			move: true,
			resize: true,

			autowidth: null,

			title: '',
			content: {},
			errors: {},
			request: {},

			onupdatecontent: null,
			onsuspend: null,
			onresume: null,
			onposition: null,
			onlockresize: null,
			onunlockresize: null,
			onresized: null,
			onsubmit: null,
			onclose: null,
			ondestroy: null,

			langmap: {}
		};

		$this.settings = Object.assign({}, defaults, options);

		Object.assign(window.FlexForms.settings.langmap, $this.settings.langmap);

		// Returns the dialog ID.
		$this.GetID = function() {
			return id;
		};

		// Internal functions.
		var DispatchEvent = function(eventname, params) {
			if (!triggers[eventname])  return;

			triggers[eventname].forEach(function(callback) {
				if (Array.isArray(params))  callback.apply($this, params);
				else  callback.call($this, params);
			});
		};

		// Public DOM-style functions.
		$this.addEventListener = function(eventname, callback) {
			if (!triggers[eventname])  triggers[eventname] = [];

			for (var x in triggers[eventname])
			{
				if (triggers[eventname][x] === callback)  return;
			}

			triggers[eventname].push(callback);
		};

		$this.removeEventListener = function(eventname, callback) {
			if (!triggers[eventname])  return;

			for (var x in triggers[eventname])
			{
				if (triggers[eventname][x] === callback)
				{
					triggers[eventname].splice(x, 1);

					return;
				}
			}
		};

		$this.hasEventListener = function(eventname) {
			return (triggers[eventname] && triggers[eventname].length);
		};

		// Register settings callbacks.
		if ($this.settings.onupdatecontent)  $this.addEventListener('updatecontent', $this.settings.onupdatecontent);
		if ($this.settings.onsuspend)  $this.addEventListener('suspend', $this.settings.onsuspend);
		if ($this.settings.onresume)  $this.addEventListener('resume', $this.settings.onresume);
		if ($this.settings.onposition)  $this.addEventListener('position', $this.settings.onposition);
		if ($this.settings.onlockresize)  $this.addEventListener('lock_resize', $this.settings.onlockresize);
		if ($this.settings.onunlockresize)  $this.addEventListener('unlock_resize', $this.settings.onunlockresize);
		if ($this.settings.onresized)  $this.addEventListener('resized', $this.settings.onresized);
		if ($this.settings.onsubmit)  $this.addEventListener('submit', $this.settings.onsubmit);
		if ($this.settings.onclose)  $this.addEventListener('close', $this.settings.onclose);
		if ($this.settings.ondestroy)  $this.addEventListener('destroy', $this.settings.ondestroy);

		var elems = {
			mainwrap: CreateNode('div', ['ff_dialogwrap'], { tabIndex: 0 }, { position: 'fixed', left: '-9999px' }),
			resizer: CreateNode('div', ['ff_dialog_resizer']),
			measureemsize: CreateNode('div', ['ff_dialog_measure_em_size']),
			innerwrap: CreateNode('div', ['ff_dialog_innerwrap']),

			titlewrap: CreateNode('div', ['ff_dialog_titlewrap']),
			title: CreateNode('div', ['ff_dialog_title']),
			closebutton: CreateNode('button', ['ff_dialog_close'], { title: Translate('Close') }),

			overlay: CreateNode('div', ['ff_dialog_overlay']),

			formwrap: null
		};

		elems.title.innerHTML = EscapeHTML(Translate($this.settings.title));

		elems.titlewrap.appendChild(elems.title);
		if ($this.settings.onclose || $this.settings.backgroundcloses)  elems.titlewrap.appendChild(elems.closebutton);
		elems.innerwrap.appendChild(elems.titlewrap);

		if ($this.settings.resize)  elems.mainwrap.appendChild(elems.resizer);
		elems.mainwrap.appendChild(elems.measureemsize);
		elems.mainwrap.appendChild(elems.innerwrap);

		// FlexForms objects created by modules.
		var ffobjs = [];
		$this.GetFlexFormsObjects = function() {
			return ffobjs;
		};

		// Handle submit buttons.
		var SubmitHandler = function(e) {
			if (!e.isTrusted)  return;

			e.preventDefault();

			// Save FlexForms object state changes.
			FlexForms.Save(ffobjs);

			$this.settings.request = FlexForms.GetFormVars(elems.formnode, e);

			DispatchEvent('submit', [$this.settings.request, elems.formnode, e, lastactiveelem]);
		};

		// Returns the internal elements object for easier access to various elements.
		$this.GetElements = function() {
			return elems;
		};

		// Useful helper function to return whether or not the errors object contains errors.
		$this.HasErrors = function() {
			return (Object.keys($this.settings.errors).length > 0);
		};

		// Regenerate and append the form.
		$this.UpdateContent = function() {
			if (elems.formwrap)  elems.formwrap.parentNode.removeChild(elems.formwrap);

			elems.formwrap = FlexForms.Generate(elems.innerwrap, $this.settings.content, $this.settings.errors, $this.settings.request, ffobjs);
			elems.formnode = elems.formwrap.querySelector('form');

			if (elems.formnode)  elems.formnode.addEventListener('submit', SubmitHandler);

			// Attach this dialog to FlexForms objects.
			for (var x = 0; x < ffobjs.length; x++)
			{
				if (typeof ffobjs[x].SetDialog === 'function')  ffobjs[x].SetDialog.call($this, $this);
			}

			DispatchEvent('updatecontent', elems.formnode);
		};

		if ($this.settings.modal)  parentelem.appendChild(elems.overlay);
		parentelem.appendChild(elems.mainwrap);

		// Set up focusing rules.
		var lastactiveelem = document.activeElement;
		var hasfocus = false;

		var MainWrapMouseBlurHandler = function(e) {
			if (!e.isTrusted)  return;

			var node = e.target;
			while (node && node !== elems.mainwrap && node !== elems.overlay && node.parentNode !== parentelem)  node = node.parentNode;

			if (node && node !== elems.mainwrap && node !== elems.overlay)
			{
				var node2 = elems.mainwrap.nextSibling;

				while (node2 && node2 !== node)  node2 = node2.nextSibling;

				if (node2 === node)  node = elems.mainwrap;
			}

			if (node === elems.mainwrap)  elems.mainwrap.classList.add('ff_dialog_focused');
			else
			{
				if ($this.settings.modal)
				{
					if (node !== elems.overlay)  hasfocus = false;

					e.preventDefault();

					elems.mainwrap.focus();
				}
				else
				{
					elems.mainwrap.classList.remove('ff_dialog_focused');

					if (hasfocus && $this.settings.backgroundcloses)
					{
						lastactiveelem = e.target;

						$this.Close();
					}

					hasfocus = false;
				}
			}
		};

		window.addEventListener('mousedown', MainWrapMouseBlurHandler, true);

		// Trigger window blur visual appearance changes.
		var MainWrapWindowBlurHandler = function(e) {
			if (e.target === window || e.target === document)  elems.mainwrap.classList.remove('ff_dialog_focused');
		};

		window.addEventListener('blur', MainWrapWindowBlurHandler, true);

		var MainWrapFocusHandler = function(e) {
			// Handle window-level focus events specially.  There will be another focus event if actually focused.
			if (!$this.settings.modal && (e.target === window || e.target === document))
			{
				var node = document.activeElement;
				while (node && node !== elems.mainwrap)  node = node.parentNode;

				if (node === elems.mainwrap)  elems.mainwrap.classList.add('ff_dialog_focused');

				return;
			}

			var node = e.target;
			while (node && node !== elems.mainwrap && node.parentNode !== parentelem)  node = node.parentNode;

			if (node === elems.mainwrap)
			{
				elems.mainwrap.classList.add('ff_dialog_focused');

				// Move this dialog to the top of the stack.
				if (!hasfocus && !$this.settings.modal)
				{
					window.removeEventListener('focus', MainWrapFocusHandler, true);

					lastactiveelem.focus();

					parentelem.appendChild(elems.mainwrap);

					elems.mainwrap.focus();

					window.addEventListener('focus', MainWrapFocusHandler, true);
				}

				hasfocus = true;
			}
			else if ($this.settings.modal)
			{
				if (node && node !== elems.mainwrap)
				{
					var node2 = elems.mainwrap.nextSibling;

					while (node2 && node2 !== node)  node2 = node2.nextSibling;

					if (node2 === node)  node = elems.mainwrap;
				}

				if (node !== elems.mainwrap)  elems.mainwrap.focus();
			}
			else
			{
				elems.mainwrap.classList.remove('ff_dialog_focused');

				hasfocus = false;
			}
		};

		window.addEventListener('focus', MainWrapFocusHandler, true);

		// Detaches the dialog from the DOM and any associated event handlers.
		// The modal overlay, if attached, remains as the main intent of Suspend() is to allow other modal/non-modal dialogs to function.
		$this.Suspend = function() {
			if (!suspended)
			{
				window.removeEventListener('focus', MainWrapFocusHandler, true);
				window.removeEventListener('mousedown', MainWrapMouseBlurHandler, true);
				window.removeEventListener('blur', MainWrapWindowBlurHandler, true);
				window.removeEventListener('focus', MainWrapFocusHandler, true);

				window.removeEventListener('resize', dialogresizewatch.Start, true);

				parentelem.removeChild(elems.mainwrap);

				DispatchEvent('suspend');
			}

			suspended++;
		};

		// Attaches the dialog to the DOM and restores associated event handlers.
		$this.Resume = function() {
			if (suspended > 0)
			{
				suspended--;

				if (!suspended)
				{
					parentelem.appendChild(elems.mainwrap);

					window.addEventListener('focus', MainWrapFocusHandler, true);
					window.addEventListener('mousedown', MainWrapMouseBlurHandler, true);
					window.addEventListener('blur', MainWrapWindowBlurHandler, true);
					window.addEventListener('focus', MainWrapFocusHandler, true);

					window.addEventListener('resize', dialogresizewatch.Start, true);

					if (loaded)  $this.CenterDialog();
					else  LoadedHandler();

					DispatchEvent('resume');
				}
			}
		};

		// Returns whether or not this dialog is suspended.
		$this.IsSuspended = function() {
			return suspended;
		};

		// Some internal tracking variables to control dialog position and size.
		var manualsize = false, manualmove = false, resizelocked = 0, resizelockmap = {}, postunlockcallbacks = {};
		var updatesizesframe = null, screenwidth, screenheight, currdialogstyle, dialogwidth, dialogheight;

		$this.LockResize = function(name) {
			if (!resizelocked)  DispatchEvent('lock_resize');

			resizelocked++;

			if (!resizelockmap.hasOwnProperty(name))  resizelockmap[name] = 1;
			else  resizelockmap[name]++;
		};

		$this.UnlockResize = function(name) {
			if (!resizelockmap.hasOwnProperty(name))  return;

			resizelockmap[name]--;

			if (!resizelockmap[name])  delete resizelockmap[name];

			if (resizelocked > 0)
			{
				resizelocked--;

				if (!resizelocked)
				{
					DispatchEvent('unlock_resize');

					for (var x in postunlockcallbacks)
					{
						if (postunlockcallbacks.hasOwnProperty(x))  postunlockcallbacks[x].call($this);
					}

					postunlockcallbacks = {};
				}
			}
		};

		var ResetUpdateSizesFrame = function() {
			updatesizesframe = null;
		};

		// Adjust the dialog and recalculate size information.  Limited to one call per frame.
		$this.UpdateSizes = function() {
			if (resizelocked > 0)
			{
				postunlockcallbacks['UpdateSizes'] = $this.UpdateSizes;

				return;
			}

			if (updatesizesframe !== null)  return;

			updatesizesframe = window.requestAnimationFrame(ResetUpdateSizesFrame);

			elems.mainwrap.classList.remove('ff_dialogwrap_small');

			screenwidth = (document.documentElement.clientWidth || document.body.clientWidth || window.innerWidth);
			screenheight = (document.documentElement.clientHeight || document.body.clientHeight || window.innerHeight);

			elems.innerwrap.style.maxHeight = null;

			if (!manualsize)
			{
				elems.mainwrap.style.width = $this.settings.autowidth;
				elems.mainwrap.style.height = null;
			}

			currdialogstyle = elems.mainwrap.currentStyle || window.getComputedStyle(elems.mainwrap);
			dialogwidth = Math.ceil(elems.mainwrap.offsetWidth + parseFloat(currdialogstyle.marginLeft) + parseFloat(currdialogstyle.marginRight));

			if (!manualsize && dialogwidth + 2 >= screenwidth)
			{
				elems.mainwrap.style.width = Math.ceil(screenwidth - parseFloat(currdialogstyle.marginLeft) - parseFloat(currdialogstyle.marginRight) - 2) + 'px';

				dialogwidth = screenwidth - 2;
			}

			if (elems.mainwrap.offsetWidth / elems.measureemsize.offsetWidth < 27)  elems.mainwrap.classList.add('ff_dialogwrap_small');

			currdialogstyle = elems.mainwrap.currentStyle || window.getComputedStyle(elems.mainwrap);
			dialogheight = Math.ceil(elems.mainwrap.offsetHeight + parseFloat(currdialogstyle.marginTop) + parseFloat(currdialogstyle.marginBottom));

			if (!manualsize && dialogheight + 2 >= screenheight)
			{
				elems.mainwrap.style.height = Math.ceil(screenheight - parseFloat(currdialogstyle.marginTop) - parseFloat(currdialogstyle.marginBottom) - 2) + 'px';

				dialogheight = screenheight - 2;
			}
		};

		// Snaps the dialog so it fits on the screen.  Limited to one call per frame.
		$this.SnapToScreen = function(resetscroll) {
			if (resizelocked > 0)
			{
				postunlockcallbacks['SnapToScreen'] = $this.SnapToScreen;

				return;
			}

			if (updatesizesframe !== null)  return;

			var formfieldsnode = (elems.formnode ? elems.formnode.querySelector('.formfields') : null);
			var currscrolltop = (!resetscroll && formfieldsnode ? formfieldsnode.scrollTop : 0);
			var currleft = Math.floor(elems.mainwrap.offsetLeft - parseFloat(currdialogstyle.marginLeft));
			var currtop = Math.floor(elems.mainwrap.offsetTop - parseFloat(currdialogstyle.marginTop));

			elems.mainwrap.style.left = '0px';
			elems.mainwrap.style.top = '0px';

			$this.UpdateSizes();

			if (currleft < 0)  currleft = 0;
			if (currtop < 0)  currtop = 0;
			if (currleft + dialogwidth >= screenwidth)  currleft = screenwidth - dialogwidth;
			if (currtop + dialogheight >= screenheight)  currtop = screenheight - dialogheight;

			elems.mainwrap.style.left = currleft + 'px';
			elems.mainwrap.style.top = currtop + 'px';
			if (manualsize)  elems.mainwrap.style.height = Math.ceil(dialogheight - parseFloat(currdialogstyle.marginTop) - parseFloat(currdialogstyle.marginBottom)) + 'px';
			else  elems.innerwrap.style.maxHeight = Math.ceil(Math.min(parseFloat(currdialogstyle.maxHeight), screenheight - currtop - parseFloat(currdialogstyle.marginTop) - parseFloat(currdialogstyle.marginBottom))) + 'px';

			if (formfieldsnode)  formfieldsnode.scrollTop = currscrolltop;

			DispatchEvent('position', elems.mainwrap);
		};

		// Move the dialog to the center of the screen unless it has been manually moved.  Limited to one call per frame.
		$this.CenterDialog = function(resetscroll) {
			if (resizelocked > 0)
			{
				postunlockcallbacks['CenterDialog'] = $this.CenterDialog;

				return;
			}

			if (updatesizesframe !== null)  return;

			if (manualmove)  $this.SnapToScreen(resetscroll);
			else
			{
				var formfieldsnode = (elems.formnode ? elems.formnode.querySelector('.formfields') : null);
				var currscrolltop = (!resetscroll && formfieldsnode ? formfieldsnode.scrollTop : 0);

				$this.UpdateSizes();

				var currleft = Math.floor((screenwidth / 2) - (dialogwidth / 2));
				var currtop = Math.floor((screenheight / 2) - (dialogheight / 2));

				elems.mainwrap.style.left = currleft + 'px';
				elems.mainwrap.style.top = currtop + 'px';
				elems.innerwrap.style.maxHeight = Math.min(parseFloat(currdialogstyle.maxHeight), screenheight - currtop - parseFloat(currdialogstyle.marginTop) - parseFloat(currdialogstyle.marginBottom) - 2) + 'px';

				if (formfieldsnode)  formfieldsnode.scrollTop = currscrolltop;

				DispatchEvent('position', elems.mainwrap);
				DispatchEvent('resized', elems.mainwrap);
			}
		};

		var moveanchorpos = null, resizeclass, resizelocation, resizeanchorpos = null;

		// Set up an offsetWidth/offsetHeight attribute watcher that calls CenterDialog().
		var dialogresizewatch = new DebounceAttributes({
			watchers: [
				{ elem: elems.mainwrap, attr: 'offsetWidth', val: -1 },
				{ elem: elems.mainwrap, attr: 'offsetHeight', val: -1 }
			],
			interval: 50,
			stopsame: 5,
			callback: $this.CenterDialog,
			intervalcallback: $this.CenterDialog
		});

		window.addEventListener('resize', dialogresizewatch.Start, true);

		// Monitor resizing of the main element.
		var MainWrapResizeHandler = function(e) {
			if (updatesizesframe === null && dialogresizewatch && moveanchorpos === null && resizeanchorpos === null && elems.mainwrap.offsetHeight !== dialogresizewatch.settings.watchers[1].val)
			{
				dialogresizewatch.Start();
			}
		};

		var mainwrapresizeobserver = new ResizeObserver(MainWrapResizeHandler);

		mainwrapresizeobserver.observe(elems.mainwrap);

		var LoadedFocus = function() {
			if (updatesizesframe === null)
			{
				$this.CenterDialog();

				elems.mainwrap.classList.add('ff_dialog_focused');

				// Bypass the hasfocus checks in MainWrapFocusHandler.
				hasfocus = true;

				var node = document.activeElement;
				while (node && node !== elems.mainwrap)  node = node.parentNode;

				if (node !== elems.mainwrap)  elems.mainwrap.focus();
			}
		};

		var LoadedHandler = function() {
			if (!loaded && !suspended)
			{
				window.FlexForms.removeEventListener('done', LoadedHandler);

				// Suspend other dialogs that would cause conflicts.
				if ($this.settings.modal)
				{
					for (var x in dialogs)
					{
						if ($this !== dialogs[x])
						{
							dialogs[x].Suspend();

							suspendeddialogs.push(x);
						}
					}
				}
				else
				{
					for (var x in dialogs)
					{
						if ($this !== dialogs[x] && dialogs[x].settings.modal)
						{
							dialogs[x].Suspend();

							suspendeddialogs.push(x);
						}
					}
				}

				LoadedFocus();

				loaded = true;
			}
		};

		window.FlexForms.addEventListener('done', LoadedHandler);

		// Manual move.
		var MoveDialogDragHandler = function(e) {
			if (!e.isTrusted)  return;

			var newanchorpos;
			var rect = elems.title.getBoundingClientRect();

			if (e.type === 'touchmove')
			{
				newanchorpos = {
					x: e.touches[0].clientX - rect.left,
					y: e.touches[0].clientY - rect.top
				};
			}
			else
			{
				// Prevent content selections.
				e.preventDefault();

				newanchorpos = {
					x: e.clientX - rect.left,
					y: e.clientY - rect.top
				};
			}

			var newleft = Math.floor(elems.mainwrap.offsetLeft - parseFloat(currdialogstyle.marginLeft) + newanchorpos.x - moveanchorpos.x);
			var newtop = Math.floor(elems.mainwrap.offsetTop - parseFloat(currdialogstyle.marginTop) + newanchorpos.y - moveanchorpos.y);

			if (newleft < 0)  newleft = 0;
			if (newtop < 0)  newtop = 0;
			if (newleft + dialogwidth >= screenwidth)  newleft = screenwidth - dialogwidth;
			if (newtop + dialogheight >= screenheight)  newtop = screenheight - dialogheight;

			elems.mainwrap.style.left = newleft + 'px';
			elems.mainwrap.style.top = newtop + 'px';

			manualmove = true;

			DispatchEvent('position', elems.mainwrap);
		};

		var MoveDialogEndHandler = function(e) {
			if (e && !e.isTrusted)  return;

			if (e)  $this.CenterDialog();

			moveanchorpos = null;

			window.removeEventListener('touchmove', MoveDialogDragHandler, true);
			window.removeEventListener('touchend', MoveDialogEndHandler, true);
			window.removeEventListener('mousemove', MoveDialogDragHandler, true);
			window.removeEventListener('mouseup', MoveDialogEndHandler, true);
			window.removeEventListener('blur', MoveDialogEndHandler, true);
		};

		var StartMoveDialogHandler = function(e) {
			if (!e.isTrusted)  return;

			// Disallow scrolling on touch and block drag-and-drop.
			e.preventDefault();

			$this.CenterDialog();

			var rect = elems.title.getBoundingClientRect();

			if (e.type === 'touchstart')
			{
				moveanchorpos = {
					x: e.touches[0].clientX - rect.left,
					y: e.touches[0].clientY - rect.top
				};

				window.addEventListener('touchmove', MoveDialogDragHandler, true);
				window.addEventListener('touchend', MoveDialogEndHandler, true);
			}
			else
			{
				moveanchorpos = {
					x: e.clientX - rect.left,
					y: e.clientY - rect.top
				};

				window.addEventListener('mousemove', MoveDialogDragHandler, true);
				window.addEventListener('mouseup', MoveDialogEndHandler, true);
			}

			window.addEventListener('blur', MoveDialogEndHandler, true);
		};

		elems.title.addEventListener('mousedown', StartMoveDialogHandler);
		elems.title.addEventListener('touchstart', StartMoveDialogHandler);

		// Manual resize.
		var UpdateResizeHoverClass = function(e) {
			if (!e.isTrusted || resizeanchorpos)  return;

			var rect = elems.mainwrap.getBoundingClientRect();
			var currpos, newresizeclass;

			if (e.type === 'touchstart')
			{
				currpos = {
					x: e.touches[0].clientX,
					y: e.touches[0].clientY
				};
			}
			else
			{
				currpos = {
					x: e.clientX,
					y: e.clientY
				};
			}

			if (currpos.y < rect.top + elems.measureemsize.offsetWidth)
			{
				if (currpos.x < rect.left + elems.measureemsize.offsetWidth)  { newresizeclass = 'ff_dialog_resize_nwse'; resizelocation = 1; }
				else if (currpos.x >= rect.right - elems.measureemsize.offsetWidth)  { newresizeclass = 'ff_dialog_resize_nesw'; resizelocation = 3; }
				else  { newresizeclass = 'ff_dialog_resize_ns'; resizelocation = 2; }
			}
			else if (currpos.y >= rect.bottom - elems.measureemsize.offsetWidth)
			{
				if (currpos.x < rect.left + elems.measureemsize.offsetWidth)  { newresizeclass = 'ff_dialog_resize_nesw'; resizelocation = 6; }
				else if (currpos.x >= rect.right - elems.measureemsize.offsetWidth)  { newresizeclass = 'ff_dialog_resize_nwse'; resizelocation = 8; }
				else  { newresizeclass = 'ff_dialog_resize_ns'; resizelocation = 7; }
			}
			else
			{
				if (currpos.x < rect.left)  { newresizeclass = 'ff_dialog_resize_ew'; resizelocation = 4; }
				else  { newresizeclass = 'ff_dialog_resize_ew'; resizelocation = 5; }
			}

			if (newresizeclass !== resizeclass)
			{
				elems.resizer.className = 'ff_dialog_resizer ' + newresizeclass;

				resizeclass = newresizeclass;
			}
		};

		elems.resizer.addEventListener('mousemove', UpdateResizeHoverClass);

		var ResizeDialogDragHandler = function(e) {
			if (!e.isTrusted)  return;

			var newanchorpos;
			var rect = elems.resizer.getBoundingClientRect();

			if (e.type === 'touchmove')
			{
				newanchorpos = {
					x: e.touches[0].clientX - rect.left,
					y: e.touches[0].clientY - rect.top
				};
			}
			else
			{
				// Prevent content selections.
				e.preventDefault();

				newanchorpos = {
					x: e.clientX - rect.left,
					y: e.clientY - rect.top
				};
			}

			var newleft = elems.mainwrap.offsetLeft - parseFloat(currdialogstyle.marginLeft);
			var newtop = elems.mainwrap.offsetTop - parseFloat(currdialogstyle.marginTop);
			var newwidth = elems.mainwrap.offsetWidth;
			var newheight = elems.mainwrap.offsetHeight;
			var diffx = newanchorpos.x - resizeanchorpos.x;
			var diffy = newanchorpos.y - resizeanchorpos.y;

			// 1 2 3
			// 4   5
			// 6 7 8
			if (resizelocation === 1 || resizelocation === 4 || resizelocation === 6)
			{
				if (newwidth - diffx >= parseFloat(currdialogstyle.maxWidth))  diffx = newwidth - parseFloat(currdialogstyle.maxWidth);
				else if (newleft + diffx < 0)  diffx = -newleft;
				else if (newwidth - diffx < parseFloat(currdialogstyle.minWidth))  diffx = newwidth - parseFloat(currdialogstyle.minWidth);

				newleft += diffx;
				newwidth -= diffx;
			}

			if (resizelocation === 3 || resizelocation === 5 || resizelocation === 8)
			{
				if (resizeanchorpos.width + diffx >= parseFloat(currdialogstyle.maxWidth))  diffx = parseFloat(currdialogstyle.maxWidth) - resizeanchorpos.width;
				else if (newleft + resizeanchorpos.width + parseFloat(currdialogstyle.marginLeft) + parseFloat(currdialogstyle.marginRight) + diffx >= screenwidth)  diffx = screenwidth - newleft - resizeanchorpos.width - parseFloat(currdialogstyle.marginLeft) - parseFloat(currdialogstyle.marginRight);
				else if (resizeanchorpos.width + diffx < parseFloat(currdialogstyle.minWidth))  diffx = parseFloat(currdialogstyle.minWidth) - resizeanchorpos.width;

				newwidth = resizeanchorpos.width + diffx;
			}

			if (resizelocation === 1 || resizelocation === 2 || resizelocation === 3)
			{
				if (newheight - diffy >= parseFloat(currdialogstyle.maxHeight))  diffy = newheight - parseFloat(currdialogstyle.maxHeight);
				else if (newtop + diffy < 0)  diffy = -newtop;
				else if (newheight - diffy < parseFloat(currdialogstyle.minHeight))  diffy = newheight - parseFloat(currdialogstyle.minHeight);

				newtop += diffy;
				newheight -= diffy;
			}

			if (resizelocation === 6 || resizelocation === 7 || resizelocation === 8)
			{
				if (resizeanchorpos.height + diffy >= parseFloat(currdialogstyle.maxHeight))  diffy = parseFloat(currdialogstyle.maxHeight) - resizeanchorpos.height;
				else if (newtop + resizeanchorpos.height + parseFloat(currdialogstyle.marginTop) + parseFloat(currdialogstyle.marginBottom) + diffy >= screenheight)  diffy = screenheight - newtop - resizeanchorpos.height - parseFloat(currdialogstyle.marginTop) - parseFloat(currdialogstyle.marginBottom);
				else if (resizeanchorpos.height + diffy < parseFloat(currdialogstyle.minHeight))  diffy = parseFloat(currdialogstyle.minHeight) - resizeanchorpos.height;

				newheight = resizeanchorpos.height + diffy;
			}

			elems.mainwrap.style.left = Math.floor(newleft) + 'px';
			elems.mainwrap.style.top = Math.floor(newtop) + 'px';
			elems.mainwrap.style.width = Math.ceil(newwidth) + 'px';
			elems.mainwrap.style.height = Math.ceil(newheight) + 'px';

			manualmove = true;
			manualsize = true;

			DispatchEvent('position', elems.mainwrap);
		};

		var ResizeDialogEndHandler = function(e) {
			if (e && !e.isTrusted)  return;

			resizeanchorpos = null;

			document.body.classList.remove(resizeclass);

			window.removeEventListener('touchmove', ResizeDialogDragHandler, true);
			window.removeEventListener('touchend', ResizeDialogEndHandler, true);
			window.removeEventListener('mousemove', ResizeDialogDragHandler, true);
			window.removeEventListener('mouseup', ResizeDialogEndHandler, true);
			window.removeEventListener('blur', ResizeDialogEndHandler, true);

			$this.SnapToScreen();

			DispatchEvent('resized', elems.mainwrap);
		};

		var StartResizeDialogHandler = function(e) {
			if (!e.isTrusted)  return;

			// Disallow scrolling on touch and block drag-and-drop.
			e.preventDefault();

			$this.CenterDialog();

			UpdateResizeHoverClass(e);

			document.body.classList.add(resizeclass);

			var rect = elems.resizer.getBoundingClientRect();

			if (e.type === 'touchstart')
			{
				resizeanchorpos = {
					x: e.touches[0].clientX - rect.left,
					y: e.touches[0].clientY - rect.top
				};

				window.addEventListener('touchmove', ResizeDialogDragHandler, true);
				window.addEventListener('touchend', ResizeDialogEndHandler, true);
			}
			else
			{
				resizeanchorpos = {
					x: e.clientX - rect.left,
					y: e.clientY - rect.top
				};

				window.addEventListener('mousemove', ResizeDialogDragHandler, true);
				window.addEventListener('mouseup', ResizeDialogEndHandler, true);
			}

			resizeanchorpos.width = elems.mainwrap.offsetWidth;
			resizeanchorpos.height = elems.mainwrap.offsetHeight;

			window.addEventListener('blur', ResizeDialogEndHandler, true);
		};

		elems.resizer.addEventListener('touchstart', StartResizeDialogHandler);
		elems.resizer.addEventListener('mousedown', StartResizeDialogHandler);

		// Prevent background scrolling for modal dialogs.
		var lastdialogtouchevent = null, dialogpreventscroll = false;
		var DialogScrollHandler = function(e) {
			if (!e.isTrusted || !$this.settings.modal)  return;

			if (e.type === 'touchstart')
			{
				lastdialogtouchevent = {
					num: e.touches.length,
					y: e.touches[0].clientY
				};

				dialogpreventscroll = false;

				return;
			}

			if (e.type === 'touchend')
			{
				lastdialogtouchevent = null;

				return;
			}

			var node = e.target;
			var wouldprevent;

			do
			{
				wouldprevent = false;

				while (node && node !== elems.innerwrap && node.scrollHeight < node.clientHeight + 1)  node = node.parentNode;

				if (node && node !== elems.innerwrap)
				{
					// Detect start/end of overflow scroll.
					if (e.type === 'wheel' && e.deltaMode >= 0 && ((e.deltaY < 0 && node.scrollTop <= 0) || (e.deltaY > 0 && node.scrollTop + 1 >= node.scrollHeight - node.clientHeight)))  wouldprevent = true;

					if (e.type === 'touchmove' && !dialogpreventscroll)
					{
						var currtouchevent = {
							num: e.touches.length,
							y: e.touches[0].clientY
						};

						var diffy = currtouchevent.y - lastdialogtouchevent.y;

						if (currtouchevent.num > 1 || lastdialogtouchevent.num > 1 || Math.abs(diffy) < 1 || (diffy > 0 && node.scrollTop <= 0) || (diffy < 0 && node.scrollTop + 1 >= node.scrollHeight - node.clientHeight))
						{
							wouldprevent = true;
						}
					}

					if (wouldprevent)  node = node.parentNode;
				}
			} while (wouldprevent);

			if (node)
			{
				var node2 = e.target;
				while (node2 && node2 !== elems.innerwrap && node2.parentNode !== parentelem)  node2 = node2.parentNode;

				if (node2 && node2 !== elems.innerwrap)
				{
					var node3 = elems.mainwrap.nextSibling;

					while (node3 && node3 !== node2)  node3 = node3.nextSibling;

					if (node3 === node2)  node2 = elems.innerwrap;
				}

				if (node2 !== elems.innerwrap)  e.preventDefault();
				else
				{
					// Detect start/end of overflow scroll.
					if (e.type === 'wheel' && e.deltaMode >= 0 && ((e.deltaY < 0 && node.scrollTop <= 0) || (e.deltaY > 0 && node.scrollTop + 1 >= node.scrollHeight - node.clientHeight)))  e.preventDefault();

					if (e.type === 'touchmove')
					{
						if (dialogpreventscroll)  e.preventDefault();
						else
						{
							var currtouchevent = {
								num: e.touches.length,
								y: e.touches[0].clientY
							};

							var diffy = currtouchevent.y - lastdialogtouchevent.y;

							if (currtouchevent.num > 1 || lastdialogtouchevent.num > 1 || Math.abs(diffy) < 1 || (diffy > 0 && node.scrollTop <= 0) || (diffy < 0 && node.scrollTop + 1 >= node.scrollHeight - node.clientHeight))
							{
								e.preventDefault();
								dialogpreventscroll = true;
							}

							lastdialogtouchevent = currtouchevent;
						}
					}
				}
			}
		};

		window.addEventListener('wheel', DialogScrollHandler, { capture: true, passive: false });
		window.addEventListener('touchstart', DialogScrollHandler, true);
		window.addEventListener('touchmove', DialogScrollHandler, { capture: true, passive: false });
		window.addEventListener('touchend', DialogScrollHandler, true);

		// Call close callbacks for the dialog.
		$this.Close = function(e) {
			if (e && !e.isTrusted)  return;

			DispatchEvent('close', lastactiveelem);
		};

		elems.closebutton.addEventListener('click', $this.Close);

		var MainKeyHandler = function(e) {
			// Escape.
			if (e.keyCode == 27)  $this.Close(e);

			// Enter/Return.
			if (e.keyCode == 13 && e.target === elems.mainwrap)
			{
				// Locate the first button.
				var buttonnode = elems.formnode.querySelector('input[type=submit]');

				if (buttonnode)
				{
					// Save FlexForms object state changes.
					FlexForms.Save(ffobjs);

					var tempevent = {
						isTrusted: true,
						target: elems.formnode,
						submitter: buttonnode
					};

					$this.settings.request = FlexForms.GetFormVars(elems.formnode, tempevent);

					DispatchEvent('submit', [$this.settings.request, elems.formnode, tempevent, lastactiveelem]);
				}
			}
		};

		elems.mainwrap.addEventListener('keydown', MainKeyHandler);

		// Destroy this instance.
		$this.Destroy = function() {
			// Run FlexForms plugin cleanup routines to avoid memory leaks.
			FlexForms.Cleanup(ffobjs);

			DispatchEvent('destroy');

			delete dialogs[id];

			triggers = {};

			resizelocked = 1;

			window.removeEventListener('mousedown', MainWrapMouseBlurHandler, true);
			window.removeEventListener('blur', MainWrapWindowBlurHandler, true);
			window.removeEventListener('focus', MainWrapFocusHandler, true);

			if (updatesizesframe !== null)
			{
				window.cancelAnimationFrame(updatesizesframe);

				updatesizesframe = null;
			}

			mainwrapresizeobserver.unobserve(elems.mainwrap);
			mainwrapresizeobserver = null;

			window.removeEventListener('resize', dialogresizewatch.Start, true);

			dialogresizewatch.Destroy();

			window.FlexForms.removeEventListener('done', LoadedHandler);

			MoveDialogEndHandler();

			elems.title.removeEventListener('mousedown', StartMoveDialogHandler);
			elems.title.removeEventListener('touchstart', StartMoveDialogHandler);

			ResizeDialogEndHandler();

			elems.resizer.removeEventListener('touchstart', StartResizeDialogHandler);
			elems.resizer.removeEventListener('mousedown', StartResizeDialogHandler);

			window.removeEventListener('wheel', DialogScrollHandler, { capture: true, passive: false });
			window.removeEventListener('touchstart', DialogScrollHandler, true);
			window.removeEventListener('touchmove', DialogScrollHandler, { capture: true, passive: false });
			window.removeEventListener('touchend', DialogScrollHandler, true);

			if (elems.formnode)  elems.formnode.removeEventListener('submit', SubmitHandler);

			elems.closebutton.removeEventListener('click', $this.Close);

			elems.mainwrap.removeEventListener('keydown', MainKeyHandler);

			for (var node in elems)
			{
				if (elems[node] && elems[node].parentNode)  elems[node].parentNode.removeChild(elems[node]);
			}

			currdialogstyle = null;

			// Restore suspended dialogs.
			suspendeddialogs.forEach(function(x) {
				if (dialogs[x])  dialogs[x].Resume();
			});

			suspendeddialogs = null;

			// Remaining cleanup.
			elems = null;
			lastactiveelem = null;
			suspended = 0;

			resizelockmap = {};
			postunlockcallbacks = {};

			$this.settings = Object.assign({}, defaults);

			$this = null;
			parentelem = null;
			options = null;
		};

		// Perform the initial dialog update.
		updatesizesframe = window.requestAnimationFrame(ResetUpdateSizesFrame);

		$this.UpdateContent();

		window.FlexForms.LoadCSS('formdialogcss', window.FlexForms.settings.supporturl + '/flex_forms_dialog.css', undefined, '20250818-01');

		if (updatesizesframe !== null)
		{
			window.cancelAnimationFrame(updatesizesframe);

			updatesizesframe = null;

			if (loaded && !suspended)  LoadedFocus();
		}

		MainWrapResizeHandler();
	};

	var AlertDialogInternal = function(title, content, closecallback, timeout) {
		var timer;

		var dlgoptions = {
			title: title,

			content: (typeof(content) !== 'string' ? content : {
				fields: [
					{
						type: 'custom',
						value: '<div class="staticwrap">' + EscapeHTML(Translate(content)).replaceAll('\n', '<br>\n') + '</div>'
					}
				],
				submit: ['OK'],
				submitname: 'submit'
			}),

			onsubmit: function(dlgformvars, dlgformnode, e, lastactivelem) {
				if (timer)  clearTimeout(timer);

				this.Destroy();

				lastactivelem.focus();

				if (typeof(closecallback) === 'function')  closecallback();
			},

			onclose: function(lastactivelem) {
				if (timer)  clearTimeout(timer);

				this.Destroy();

				lastactivelem.focus();

				if (typeof(closecallback) === 'function')  closecallback();
			}
		};

		var dlg = FlexForms.Dialog(document.body, dlgoptions);

		if (timeout > 0)  timer = setTimeout(function() { dlg.Close(); }, timeout);

		return dlg;
	};

	var ConfirmDialogInternal = function(title, content, yesbutton, nobutton, yescallback, nocallback, closecallback) {
		var dlgoptions = {
			title: title,

			content: (typeof(content) !== 'string' ? content : {
				fields: [
					{
						type: 'custom',
						value: '<div class="staticwrap">' + EscapeHTML(Translate(content)).replaceAll('\n', '<br>\n') + '</div>'
					}
				],
				submit: [yesbutton, nobutton],
				submitname: 'submit'
			}),

			onsubmit: function(dlgformvars, dlgformnode, e, lastactivelem) {
				this.Destroy();

				lastactivelem.focus();

				if (dlgformvars.submit === Translate(yesbutton))
				{
					if (typeof(yescallback) === 'function')  yescallback(1);
				}
				else
				{
					if (typeof(nocallback) === 'function')  nocallback(0);
				}
			},

			onclose: function(lastactivelem) {
				this.Destroy();

				lastactivelem.focus();

				if (typeof(closecallback) === 'function')  closecallback(-1);
				else if (typeof(nocallback) === 'function')  nocallback(-1);
			}
		};

		var dlg = FlexForms.Dialog(document.body, dlgoptions);

		return dlg;
	};

	window.FlexForms.Dialog = DialogInternal;
	window.FlexForms.Dialog.Alert = AlertDialogInternal;
	window.FlexForms.Dialog.Confirm = ConfirmDialogInternal;
})();
