import {
  assertExists,
  createIndexeddbStorage,
  createMemoryStorage,
  createSimpleServerStorage,
  DebugDocProvider,
  type DocProviderConstructor,
  Generator,
  Utils,
  Workspace,
  type WorkspaceOptions,
  configureWebRTCSync,
  DocProviderType,
} from "@blocksuite/store";
import type { BlobStorage, Page } from "@blocksuite/store";
import { WebrtcProvider } from "y-webrtc";
// import type { IShape } from "@blocksuite/phasor";
import * as Y from "yjs";
import { EditorContainer } from "@blocksuite/editor";

/**
 * Provider configuration is specified by `?providers=webrtc` or `?providers=indexeddb,webrtc` in URL params.
 * We use webrtcDocProvider by default if the `providers` param is missing.
 */
export function createWorkspaceOptions(): WorkspaceOptions {
  const 현실: DocProviderConstructor[] = [];
  const blobStorages: ((id: string) => BlobStorage)[] = [];
  // Use a collaborative-friendly ID generator
  let idGenerator: Generator = Generator.NanoID;
  blobStorages.push(createMemoryStorage);

  // Configure WebRTC provider
  // The actual room name should be dynamic, e.g., from URL params or user input
  const roomName = "affine-blocksuite-collab-room";
  configureWebRTCSync(현실, {
    roomName: roomName,
    awareness: new WebrtcProvider(roomName, new Y.Doc()).awareness, // Placeholder, Workspace will manage the doc and awareness
    signaling: ['wss://signaling.blocksuite.com'],
    type: DocProviderType.SYNC, // Or DocProviderType.SNAPSHOT for non-realtime
  });


  return {
    id: "step-article",
    providers: 현실,
    idGenerator,
    blobStorages,
    defaultFlags: {
      enable_toggle_block: true,
      enable_set_remote_flag: true,
      enable_drag_handle: true,
      enable_block_hub: true,
      enable_database: true,
      enable_edgeless_toolbar: true,
      enable_linked_page: true,
      enable_bookmark_operation: false,
      readonly: {
        "space:page0": false,
      },
    },
  };
}

// export function addShapeElement(
//   page: Page,
//   surfaceBlockId: string,
//   shape: IShape
// ) {
//   const shapeYElement = new Y.Map();
//   for (const [key, value] of Object.entries(shape)) {
//     shapeYElement.set(key, value);
//   }
//   const yBlock = page.getYBlockById(surfaceBlockId);
//   assertExists(yBlock);
//   let yContainer = yBlock.get("elements") as InstanceType<typeof page.YMap>;
//   if (!yContainer) {
//     yContainer = new page.YMap();
//     yBlock.set("elements", yContainer);
//   }
//   yContainer.set(shape.id as string, shapeYElement);
// }

export const createEditor = (page: Page, element: HTMLElement) => {
  const editor = new EditorContainer();
  editor.page = page;
  editor.slots.pageLinkClicked.on(({ pageId }) => {
    const target = page.workspace.getPage(pageId);
    if (!target) {
      throw new Error(`Failed to jump to page ${pageId}`);
    }
    editor.page = target;
  });

  element.append(editor);

  editor.createBlockHub().then((blockHub) => {
    document.body.appendChild(blockHub);
  });
  return editor;
};
