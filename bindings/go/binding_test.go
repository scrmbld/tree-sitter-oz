package tree_sitter_oz_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_oz "github.com/scrmbld/tree-sitter-oz/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_oz.Language())
	if language == nil {
		t.Errorf("Error loading Oz grammar")
	}
}
