import {
  FileIcon,
  FileTextIcon,
  GlobeIcon,
  GridIcon,
  ImageIcon,
} from '@radix-ui/react-icons';
import {
  isCodeFile,
  isImageFile,
  isTokenFile,
  isWebsite,
} from 'artkit-browser';
import { createEntriesFromVolume } from 'artkit-collection';
import { fileOpen, fileSave } from 'browser-fs-access';
import { Dialog, FolderIcon } from 'components';
import { createSectionedMenu, ListView, TreeView } from 'designsystem';
import { MenuItem } from 'designsystem/src/components/internal/Menu';
import {
  createCarBlob,
  createFileData,
  FileData,
  FileSystem,
  Zip,
} from 'files';
import { Entries, Node, path, Volume } from 'imfs';
import { getCurrentPlatform } from 'keymap';
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CollectionAction, CollectionState } from 'state';
import { useTheme } from 'styled-components';
import { copyToClipboard } from 'utils';
import { PublishingTool } from './tools/PublishingTool';

type FlatFileNode = {
  filename: string;
  depth: number;
  type: Node<FileData>['type'];
};

function flattenVolume(
  root: Node<FileData>,
  expandedFiles: Record<string, boolean>,
) {
  const files: FlatFileNode[] = [];

  FileSystem.visit(Entries.createEntry('/', root), ([filename, node]) => {
    const basename = path.basename(filename);

    if (basename.startsWith('.') || basename.startsWith('__')) return 'skip';

    files.push({
      filename,
      depth: Volume.getPathComponents(filename).length,
      type: node.type,
    });

    if (!expandedFiles[filename]) return 'skip';
  });

  return files;
}

