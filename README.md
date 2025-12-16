# tree-sitter-oz

A treesitter grammar for the Oz programming language. Specifically, this grammar is meant to work the the hoz interpreter, as well as code for the official Oz implementation.

At the moment, tree-sitter-oz only provides syntax highlighting. It is mature enough to be useful for that purpose, but is still in early phases.

## Installation & Usage

tree-sitter-oz can be used to enable syntax highlighting in Neovim.

1. Clone or download the repository (`git clone https://github.com/scrmbld/tree-sitter-oz.git`)

2. Add the following lines to your Neovim configuration in order to add Oz as a filetype:
```lua
-- add Oz filetype
vim.filetype.add({
  extension = {
    oz = 'oz'
  }
})
```

3. Add tree-sitter-oz as a parser to your nvim-treesitter configuration (more information here: [adding parsers](https://github.com/nvim-treesitter/nvim-treesitter#adding-parsers)).
```lua
-- load the existing parser configurations
local parser_config = require "nvim-treesitter.parsers".get_parser_configs()
-- create a new configuration for oz
parser_config.oz = {
    highlight = { enable = true },
    indent = { enable = false },
    install_info = {
	-- location of the parser project -- can be git repo or local path
	url = "~/parsers/tree-sitter-oz/", -- wherever you put the download of the repository
	-- url = "git@github.com:scrmbld/tree-sitter-oz.git",
	files = { "src/parser.c" },
	-- select default branch
	branch = "main",
    },
    -- which filetype(s) the parser should run on
    filetype = "oz",
}
```

4. Run `:TSInstall oz` in Neovim

5. Copy highlight.scm to your runtimepath
    1. find the location of your neovim runtime path by running `:set rtp?` in Neovim
    2. navigate to `<rtp_directory>/lazy/nvim-treesitter/queries`
    3. create a directory called `oz` (if it doesn't already exist)
    4. copy `queries/highlight.scm` from your downloaded project directory to the `oz` directory that you just created

This should result in the following file tree:
```
<rtp_directory>
└── lazy
    └── nvim-treesitter
        └── queries
            └── oz
                └── highlights.scm
```

At this point, if you restart neovim and open a file ending in a `.oz` extension, you should see syntax highlighting.


## Setting commentstring (Optional)

In order to enable commentstring integration place the following line into `<config_directory>/ftplugin/oz.lua` 
`vim.bo.commentstring = '// %s'`
