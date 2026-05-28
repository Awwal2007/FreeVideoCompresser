const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIyODUzYjQxZS00MjI2LTRhNDctYTdmZC04Njg0MGNiMDBmMGQiLCJlbWFpbCI6ImF3d2Fsc2FtaW51OUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMjA1NGJiM2Q5NDg4YjVmN2M0OWEiLCJzY29wZWRLZXlTZWNyZXQiOiIxOTg4YzFjMTY0ZmI5YjAwODc4MzlmZGEzNzc2Y2E3YzM3NzBjYzQ4MTQ1ZGQwMmIyZTQ1NWVhZmRiYTc4MTU3IiwiZXhwIjoxODExNDU5MzYzfQ.97ftxaQY4xwyqbMfb3CeQLfSiJjy78rqNy84bkZC3LQ';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface UploadResult {
  token: string;
  success: boolean;
}

/**
 * Upload a file to Pinata IPFS directly from the browser,
 * then register the CID with the backend to get a processing token.
 * This bypasses Vercel's 4.5MB body size limit.
 */
export function uploadFile(
  file: File,
  onProgress: (progress: number) => void
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    // Step 1: Upload directly to Pinata IPFS
    const formData = new FormData();
    formData.append('file', file);

    const metadata = JSON.stringify({ name: file.name });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({ cidVersion: 0 });
    formData.append('pinataOptions', options);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        // Upload to Pinata is 0-90%, registering with backend is 90-100%
        const percent = Math.round((event.loaded / event.total) * 90);
        onProgress(percent);
      }
    });

    xhr.addEventListener('load', async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const pinataResponse = JSON.parse(xhr.responseText);
          const cid = pinataResponse.IpfsHash;

          onProgress(92);

          // Step 2: Register the CID with our backend
          const backendResponse = await fetch(`${API_URL}/api/upload/from-pinata`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cid,
              originalName: file.name,
              fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`
            })
          });

          if (!backendResponse.ok) {
            const errData = await backendResponse.json().catch(() => ({}));
            throw new Error(errData.error || 'Failed to register file with backend');
          }

          const data = await backendResponse.json();
          onProgress(100);
          resolve(data);
        } catch (error: any) {
          reject(new Error(error.message || 'Failed to process upload'));
        }
      } else {
        reject(new Error(`Pinata upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during file upload'));
    });

    xhr.open('POST', 'https://api.pinata.cloud/pinning/pinFileToIPFS', true);
    xhr.setRequestHeader('Authorization', `Bearer ${PINATA_JWT}`);
    xhr.send(formData);
  });
}

/**
 * Upload multiple files, returning an array of results.
 */
export async function uploadFiles(
  files: File[],
  onFileProgress: (fileIndex: number, progress: number) => void
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const result = await uploadFile(files[i], (progress) => {
      onFileProgress(i, progress);
    });
    results.push(result);
  }
  
  return results;
}
