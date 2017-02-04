"----------------------------------------
" ユーザー設定
"----------------------------------------
" クリップボード
if has('win32') || has('win64')
  set clipboard+=unnamed "※Windows設定
else
  set clipboard=unnamedplus
endif
" ウインドウに関する設定:
"起動時全画面
if has('win32') || has('win64')
  au GUIEnter * simalt ~x "※Windows設定
endif
" タイトルを表示
set title
" ウインドウの幅
set columns=80
" ウインドウの高さ
set lines=25
" スワップファイルを作らない
set noswapfile
" バックアップファイルを作らない
set nobackup
" undofileをまとめる
set undodir=$VIM/undo
" 矩形選択で行末を超えてブロックを選択できるようにする
set virtualedit+=block
" 文字エンコーディング設定
set encoding=utf-8
" 自動判別設定
set fileencodings=utf-8,euc-jp,iso-2022-jp,cp932,ucs-bom
if has('win32') || has('win64')
  set fileformats=dos,unix " ※Windows設定
else
  set fileformats=unix,dos
endif
" メニュー文字エンコーディング設定 ※Windows設定
if has('win32') || has('win64')
  source $VIMRUNTIME/delmenu.vim
  set langmenu=ja_jp.utf-8
  source $VIMRUNTIME/menu.vim
endif
" 行番号の設定
set number
" タブの数設定
set showtabline=2
"画面上でタブ文字が占める幅
set tabstop=2
"自動インデントでずれる幅
set shiftwidth=2
"連続した空白に対してタブキーやバックスペースキーでカーソルが動く幅
set softtabstop=2
"改行時に前の行のインデントを継続する
set autoindent
"改行時に入力された行の末尾に合わせて次の行のインデントを増減する
set smartindent
" ステータス表示
set laststatus=2
" ステータスラインにファイル名、文字コード、改行コード、コードポイント、ルーラを表示
set statusline=%<%f\ %m%r%h%w%{'['.(&fenc!=''?&fenc:&enc).']['.&ff.']'}%=CP[%b\ 0x%B]\ %l,%c%V%8P
" コマンドラインの高さ
set cmdheight=2
" コマンド表示
set showcmd
" 折り返し設定
set wrap
set tw=0
" Windows環境においてもフォルダ区切りをバックスラッシュでなくスラッシュにする
set shellslash
" ime制御
if has('multi_byte_ime') || has('xim') || has('gui_macvim')
  " insert mode: lmap off, ime on
  set iminsert=2
  " serch mode: lmap off, ime on
  set imsearch=2
  " normal mode: ime off
  inoremap <silent> <esc> <esc>:set iminsert=0<cr>
endif
"検索時に大文字小文字の区別をしない
set ignorecase
"大文字で検索時には大文字小文字の区別をする
set smartcase
"検索時にファイルの最後まで行ったら最初に戻らない
set nowrapscan
"インクリメンタルサーチ
set incsearch
"GUIで起動時はシンタックスをオン、そして検索文字をハイライト
if &t_Co > 2 || has("gui_running")
  syntax on
  set hlsearch
endif
set hlsearch
" タブ、行末を表示
set list
set listchars=tab:>\ ,trail:~
" BACKSPACEキーでの挿入モードでの文字削除、行連結、インデント削除を可能にする
set backspace=start,eol,indent
"バイナリファイルの非印字可能文字を16進数で表示
set display=uhex
"補完メニューを見やすくする
set wildmenu
"[Backspace][Space]←→(ノーマルビジュアル、そして挿入、置換モード)~で行頭、行末から移動を可能とする
set whichwrap=b,s,[,],<,>
" 文脈依存な文字幅の問題
set ambiwidth=double
"外部でファイルに変更がされた場合は読みなおす
set autoread
"画面最後の行をできる限り表示する。
set display+=lastline
" ファイル自動読み込み
set autoread
" 開いたファイルのカレントディレクトリに移動
autocmd BufEnter * execute ":lcd " . substitute(expand("%:p:h")," ","\\\\ ","g")
" デフォルトのfiletype
set filetype=markdown
" マークダウン
au BufRead,BufNewFile *.md set filetype=markdown
" 自動的にquickfix-windowを開く
autocmd QuickFixCmdPost *grep* cwindow
""""""""""""""""""""""""""""""
"挿入モード時、ステータスラインの色を変更
""""""""""""""""""""""""""""""
let g:hi_insert = 'highlight StatusLine guifg=darkblue guibg=darkyellow gui=none ctermfg=blue ctermbg=yellow cterm=none'
if has('syntax')
  augroup InsertHook
    autocmd!
    autocmd InsertEnter * call s:StatusLine('Enter')
    autocmd InsertLeave * call s:StatusLine('Leave')
  augroup END
