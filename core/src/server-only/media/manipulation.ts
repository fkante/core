import { exec } from "node:child_process";

// if we use these more often, put them into core
export function createThumbnail(inputPath: string, outputPath: string) {
  return new Promise((resolve, reject) => {
    exec(
      `ffmpeg -i ${inputPath} -ss 00:00:01.000 -vframes 1 ${outputPath}`,
      (err, stdout, stderr) => {
        if (err) return reject(err);
        resolve(stdout);
      }
    );
  });
}
