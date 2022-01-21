import { FileSystemHandle } from 'browser-fs-access';
import { Directory, Node, Nodes, path, Volume } from 'imfs';
import produce from 'immer';
import { moveArrayItem, SelectionType, updateSelection } from 'state';
import { getIncrementedName } from 'utils';
import { ArtkitGeneratedMetadata } from 'artkit-capture';
import { createFileData, FileData, fileDataToString, FileJSON } from 'files';
import { NFTMetadata, NFTMetadataAttribute } from 'web3-utils';

export type CollectionState = {
  didInitialize: boolean;
  fileHandle?: FileSystemHandle;
  volume: Node<FileData>;
  selectedFiles: string[];
};

export type CollectionAction =
  | {
      type: 'setFileHandle';
      fileHandle?: FileSystemHandle;
      volume?: Directory<FileData>;
    }
  | {
      type: 'selectFile';
      files: string | string[] | undefined;
      selectionType?: SelectionType;
    }
  | {
      type: 'deleteFile';
      files: string | string[];
      selectionType?: SelectionType;
    }
  | {
      type: 'writeFile';
      file: string;
      value: FileData;
    }
  | {
      type: 'makeDirectory';
      file: string;
    }
  | {
      type: 'addToken';
    }
  | {
      type: 'setTokenMetadataName';
      files: string[];
      value: string;
    }
  | {
      type: 'setTokenMetadataDescription';
      files: string[];
      value: string;
    }
  | {
      type: 'setTokenMetadataImage';
      files: string[];
      value: string;
    }
  | {
      type: 'setTokenMetadataAnimationUrl';
      files: string[];
      value: string;
    }
  | {
      type: 'setTokenMetadataExternalUrl';
      files: string[];
      value: string;
    }
  | {
      type: 'addTokenMetadataAttribute';
      files: string[];
    }
  | {
      type: 'removeTokenMetadataAttribute';
      files: string[];
      attributeName: string;
    }
  | {
      type: 'setTokenMetadataAttributeName';
      files: string[];
      originalAttributeName: string;
      newAttributeName: string;
    }
  | {
      type: 'setTokenMetadataAttributeValue';
      files: string[];
      attributeName: string;
      attributeValue: string | number | boolean;
    }
  | {
      type: 'moveTokenMetadataAttribute';
      files: string[];
      attributeName: string;
      destinationIndex: number;
    }
  | {
      type: 'setTokenMetadataAttributes';
      files: string[];
      attributes: NFTMetadataAttribute[];
    }
  | {
      type: 'setGeneratedMetadata';
      generated: ArtkitGeneratedMetadata;
    }
  | {
      type: 'setTokenMetadataImageFromComputer';
      files: string[];
      name: string;
      data: Uint8Array;
    }
  | {
      type: 'setCollectionSize';
      size: number;
      fileToDuplicate?: string;
    };

export function createInitialCollectionState(): CollectionState {
  return {
    didInitialize: false,
    selectedFiles: [],
    volume: Volume.create(),
  };
}

