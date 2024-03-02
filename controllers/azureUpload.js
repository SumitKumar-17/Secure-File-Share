const { BlobServiceClient, AnonymousCredential } = require("@azure/storage-blob");
const uniqid = require("uniqid");

 async function uploadFileToAzure(file) {
  const sasUrl = process.env.AZURE_STORAGE_SAS_URL;
  const blobServiceClient = new BlobServiceClient(sasUrl, new AnonymousCredential());

  const containerName = process.env.AZURE_BLOB_STORAGE_CONTAINER_NAME;
  const containerClient = blobServiceClient.getContainerClient(containerName);

  const randomId = uniqid();
  const ext = file.name.split('.').pop();
  const newFilename = randomId + '.' + ext;

  const blockBlobClient = containerClient.getBlockBlobClient(newFilename);

  const chunks = [file.data];

  await blockBlobClient.uploadData(Buffer.concat(chunks), {
    blobHTTPHeaders: { blobContentType: 'application/octet-stream' }
  });

  const link = `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${containerName}/${newFilename}`;

  return { filename: newFilename, link };
}

module.exports={uploadFileToAzure};