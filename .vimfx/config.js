const {classes: Cc, interfaces: Ci, utils: Cu} = Components;
const gClipboardHelper = Cc['@mozilla.org/widget/clipboardhelper;1']
      .getService(Ci.nsIClipboardHelper);
const {Preferences} = Cu.import('resource://gre/modules/Preferences.jsm', {});

const VIMFX_PREFS = {
  'prevent_autofocus': true,
  'blacklist': 'https://feedly.com/i/latest  https://tweetdeck.twitter.com/',
  'hints.chars': 'abcdefghijklmnopqrstuvwxyz',
  'prev_patterns': 'prev  previous  back  newer  ^前(の)?ページ  前.*  ←  ^<$  ^(<<|≪)$  ^(<|≪)  (<|≪)$  ^前(へ|の|ペ)  ^戻る  prev|previous  ^(<<|«)$  ^(<|«)  (<|«)$',
  'next_patterns': 'next  more  older  ^次(の)?ページ  次.*  →  ^>$  ^(>>|≫)$  ^(>|≫)  (>|≫)$  ^次(へ|の|ペ)  ^続き  ^(>>|»)$  ^(>|»)  (>|»)$',
};

const MAPPINGS = {
  'mode.normal.copy_current_url': 'yy',
  'mode.normal.go_home': 'gh',
  'mode.normal.history_back': 'H',
  'mode.normal.history_forward': 'L',
  'mode.normal.stop': '<c-escape>',
  'mode.normal.stop_all': 'a<c-escape>',
  'mode.normal.scroll_left': 'h',
  'mode.normal.scroll_right': 'l',
  'mode.normal.scroll_page_down': '<c-f>',
  'mode.normal.scroll_page_up': '<c-b>',
  'mode.normal.scroll_half_page_down': '<c-d>',
  'mode.normal.scroll_half_page_up': '<c-u>',
  'mode.normal.mark_scroll_position': 'mm',
  'mode.normal.scroll_to_mark': 'gm',
  'mode.normal.tab_new': 'T',
  'mode.normal.tab_new_after_current': 't',
  'mode.normal.tab_select_previous': 'gT',
  'mode.normal.tab_select_next': 'gt',
  'mode.normal.tab_select_first_non_pinned': 'g^',
  'mode.normal.tab_select_last': 'g$',
  'mode.normal.tab_close': 'd x',
  'mode.normal.tab_restore': 'u',
  'mode.normal.tab_restore_list': ',uu',
  'mode.normal.follow_previous': '[[',
  'mode.normal.follow_next': ']]',
  'mode.normal.enter_mode_ignore': 'I',
  'mode.normal.quote': 'i',
  'mode.normal.esc': '<force><escape> <force><c-[>',
  'mode.caret.exit': '<escape> <c-[>',
  'mode.hints.exit': '<escape> <c-[>',
  'mode.find.exit': '<escape>    <enter>  <c-[>',
  'mode.marks.exit': '<escape>  <c-[>',
  'custom.mode.normal.click_toolbar_pocket': 'ep',
  'custom.mode.normal.copy_as_markdown': 'ym',
  'custom.mode.normal.search_selected_text': 's',
  'custom.mode.normal.view_source': 'gf',
  'custom.mode.normal.copy_selection_or_url': 'yc',
  'custom.mode.normal.open_danime_store': 'goa',
  'custom.mode.normal.open_aws_console': 'goc',
  'custom.mode.normal.open_feedly': 'gof',
  'custom.mode.normal.open_pocket': 'gop',
  'custom.mode.normal.open_simplenote': 'gos',
  'custom.mode.normal.start_tweetdeck': 'got',
  'custom.mode.normal.zoom_in': 'zi',
  'custom.mode.normal.zoom_out': 'zo',
  'custom.mode.normal.zoom_reset': 'zz'
};

const {commands} = vimfx.modes.normal;

