import XCTest
import SwiftTreeSitter
import TreeSitterOz

final class TreeSitterOzTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_oz())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Oz grammar")
    }
}