export function collectionReducer(
  state: CollectionState,
  action: CollectionAction,
): CollectionState {
  switch (action.type) {
    case 'setFileHandle':
      return produce(state, (draft) => {
        draft.fileHandle = action.fileHandle;
        draft.selectedFiles = [];
        draft.didInitialize = true;

        if (action.volume) {
          draft.volume = action.volume;
        }
      });
    case 'selectFile':
      return produce(state, (draft) => {
        updateSelection(
          draft.selectedFiles,
          action.files,
          action.selectionType ?? 'replace',
        );
      });
    case 'addToken':
      if (!state.volume) return state;

      const existingNumbers = new Set(
        Volume.readDirectory(state.volume, '/metadata').map((name) =>
          parseInt(name),
        ),
      );

      return produce(state, (draft) => {
        let nextNumber = 0;

        while (existingNumbers.has(nextNumber)) {
          nextNumber++;
        }

        const name = `${nextNumber}.token.json`;
        const file = path.join('metadata', name);
        const bytes = JSON.stringify({});

        Volume.writeFile(
          draft.volume as Node<FileData>,
          file,
          createFileData(bytes),
        );

        draft.selectedFiles = [file];
      });
    case 'deleteFile': {
      const files =
        typeof action.files === 'string' ? [action.files] : action.files;

      return produce(state, (draft) => {
        updateSelection(draft.selectedFiles, [], 'replace');

        files.forEach((name) => {
          if (!draft.volume) return;

          Volume.removeFile(draft.volume, name);
        });
      });
    }
    case 'writeFile': {
      const { file, value } = action;

      return produce(state, (draft) => {
        if (!draft.volume) return;

        Volume.writeFile(draft.volume, file, value);
      });
    }
    case 'makeDirectory': {
      const { file } = action;

      return produce(state, (draft) => {
        if (!draft.volume) return;

        Volume.makeDirectory(draft.volume, file);
      });
    }
    case 'setTokenMetadataName':
      return batchUpdateMetadata(state, action.files, (metadata) => ({
        ...metadata,
        name: action.value,
      }));
    case 'setTokenMetadataDescription':
      return batchUpdateMetadata(state, action.files, (metadata) => ({
        ...metadata,
        description: action.value,
      }));
    case 'setTokenMetadataImage':
      return batchUpdateMetadata(state, action.files, (metadata) => ({
        ...metadata,
        image: action.value,
      }));
    case 'setTokenMetadataAnimationUrl':
      return batchUpdateMetadata(state, action.files, (metadata) => {
        if (!action.value) {
          const { animation_url, ...rest } = metadata;
          return rest;
        }

        return { ...metadata, animation_url: action.value };
      });
    case 'setTokenMetadataExternalUrl':
      return batchUpdateMetadata(state, action.files, (metadata) => {
        if (!action.value) {
          const { external_url, ...rest } = metadata;
          return rest;
        }

        return { ...metadata, external_url: action.value };
      });
    case 'setTokenMetadataAttributes': {
      return batchUpdateMetadata(state, action.files, (metadata) => ({
        ...metadata,
        attributes: action.attributes,
      }));
    }
    case 'setGeneratedMetadata': {
      state = produce(state, (draft) => {
        for (const file in action.generated) {
          const image = action.generated[file].image;

          if (image) {
            Volume.setNode(
              draft.volume,
              path.join('/assets/thumbnail', image[0]),
              image[1],
              {
                makeIntermediateDirectories: true,
              },
            );
          }
        }
      });

      return batchUpdateMetadata(
        state,
        Object.keys(action.generated),
        (metadata, name) => {
          const { image, attributes } = action.generated[name];

          return {
            ...metadata,
            image: image
              ? path.join('/assets/thumbnail', image[0])
              : metadata.image,
            attributes: attributes ?? metadata.attributes,
          };
        },
      );
    }
    case 'setTokenMetadataImageFromComputer': {
      const assetName = `/assets/${action.name}`;

      state = produce(state, (draft) => {
        if (!draft.volume) return;

        Volume.writeFile(draft.volume, assetName, createFileData(action.data), {
          makeIntermediateDirectories: true,
        });
      });

      return batchUpdateMetadata(state, action.files, (metadata) => ({
        ...metadata,
        image: assetName,
      }));
    }
    case 'addTokenMetadataAttribute': {
      if (!state.volume) return state;

      const volume = state.volume;

      const metadata = action.files
        .map((file) => Volume.readFile(volume, file))
        .map(parseTokenMetadata);

      const attributeNames = new Set<string>();

      metadata.forEach((item) => {
        item.attributes?.forEach((attribute) => {
          attributeNames.add(attribute.trait_type);
        });
      });

      const name = attributeNames.has('Trait')
        ? getIncrementedName('Trait', [...attributeNames.values()])
        : 'Trait';

      return batchUpdateMetadata(state, action.files, (metadata) => ({
        ...metadata,
        attributes: [
          ...(metadata.attributes ? metadata.attributes : []),
          { trait_type: name, value: '' },
        ],
      }));
    }
    case 'removeTokenMetadataAttribute': {
      if (!state.volume) return state;

      return batchUpdateMetadata(state, action.files, (metadata) => ({
        ...metadata,
        attributes: metadata.attributes?.filter(
          (attribute) => attribute.trait_type !== action.attributeName,
        ),
      }));
    }
    case 'setTokenMetadataAttributeName': {
      if (!state.volume) return state;

      return batchUpdateMetadata(state, action.files, (metadata) => ({
        ...metadata,
        attributes: metadata.attributes?.map((attribute) =>
          attribute.trait_type === action.originalAttributeName
            ? { trait_type: action.newAttributeName, value: attribute.value }
            : attribute,
        ),
      }));
    }
    case 'setTokenMetadataAttributeValue': {
      if (!state.volume) return state;

      return batchUpdateMetadata(state, action.files, (metadata) => ({
        ...metadata,
        attributes: metadata.attributes?.map((attribute) =>
          attribute.trait_type === action.attributeName
            ? { trait_type: action.attributeName, value: action.attributeValue }
            : attribute,
        ),
      }));
    }
    case 'moveTokenMetadataAttribute': {
      if (!state.volume) return state;

      return batchUpdateMetadata(state, action.files, (metadata) => {
        const attributes = [...(metadata.attributes ?? [])];

        const index = attributes.findIndex(
          (attribute) => attribute.trait_type === action.attributeName,
        );

        if (index !== -1) {
          moveArrayItem(attributes, index, action.destinationIndex);
        }

        return {
          ...metadata,
          attributes,
        };
      });
    }
    case 'setCollectionSize': {
      if (!state.volume) return state;

      let template: NFTMetadata = {};

      if (action.fileToDuplicate) {
        try {
          template = parseTokenMetadata(
            Volume.readFile(state.volume, action.fileToDuplicate),
          );
        } catch {
          // TODO: Prevent the user from accepting the dialog
          // with an invalid file
        }
      }

      console.log({ action, template });

      const metadataNode = Volume.getNode(state.volume, '/metadata');

      if (metadataNode.type !== 'directory') return state;

      const existingNumbers = new Set(
        Nodes.readDirectory(metadataNode)
          .map((name) => parseInt(name))
          .filter(Number.isInteger),
      );

      const newNodes: [string, Node<FileData>][] = [];

      for (let nextNumber = 0; nextNumber < action.size; nextNumber++) {
        if (existingNumbers.has(nextNumber)) continue;

        const nextFile = `${nextNumber}.token.json`;

        newNodes.push([
          nextFile,
          Nodes.createFile(createFileData(template as FileJSON)),
        ]);
      }

      const clone: typeof metadataNode = {
        type: 'directory',
        metadata: undefined,
        children: {
          ...metadataNode.children,
          ...Object.fromEntries(newNodes),
        },
      };

      return produce(state, (draft) => {
        if (!draft.volume) return;

        Volume.setNode(draft.volume, '/metadata', clone);
      });
    }
  }
}

