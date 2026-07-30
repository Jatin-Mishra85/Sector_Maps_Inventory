const { BlobServiceClient } = require('@azure/storage-blob');

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER || 'uploads';

if (!connectionString) {
  throw new Error('AZURE_STORAGE_CONNECTION_STRING is not set in .env');
}

const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const containerClient = blobServiceClient.getContainerClient(containerName);

async function uploadToAzure(fileBuffer, originalName, mimetype) {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const ext = originalName.substring(originalName.lastIndexOf('.'));
  const blobName = `${uniqueSuffix}${ext}`;

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.uploadData(fileBuffer, {
    blobHTTPHeaders: { blobContentType: mimetype },
  });

  return blockBlobClient.url; // Azure ka full public URL
}

module.exports = { uploadToAzure };