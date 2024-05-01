import arc from '@architect/functions'
export const handler = arc.events.subscribe(snsHandler)
let client = await arc.tables()
let FileMetadataTable = client.FileMetadataTable

async function snsHandler(event) {
  let fileMetadata = await FileMetadataTable.put({
    FileId: event.key,
    UploadDate: new Date().toISOString(),
    SyntheticKey: "FileUpload",
  })
  return
}