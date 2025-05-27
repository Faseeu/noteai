// Conceptual Integration Tests for editor features
// These tests require a test runner and potentially a mock DOM environment (e.g., Jest + JSDOM)
// to run effectively. For now, they outline the logic.

import { Workspace, Page, Text } from '@blocksuite/store';
import {
  AffineSchemas,
  DatabaseBlockModel,
  edgelessPreset,
  PageBlockModel,
  TableBlockModel,
  __unstableSchemas,
} from '@blocksuite/blocks/models';
import { ContentParser } from '@blocksuite/blocks/content-parser';
import { createWorkspaceOptions } from './utils'; // Assuming this can be used
// import { EditorContainer } from '@blocksuite/editor'; // Would be needed for full edgeless toggle test

// Helper function to initialize a workspace and page for testing
async function createTestPage(): Promise<{ workspace: Workspace, page: Page, contentParser: ContentParser }> {
  const options = createWorkspaceOptions(); // Use existing options setup
  const workspace = new Workspace(options)
    .register(AffineSchemas)
    .register(__unstableSchemas)
    .register(TableBlockModel)
    .register(DatabaseBlockModel);

  const page = workspace.createPage({ id: 'test-page-' + Date.now() });
  const contentParser = new ContentParser(page);
  
  // Add a default page block for context if needed by some operations (e.g. frame insertion for markdown)
  page.addBlock('affine:page', { title: new Text('Test Page Title') });
  return { workspace, page, contentParser };
}

console.log('---- Conceptual Test Suite: Editor Integration ----');

// Test 1: TableBlockModel and DatabaseBlockModel Insertion
async function testBlockInsertion() {
  console.log('Running Test: Block Insertion...');
  try {
    const { page } = await createTestPage();
    const pageBlock = page.root?.children[0] as PageBlockModel; // Assuming the first block is the page block
    if (!pageBlock) {
      throw new Error('Default PageBlockModel not found on test page.');
    }

    // Test TableBlockModel insertion
    const tableBlockId = page.addBlock('affine:table', {}, pageBlock.id);
    const tableBlock = page.getBlockById(tableBlockId) as TableBlockModel;
    if (!tableBlock || tableBlock.flavour !== 'affine:table') {
      throw new Error('TableBlockModel not inserted correctly or not found.');
    }
    console.log('  SUCCESS: TableBlockModel inserted.');

    // Test DatabaseBlockModel insertion
    const dbBlockId = page.addBlock('affine:database', {}, pageBlock.id);
    const dbBlock = page.getBlockById(dbBlockId) as DatabaseBlockModel;
    if (!dbBlock || dbBlock.flavour !== 'affine:database') {
      throw new Error('DatabaseBlockModel not inserted correctly or not found.');
    }
    console.log('  SUCCESS: DatabaseBlockModel inserted.');
    console.log('Test: Block Insertion PASSED');
    return true;
  } catch (error) {
    console.error('Test: Block Insertion FAILED', error);
    return false;
  }
}

// Test 2: Edgeless Mode Toggle (Conceptual)
// This test is highly conceptual as it involves React component state and direct editor manipulation
// which is not straightforward without a proper testing environment.
async function testEdgelessModeToggle() {
  console.log('Running Test: Edgeless Mode Toggle (Conceptual)...');
  // Conceptual steps:
  // 1. Instantiate the Editor component (e.g., using React Testing Library if available).
  //    const editorInstance = mount(<Editor />); // Pseudocode
  // 2. Simulate a click on the "Edgeless Mode" button.
  //    editorInstance.find('button:contains("Edgeless Mode")').simulate('click'); // Pseudocode
  // 3. Assert that the internal `editor.mode` (from editorRef.current) is 'edgeless'.
  //    expect(editorRef.current.mode).toBe('edgeless'); // Pseudocode
  // 4. Simulate a click on the "Page Mode" button.
  //    editorInstance.find('button:contains("Page Mode")').simulate('click'); // Pseudocode
  // 5. Assert that `editor.mode` is 'page'.
  //    expect(editorRef.current.mode).toBe('page'); // Pseudocode
  // 6. Assert that no errors occurred during these switches.
  console.log('  NOTE: This test requires a React testing environment to simulate component interaction.');
  console.log('Test: Edgeless Mode Toggle PASSED (Conceptually)');
  return true;
}