const CUSTOM_COMMANDS = [
  [
    {
      name: 'search_selected_text',
      description: 'Search for the selected text'
    }, ({vim}) => {
      vimfx.send(vim, 'getSelection', true, selection => {
        if (selection != '') {
          vim.window.switchToTabHavingURI(`https://www.google.co.jp/search?q=${selection}`, true);
        }
      });
    }
  ],
  [
    {
      name: 'copy_as_markdown',
      description: 'Copy title and url as Markdown',
      category: 'location',
      order: commands.copy_current_url.order + 2
    }, ({vim}) => {
      let url = vim.window.gBrowser.selectedBrowser.currentURI.spec;
      let title = vim.window.gBrowser.selectedBrowser.contentTitle;
      let s = `[${title}](${url})`;
      gClipboardHelper.copyString(s);
      vim.notify(`Copied to clipboard: ${s}`);
    }
  ],
  [
    {
      name: 'copy_selection_or_url',
      description: 'Copy the selection or current url',
      category: 'location',
      order: commands.copy_current_url.order + 1
    }, ({vim}) => {
      vimfx.send(vim, 'getSelection', true, selection => {
      if (selection == '') {
        selection = vim.window.gBrowser.selectedBrowser.currentURI.spec;
      }
      gClipboardHelper.copyString(selection);
      vim.notify(`Copied to clipboard: ${selection}`);
      });
    }
  ],
  [
    {
      name: 'click_toolbar_pocket',
      description: 'Click toolbar button [Pocket]'
    }, ({vim}) => {
      vim.window.document.getElementById('pocket-button').click();
    }
  ],
	[
		{
			name: 'view_source',
			description: 'ページのソースを表示',
		}, ({vim}) => {
      let url = vim.window.gBrowser.selectedBrowser.currentURI.spec;
      let s = `view-source:${url}`;
			let location = new vim.window.URL(vim.browser.currentURI.spec)
			vim.window.gBrowser.loadURI(`${s}`)
		}
	],
	[
		{
			name: 'open_danime_store',
			description: 'Dアニメストアを開く',
		}, ({vim}) => {
			let location = new vim.window.URL(vim.browser.currentURI.spec)
			vim.window.gBrowser.loadURI(`https://anime.dmkt-sp.jp/animestore/tp_pc`)
		}
	],
	[
		{
			name: 'open_aws_console',
			description: 'AWSコンソールを開く',
		}, ({vim}) => {
			let location = new vim.window.URL(vim.browser.currentURI.spec)
			vim.window.gBrowser.loadURI(`https://console.aws.amazon.com/`)
		}
	],
	[
		{
			name: 'start_tweetdeck',
			description: 'tweetdeckを始める',
		}, ({vim}) => {
			let location = new vim.window.URL(vim.browser.currentURI.spec)
			vim.window.gBrowser.loadURI(`https://tweetdeck.twitter.com/`)
		}
	],
	[
		{
			name: 'open_simplenote',
			description: 'simplenoteを開く',
		}, ({vim}) => {
			let location = new vim.window.URL(vim.browser.currentURI.spec)
			vim.window.gBrowser.loadURI(`https://app.simplenote.com/`)
		}
	],
	[
		{
			name: 'open_feedly',
			description: 'Feedlyを開く',
		}, ({vim}) => {
			let location = new vim.window.URL(vim.browser.currentURI.spec)
			vim.window.gBrowser.loadURI(`https://feedly.com/i/latest`)
		}
	],
	[
		{
			name: 'open_pocket',
			description: 'Pocketを開く',
		}, ({vim}) => {
			let location = new vim.window.URL(vim.browser.currentURI.spec)
			vim.window.gBrowser.loadURI(`https://getpocket.com/a/`)
		}
	],
	[
		{
			name: 'zoom_reset',
			description: 'ズームリセット',
		}, ({vim}) => {
			vim.window.FullZoom.reset();
		}
	],
	[
		{
			name: 'zoom_out',
			description: 'ズームアウト',
		}, ({vim}) => {
			vim.window.FullZoom.reduce();
		}
	],
	[
		{
			name: 'zoom_in',
			description: 'c_ズームイン',
		}, ({vim}) => {
			vim.window.FullZoom.enlarge();
		}
	]
];

Object.entries(VIMFX_PREFS).forEach(([name, value]) => {
  vimfx.set(name, value);
});

CUSTOM_COMMANDS.forEach(([options, fn]) => {
  vimfx.addCommand(options, fn);
});

Object.entries(MAPPINGS).forEach(([cmd, key]) => {
  if (!cmd.includes('.')) {
    cmd = `mode.normal.${cmd}`;
  }
  vimfx.set(cmd, key);
});