export const FileTree = memo(function FileTree({
  state,
  dispatch,
  size,
}: {
  state: CollectionState;
  dispatch: (action: CollectionAction) => void;
  size: { width: number; height: number };
}) {
  const [expandedFiles, setExpandedFiles] = useState<Record<string, boolean>>(
    {},
  );
  const theme = useTheme();
  const flattened = useMemo(
    () => flattenVolume(state.volume, expandedFiles),
    [state.volume, expandedFiles],
  );
  const rootName = state.fileHandle?.name ?? '/';

  const isDirectorySelected =
    state.selectedFiles.length === 1 &&
    Volume.getNode(state.volume, state.selectedFiles[0]).type === 'directory';

  const menuItems = useMemo(
    (): MenuItem<string>[] =>
      createSectionedMenu(
        [
          ...(isDirectorySelected
            ? [{ title: 'Select Files Inside', value: 'selectFilesInside' }]
            : [{ title: 'Select Sibling Files', value: 'selectSiblings' }]),
        ],
        [
          state.selectedFiles.length === 1 && {
            title: 'Copy Path',
            value: 'copyPath',
          },
        ],
        isDirectorySelected && [
          { title: 'New Text File...', value: 'newTextFile' },
          { title: 'New Directory...', value: 'newDirectory' },
          { title: 'Upload File...', value: 'uploadFile' },
        ],
        isDirectorySelected && [
          { title: 'Download as Zip...', value: 'downloadZipFile' },
          { title: 'Download as Car...', value: 'downloadCarFile' },
        ],
        state.selectedFiles.length === 1 && [
          { title: 'Upload to IPFS...', value: 'uploadToIPFS' },
        ],
        [{ title: 'Delete', value: 'delete' }],
      ),
    [isDirectorySelected, state.selectedFiles],
  );

  const renderItem = useCallback(
    (node: FlatFileNode, index: number) => {
      const selected = state.selectedFiles.includes(node.filename);
      const iconColor = selected
        ? theme.colors.iconSelected
        : theme.colors.icon;

      return (
        <TreeView.Row
          key={node.filename}
          depth={node.depth}
          selected={selected}
          menuItems={menuItems}
          onContextMenu={() => {
            if (selected) return;

            dispatch({
              type: 'selectFile',
              files: node.filename,
            });
          }}
          onSelectMenuItem={async (value) => {
            switch (value) {
              case 'copyPath': {
                copyToClipboard(node.filename);
                break;
              }
              case 'delete': {
                dispatch({
                  type: 'deleteFile',
                  files: state.selectedFiles,
                });
                break;
              }
              case 'selectSiblings': {
                if (node.filename === '/') break;

                const parent = path.dirname(node.filename);
                const siblings = Volume.readDirectory(state.volume, parent);
                const files = siblings.map((name) => path.join(parent, name));

                dispatch({
                  type: 'selectFile',
                  files,
                });
                break;
              }
              case 'selectFilesInside': {
                const children = Volume.readDirectory(
                  state.volume,
                  node.filename,
                );
                const files = children.map((name) =>
                  path.join(node.filename, name),
                );

                dispatch({
                  type: 'selectFile',
                  files,
                });
                break;
              }
              case 'newTextFile': {
                const filename = prompt('File name...');

                if (!filename) break;

                const file = path.join(node.filename, filename);

                dispatch({
                  type: 'writeFile',
                  file,
                  value: createFileData(''),
                });
                dispatch({ type: 'selectFile', files: file });

                break;
              }
              case 'newDirectory': {
                const filename = prompt('Directory name...');

                if (!filename) break;

                const file = path.join(node.filename, filename);

                dispatch({ type: 'makeDirectory', file });
                dispatch({ type: 'selectFile', files: file });

                break;
              }
              case 'uploadFile': {
                const file = await fileOpen();

                if (!file.handle) break;

                const data = await file.arrayBuffer();

                const name = path.join(node.filename, file.name);

                dispatch({
                  type: 'writeFile',
                  file: name,
                  value: createFileData(new Uint8Array(data)),
                });
                dispatch({ type: 'selectFile', files: name });
                break;
              }
              case 'downloadZipFile': {
                const root = Volume.getNode(state.volume, node.filename);

                const zip = await Zip.fromVolume(root);

                const file = await Zip.toFile(zip, `${node.filename}.zip`);

                await fileSave(file, {
                  extensions: ['.zip'],
                });

                break;
              }
              case 'downloadCarFile': {
                const root = Volume.getNode(state.volume, node.filename);

                const entries = createEntriesFromVolume(root);

                const { cid, blob } = await createCarBlob(entries);

                await fileSave(blob, {
                  fileName: `${cid.toString()}.car`,
                  extensions: ['.car'],
                });

                break;
              }
              case 'uploadToIPFS': {
                setShowUploadDialog(node.filename);

                break;
              }
            }
          }}
          onPress={(info) => {
            const id = node.filename;
            const items = flattened;
            const modKey =
              getCurrentPlatform(navigator) === 'mac' ? 'metaKey' : 'ctrlKey';

            if (info[modKey]) {
              dispatch({
                type: 'selectFile',
                files: id,
                selectionType: state.selectedFiles.includes(id)
                  ? 'difference'
                  : 'intersection',
              });
            } else if (info.shiftKey && state.selectedFiles.length > 0) {
              const lastSelectedIndex = items.findIndex(
                (item) =>
                  item.filename ===
                  state.selectedFiles[state.selectedFiles.length - 1],
              );

              const first = Math.min(index, lastSelectedIndex);
              const last = Math.max(index, lastSelectedIndex) + 1;

              dispatch({
                type: 'selectFile',
                files: items.slice(first, last).map((item) => item.filename),
                selectionType: 'intersection',
              });
            } else {
              dispatch({
                type: 'selectFile',
                files: id,
                selectionType: 'replace',
              });
            }
          }}
          icon={
            node.filename === '/' ? (
              <GridIcon color={iconColor} />
            ) : isImageFile(node.filename) ? (
              <ImageIcon color={iconColor} />
            ) : isWebsite(node.filename) ? (
              <GlobeIcon color={iconColor} />
            ) : isCodeFile(node.filename) || isTokenFile(node.filename) ? (
              <FileTextIcon color={iconColor} />
            ) : node.type === 'file' ? (
              <FileIcon color={iconColor} />
            ) : (
              <FolderIcon color={iconColor} />
            )
          }
          expanded={
            node.type === 'directory'
              ? expandedFiles[node.filename] ?? false
              : undefined
          }
          onClickChevron={() => {
            setExpandedFiles((expandedFiles) => ({
              ...expandedFiles,
              [node.filename]: !expandedFiles[node.filename],
            }));
          }}
        >
          <TreeView.RowTitle>
            {node.filename === '/' ? rootName : path.basename(node.filename)}
          </TreeView.RowTitle>
        </TreeView.Row>
      );
    },
    [
      state.selectedFiles,
      state.volume,
      theme.colors.iconSelected,
      theme.colors.icon,
      menuItems,
      expandedFiles,
      rootName,
      dispatch,
      flattened,
    ],
  );

  const ref = useRef<ListView.IVirtualizedList | null>(null);

  const scrollToIndex =
    flattened.findIndex((item) => item.filename === state.selectedFiles[0]) ??
    -1;

  // Whenever selection changes, scroll the first selected layer into view
  useEffect(() => {
    if (scrollToIndex === -1) return;

    ref.current?.scrollToIndex(scrollToIndex);
  }, [scrollToIndex]);

  const [fileToUpload, setShowUploadDialog] = useState<string | undefined>();

  return (
    <>
      <Dialog
        title={
          <>
            Upload <code>{fileToUpload}</code> to IPFS
          </>
        }
        open={fileToUpload !== undefined}
        onOpenChange={(value) => {
          if (!value) {
            setShowUploadDialog(undefined);
          }
        }}
      >
        {fileToUpload && (
          <PublishingTool volume={state.volume} entry={fileToUpload} />
        )}
      </Dialog>
      <TreeView.Root
        ref={ref}
        scrollable
        expandable
        virtualized={size}
        pressEventName="onPointerDown"
        onPress={useCallback(() => {
          dispatch({
            type: 'selectFile',
            files: undefined,
          });
        }, [dispatch])}
        renderItem={renderItem}
        data={flattened}
        keyExtractor={useCallback((node: FlatFileNode) => node.filename, [])}
      />
    </>
  );
});
