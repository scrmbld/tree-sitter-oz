from unittest import TestCase

import tree_sitter
import tree_sitter_oz


class TestLanguage(TestCase):
    def test_can_load_grammar(self):
        try:
            tree_sitter.Language(tree_sitter_oz.language())
        except Exception:
            self.fail("Error loading Oz grammar")
