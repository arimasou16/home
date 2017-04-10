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
  'mode.normal.tab_close': 'x',
  'mode.normal.tab_restore': 'u',
  'mode.normal.tab_restore_list': ',uu',
  'mode.normal.follow_previous': '[[',
  'mode.normal.follow_next': ']]',
  'mode.normal.enter_mode_ignore': 'I',
  'mode.normal.quote': 'i',
  'mode.normal.esc': '<force><escape> <force><c-[>',
  'mode.caret.exit': '<escape> <c-[>',
  'mode.hints.exit': '<escape> <c-[>',
  'mode.find.exit': '<escape> <enter> <c-[>',
  'mode.marks.exit': '<escape>  <c-[>',
  'custom.mode.normal.click_toolbar_pocket': 'cp',
  'custom.mode.normal.copy_as_markdown': 'ym',
  'custom.mode.normal.copy_title_and_url': 'yc',
  'custom.mode.normal.view_source': 'gf',
  'custom.mode.normal.open_danime_store': 'goa',
  'custom.mode.normal.open_browser': 'gob',
  'custom.mode.normal.open_aws_console': 'goc',
  'custom.mode.normal.open_feedly': 'gof',
  'custom.mode.normal.open_pocket': 'gop',
  'custom.mode.normal.open_simplenote': 'gos',
  'custom.mode.normal.start_tweetdeck': 'got',
  'custom.mode.normal.open_addons': 'addon',
  'custom.mode.normal.zoom_in': 'zi',
  'custom.mode.normal.zoom_out': 'zo',
  'custom.mode.normal.zoom_reset': 'z0',
  'custom.mode.normal.search_selected_text': 'sst',
  'custom.mode.normal.selected_google_translate': 'sgt',
  'custom.mode.normal.selected_url_open': 'suo',
  'custom.mode.caret.search_selected_text': 's',
  'custom.mode.caret.selected_google_translate': 't',
  'custom.mode.caret.selected_url_open': 'u',
  'custom.mode.normal.tab_move_to_index': 'mi',
  'custom.mode.normal.goto_tab': 'b',
};

const {commands} = vimfx.modes.normal;

