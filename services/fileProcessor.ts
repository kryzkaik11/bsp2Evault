import { AppFile, FileStatus } from '../types';

type ProgressCallback = (file: AppFile) => void;

// This is a MOCK service. In a real application, this would trigger a cloud function
// and receive updates via WebSockets, Server-Sent Events, or polling from Supabase Storage.
export const processFile = (file: AppFile, onProgress: ProgressCallback): void => {
  const steps = [
    { status: FileStatus.Uploading, duration: 2000, progress: 25 },
    { status: FileStatus.Scanning, duration: 1500, progress: 50 },
    { status: FileStatus.Processing, duration: 4000, progress: 75 },
    { status: FileStatus.Ready, duration: 500, progress: 100 },
  ];

  let promiseChain = Promise.resolve();
  let cumulativeDelay = 0;

  steps.forEach(step => {
    promiseChain = promiseChain.then(() => {
      cumulativeDelay += step.duration;
      return new Promise(resolve => {
        setTimeout(() => {
          onProgress({ ...file, status: step.status, progress: step.progress });
          resolve();
        }, step.duration);
      });
    });
  });

  promiseChain.catch(error => {
    console.error("Processing error:", error);
    onProgress({ ...file, status: FileStatus.Error, progress: file.progress });
  });
};