export function parseTokenMetadata(data: FileData): NFTMetadata {
  if (data.encoding === 'json') {
    return data.value as NFTMetadata;
  }

  let json: NFTMetadata;

  try {
    const string = fileDataToString(data);
    json = JSON.parse(string);
  } catch {
    json = {};
  }

  return json;
}

export function batchUpdateMetadata(
  state: CollectionState,
  files: string[],
  updater: (value: NFTMetadata, name: string) => NFTMetadata,
) {
  if (!state.volume) return state;

  const metadataNode = Volume.getNode(state.volume, ['metadata']);

  if (metadataNode.type !== 'directory') return state;

  const filenames = new Set(files);

  const updatedChildren: Record<string, Node<FileData>> = {};

  for (const name in metadataNode.children) {
    const file = metadataNode.children[name];
    const filePath = `/metadata/${name}`;

    if (file.type !== 'file' || !filenames.has(filePath)) {
      updatedChildren[name] = file;
      continue;
    }

    const metadata = parseTokenMetadata(file.data);

    const data: NFTMetadata = updater(metadata, filePath);

    updatedChildren[name] = {
      type: 'file',
      metadata: undefined,
      data: createFileData(data as FileJSON),
    };
  }

  const clone: Node<FileData> = {
    type: 'directory',
    metadata: undefined,
    children: updatedChildren,
  };

  return produce(state, (draft) => {
    if (!draft.volume) return;

    Volume.setNode(draft.volume, ['metadata'], clone);
  });
}