const CUSTOM_COMMANDS = [
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
      name: 'copy_title_and_url',
      description: 'Copy title and url',
      category: 'location',
      order: commands.copy_current_url.order + 1
    }, ({vim}) => {
      let url = vim.window.gBrowser.selectedBrowser.currentURI.spec;
      let title = vim.window.gBrowser.selectedBrowser.contentTitle;
      let s = `${title}\n${url}`;
      gClipboardHelper.copyString(s);
      vim.notify(`Copied to clipboard: ${s}`);
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
      if ( url.includes('view-source:') ) {
        url = url.replace(/^view-source:/, '');
      } else {
        url = `view-source:${url}`
      }
      let location = new vim.window.URL(vim.browser.currentURI.spec)
      vim.window.gBrowser.loadURI(`${url}`)
    }
  ],
  [
    {
      name: 'open_danime_store',
      description: 'Dアニメストアを開く',
    }, ({vim}) => {
      let location = new vim.window.URL(vim.browser.currentURI.spec)
      vim.window.gBrowser.loadURI('https://anime.dmkt-sp.jp/animestore/tp_pc')
    }
  ],
  [
    {
      name: 'open_aws_console',
      description: 'AWSコンソールを開く',
    }, ({vim}) => {
      let location = new vim.window.URL(vim.browser.currentURI.spec)
      vim.window.gBrowser.loadURI('https://console.aws.amazon.com/')
    }
  ],
  [
    {
      name: 'start_tweetdeck',
      description: 'tweetdeckを始める',
    }, ({vim}) => {
      let location = new vim.window.URL(vim.browser.currentURI.spec)
      vim.window.gBrowser.loadURI('https://tweetdeck.twitter.com/')
    }
  ],
  [
    {
      name: 'open_simplenote',
      description: 'simplenoteを開く',
    }, ({vim}) => {
      let location = new vim.window.URL(vim.browser.currentURI.spec)
      vim.window.gBrowser.loadURI('https://app.simplenote.com/')
    }
  ],
  [
    {
      name: 'open_feedly',
      description: 'Feedlyを開く',
    }, ({vim}) => {
      let location = new vim.window.URL(vim.browser.currentURI.spec)
      vim.window.gBrowser.loadURI('https://feedly.com/i/latest')
    }
  ],
  [
    {
      name: 'open_pocket',
      description: 'Pocketを開く',
    }, ({vim}) => {
      let location = new vim.window.URL(vim.browser.currentURI.spec)
      vim.window.gBrowser.loadURI('https://getpocket.com/a/')
    }
  ],
  [
    {
      name: 'open_browser',
      description: 'Chrome URI Browserを開く',
    }, ({vim}) => {
      let location = new vim.window.URL(vim.browser.currentURI.spec)
      vim.window.gBrowser.loadURI('chrome://browser/content/browser.xul')
    }

  ],
  [
    {
      name: 'open_addons',
      description: 'アドオンを開く',
    }, ({vim}) => {
      let location = new vim.window.URL(vim.browser.currentURI.spec)
      vim.window.gBrowser.loadURI('about:addons')
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
      description: 'ズームイン',
    }, ({vim}) => {
      vim.window.FullZoom.enlarge();
    }
  ],
  [
    {
      name: 'search_selected_text',
      description: 'Search for the selected text',
      mode: 'normal',
    }, ({vim}) => {
      //let {messageManager} = vim.window.gBrowser.selectedBrowser
      vimfx.send(vim, 'getSelection', null, selection => {
        let inTab = true // Change to 'false' if you'd like to search in current tab.
        vim.window.BrowserSearch.loadSearch(selection, inTab)
      })
    }
  ],
  [
    {
      name: 'selected_google_translate',
      description: '選択文字列をGoogle翻訳',
      mode: 'normal',
    }, ({vim}) => {
      vimfx.send(vim, 'getSelection', null, selection => {
        vim.window.switchToTabHavingURI('http://translate.google.co.jp/?source=osdd#auto|auto|'+selection, true)
      })
    }
  ],
  [
    {
      name: 'selected_url_open',
      description: '選択URLを開く',
      mode: 'normal',
    }, ({vim}) => {
      vimfx.send(vim, 'getSelection', null, selection => {
        let url = selection;
        if ( !selection.includes('http') ) {
          url = 'http://' + selection;
        }
        vim.window.switchToTabHavingURI(url, true)
      })
    }
  ],
  [
    {
      name: 'search_selected_text',
      description: 'Search for the selected text',
      mode: 'caret',
    }, ({vim}) => {
      //let {messageManager} = vim.window.gBrowser.selectedBrowser
      vimfx.send(vim, 'getSelection', null, selection => {
        let inTab = true // Change to 'false' if you'd like to search in current tab.
        vim.window.BrowserSearch.loadSearch(selection, inTab)
      })
    }
  ],
  [
    {
      name: 'selected_google_translate',
      description: '選択文字列をGoogle翻訳',
      mode: 'caret',
    }, ({vim}) => {
      vimfx.send(vim, 'getSelection', null, selection => {
        vim.window.switchToTabHavingURI('http://translate.google.co.jp/?source=osdd#auto|auto|'+selection, true)
      })
    }
  ],
  [
    {
      name: 'selected_url_open',
      description: '選択URLを開く',
      mode: 'caret',
    }, ({vim}) => {
      vimfx.send(vim, 'getSelection', null, selection => {
        let url = selection;
        if ( !selection.includes('http') ) {
          url = 'http://' + selection;
        }
        vim.window.switchToTabHavingURI(url, true)
      })
    }
  ],
  [
    {
      name: 'tab_move_to_inex',
      description: 'Move tab to index',
      category: 'tabs',
      order: commands.tab_move_forward.order + 1,
    }, ({vim, count}) => {
      if (count === undefined) {
        vim.notify('Provide a count')
        return
      }
      let {window} = vim
      window.setTimeout(() => {
        let {selectedTab} = window.gBrowser
        if (selectedTab.pinned) {
          vim.notify('Run from a non-pinned tab')
          return
        }
        let newPosition = window.gBrowser._numPinnedTabs + count - 1
        window.gBrowser.moveTabTo(selectedTab, newPosition)
      }, 0)
    }
  ],
  [
    {
      name: 'goto_tab',
      description: 'Goto tab',
      category: 'tabs',
    }, function(args) {
      commands.focus_location_bar.run(args);
      args.vim.window.gURLBar.value = '% ';
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