endif

let s:slhlcmd = ''
function! s:StatusLine(mode)
  if a:mode == 'Enter'
    silent! let s:slhlcmd = 'highlight ' . s:GetHighlight('StatusLine')
    silent exec g:hi_insert
  else
    highlight clear StatusLine
    silent exec s:slhlcmd
  endif
endfunction

function! s:GetHighlight(hi)
  redir => hl
  exec 'highlight '.a:hi
  redir END
  let hl = substitute(hl, '[\r\n]', '', 'g')
  let hl = substitute(hl, 'xxx', '', '')
  return hl
endfunction
" キーマップ設定 削除時はクリップボードにコピーしない
nnoremap d  "_d
vnoremap d  "_d
nnoremap D  "_D
vnoremap D  "_D
"---------------------------
" Start Neobundle Settings.
"---------------------------
" bundleで管理するディレクトリを指定
if has('vim_starting')
  set runtimepath+=~/.vim/bundle/neobundle.vim/
endif
" Required:
call neobundle#begin(expand('~/.vim/bundle/'))
" neobundle自体をneobundleで管理
NeoBundleFetch 'Shougo/neobundle.vim'
" 以下は必要に応じて追加
NeoBundle 'Shougo/unite.vim'
NeoBundle 'Shougo/neomru.vim'
NeoBundle 'tomasr/molokai'
NeoBundle 'altercation/vim-colors-solarized'
NeoBundle 'tyru/eskk.vim'
NeoBundle 'plasticboy/vim-markdown'
NeoBundle 'kannokanno/previm'
NeoBundle 'tyru/open-browser.vim'
NeoBundle 'thinca/vim-qfreplace'
NeoBundle 'thinca/vim-singleton'
NeoBundle 'dhruvasagar/vim-table-mode'
NeoBundle 'mattn/webapi-vim'
NeoBundle 'mattn/vimplenote-vim'
NeoBundle 'vim-scripts/BufOnly.vim'
NeoBundle 'vim-scripts/copypath.vim'
NeoBundle 'scrooloose/nerdtree'
NeoBundle 'fuenor/qfixgrep'
call neobundle#end()
" Required:
filetype plugin indent on
"vim-singleton
call singleton#enable()
" grep
if has('win32') || has('win64')
  set grepprg=jvgrep
endif
" Unite
let g:unite_enable_start_insert=1
let g:unite_source_history_yank_enable =1
let g:unite_source_file_mru_limit = 200
nnoremap <silent> ,uy :<C-u>Unite history/yank<CR>
nnoremap <silent> ,ub :<C-u>Unite buffer<CR>
nnoremap <silent> ,uf :<C-u>UniteWithBufferDir -buffer-name=files file<CR>
nnoremap <silent> ,ur :<C-u>Unite -buffer-name=register register<CR>
nnoremap <silent> ,uu :<C-u>Unite file_mru buffer<CR>
" markdown
autocmd BufRead,BufNewFile *.md set filetype=markdown
" eskk
let g:eskk#directory = "~/.eskk"
let g:eskk#dictionary = { 'path': "~/.skk-jisyo", 'sorted': 0, 'encoding': 'utf-8', }
let g:eskk#large_dictionary = { 'path': "~/.eskk/SKK-JISYO.L", 'sorted': 1, 'encoding': 'euc-jp', }
" vim-table-mode
" For Markdown-compatible tables use
let g:table_mode_corner="|"
" vimplenote
source ~/.vim/bundle/vimplenote-vim/vimplenoterc
" QuickFix
set runtimepath+=~/.vim/bundle/qfixgrep
" QuickFixウィンドウでもプレビューや絞り込みを有効化
let QFixWin_EnableMode = 1
" QFixHowm/QFixGrepの結果表示にロケーションリストを使用する/しない
let QFix_UseLocationList = 1
syntax enable
set background=dark
colorscheme solarized
set guifont=Ricty\ Discord\ 14
