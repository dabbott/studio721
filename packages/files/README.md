# Files

We use a custom "file system" implementation to keep a familiar API, while still
using immer-compatible plain JS objects.

## File Data

File data is stored in one of 3 formats:

- `Uint8Array`
- string
- JSON - specifically NFT Metadata JSON

We do this to reduce the perf overhead of encoding/decoding when batch editing
thousands of JSON files.