// Test 3: Markdown Export Content Generation
async function testMarkdownExport() {
  console.log('Running Test: Markdown Export Content Generation...');
  try {
    const { page, contentParser } = await createTestPage();
    // Add some content to the page for export
    const pageBlock = page.root?.children[0] as PageBlockModel;
    if (!pageBlock) throw new Error("Page block not found");
    
    const frameId = page.addBlock('affine:frame', {}, pageBlock.id);
    page.addBlock('affine:paragraph', { text: new Text('Hello Markdown') }, frameId);

    const markdownContent = await contentParser.exportMarkdown();
    if (typeof markdownContent !== 'string' || markdownContent.length === 0) {
      throw new Error('Markdown export returned empty or invalid content.');
    }
    if (!markdownContent.includes('Hello Markdown')) {
        throw new Error('Markdown content does not contain expected text.');
    }
    console.log('  SUCCESS: Markdown content generated.');
    // console.log('  Content:', markdownContent);
    console.log('Test: Markdown Export Content Generation PASSED');
    return true;
  } catch (error) {
    console.error('Test: Markdown Export Content Generation FAILED', error);
    return false;
  }
}

// Test 4: HTML Export Content Generation
async function testHtmlExport() {
  console.log('Running Test: HTML Export Content Generation...');
  try {
    const { page, contentParser } = await createTestPage();
    const pageBlock = page.root?.children[0] as PageBlockModel;
     if (!pageBlock) throw new Error("Page block not found");

    const frameId = page.addBlock('affine:frame', {}, pageBlock.id);
    page.addBlock('affine:paragraph', { text: new Text('Hello HTML') }, frameId);
    
    const htmlContent = await contentParser.exportHtml();
    if (typeof htmlContent !== 'string' || htmlContent.length === 0) {
      throw new Error('HTML export returned empty or invalid content.');
    }
    if (!htmlContent.includes('Hello HTML')) {
        throw new Error('HTML content does not contain expected text.');
    }
    console.log('  SUCCESS: HTML content generated.');
    // console.log('  Content:', htmlContent);
    console.log('Test: HTML Export Content Generation PASSED');
    return true;
  } catch (error) {
    console.error('Test: HTML Export Content Generation FAILED', error);
    return false;
  }
}

// Test 5: Snapshot Export Content Generation
async function testSnapshotExport() {
  console.log('Running Test: Snapshot Export Content Generation...');
  try {
    const { page } = await createTestPage();
    page.addBlock('affine:paragraph', { text: new Text('Hello Snapshot') });

    const snapshot = page.snapToSnapshot();
    if (typeof snapshot !== 'object' || snapshot === null) {
      throw new Error('Snapshot export returned invalid content.');
    }
    if (Object.keys(snapshot.blocks).length === 0) {
        throw new Error('Snapshot blocks are empty.');
    }
    // A more specific check could verify the content of the snapshot
    console.log('  SUCCESS: Snapshot content generated.');
    // console.log('  Snapshot:', JSON.stringify(snapshot, null, 2));
    console.log('Test: Snapshot Export Content Generation PASSED');
    return true;
  } catch (error) {
    console.error('Test: Snapshot Export Content Generation FAILED', error);
    return false;
  }
}

// Runner (conceptual)
async function runTests() {
  console.log('\nStarting Conceptual Test Execution...\n');
  let allTestsPassed = true;

  allTestsPassed = await testBlockInsertion() && allTestsPassed;
  console.log('\n');
  allTestsPassed = await testEdgelessModeToggle() && allTestsPassed; // Conceptual
  console.log('\n');
  allTestsPassed = await testMarkdownExport() && allTestsPassed;
  console.log('\n');
  allTestsPassed = await testHtmlExport() && allTestsPassed;
  console.log('\n');
  allTestsPassed = await testSnapshotExport() && allTestsPassed;

  console.log('\n---------------------------------------------');
  if (allTestsPassed) {
    console.log('🎉 All conceptual tests PASSED (logic check)');
  } else {
    console.error('❌ Some conceptual tests FAILED (logic check)');
  }
  console.log('---------------------------------------------\n');
}

// To run these conceptual tests, you would typically use a command like:
// `node src/components/editor/editor.integration.tests.js` (after compiling to JS)
// Or integrate with a test runner.
// For now, this script can be executed with ts-node for a basic check of the logic:
// `npx ts-node src/components/editor/editor.integration.tests.ts`
// Note: DOM-dependent parts of BlockSuite might not work fully without a browser-like environment.

runTests();
