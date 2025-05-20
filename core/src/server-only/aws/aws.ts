import fs from "fs";

import parquetjs from "@dsnp/parquetjs";
import { ClientS3 } from "@dsnp/parquetjs/dist/lib/declare";
import AWS from "aws-sdk";
import fileUpload from "express-fileupload";

export type AWSFile = { key: string; lastModified: Date };
export type AWSConfig = {
  accessKeyId: string;
  secretAccessKey: string;
  httpOptions: {
    timeout: number;
    connectTimeout: number;
  };
  maxRetries: number;
};
type Parquet = {
  [key: string]: bigint | string | Date;
};

export const CSV_SEPARATOR = ",";

// TODO: Depreciate these constants
export const MERGED_CSV_BUCKET = "coty-raw-data-merged-per-app";
export const FORECAST_S3_BUCKET = "ml-forecast-ltv";
export const LUMOS_LTV_FORECAST = "lumos-ltv-forecast";
export const PROCESSED_DATA_BUCKET_NAME = "processed-raw-data";
export const TOOLS_S3_BUCKET = "lumos-tools";

export enum BucketNames {
  PROCESSED_DATA = "processed-raw-data",
  MERGED_CSV = "coty-raw-data-merged-per-app",
  FORECAST_S3 = "ml-forecast-ltv",
  LUMOS_LTV_FORECAST = "lumos-ltv-forecast",
  TOOLS = "lumos-tools",
}

const TIMEOUT_FIFTEEN_MINUTES = 15 * 60 * 1000;

const parisBucketList = [
  MERGED_CSV_BUCKET,
  "ben-ios-raw-data",
  "day-count-raw-data",
  "dct-android-raw-data",
  "dsr-ios-raw-data",
  "lwp-raw-data",
  "wbn-and-raw-data",
  "wbn-ios-raw-data",
];

export class KAWS {
  private config: AWSConfig;
  constructor(accessKeyId: string, secretAccessKey: string) {
    this.config = {
      accessKeyId,
      secretAccessKey,
      httpOptions: {
        timeout: TIMEOUT_FIFTEEN_MINUTES,
        connectTimeout: TIMEOUT_FIFTEEN_MINUTES,
      },
      maxRetries: 0,
    };
  }

  private getS3Object(bucketName: string) {
    return new AWS.S3({
      ...this.config,
      region: parisBucketList.includes(bucketName) ? "eu-west-3" : "eu-west-2",
    });
  }

  public async getObject(bucketName: string, fileKey: string) {
    const s3 = this.getS3Object(bucketName);
    return s3
      .getObject({
        Bucket: bucketName,
        Key: fileKey,
      })
      .promise();
  }

  public async getLatestAndOldestFilesInBucket(
    prefix: string,
    bucket: string = MERGED_CSV_BUCKET,
    fileExt: "csv" | "json" | "parquet" = "csv",
    returnEntireFile = false
  ) {
    const { files: lastFiles } = await this.s3ListBucketResult(bucket, prefix);

    // lastFile keys are ["appCode/rawData", "appCode/rawData/lastFile.csv"]
    let lastFile: AWSFile | null = null;
    let oldestFile: AWSFile | null = null;

    const lastCSVFiles = lastFiles.filter(
      (file) => file.key.includes(prefix) && file.key.includes(`.${fileExt}`)
    );

    lastCSVFiles.forEach((file) => {
      if (!lastFile || file.lastModified > lastFile.lastModified) {
        lastFile = file;
      }
      // We keep the 3 oldest merged csv in case one of them is corrupted
      // We only delete CSV when there are at leat 3
      if (lastCSVFiles.length > 2 && !oldestFile) {
        oldestFile = file;
      }
      if (
        lastCSVFiles.length > 2 &&
        oldestFile &&
        file.lastModified < oldestFile.lastModified
      ) {
        oldestFile = file;
      }
    });

    const latestKey = lastFile ? (lastFile as { key: string }).key : null;
    const oldestKey = oldestFile ? (oldestFile as { key: string }).key : null;

    console.log("latest", latestKey);
    console.log("oldest", oldestKey);

    if (returnEntireFile) {
      return { lastFile, oldestFile };
    }

    return { latestKey, oldestKey };
  }

  public async s3ListBucketResult(
    bucketName: string,
    prefix: string,
    lastKey?: string,
    continuationToken?: string
  ) {
    const params = {
      Delimiter: "",
      Prefix: prefix,
      StartAfter: lastKey,
      Bucket: bucketName,
      ContinuationToken: continuationToken,
    };
    const s3 = this.getS3Object(bucketName);
    console.log("params", params);

    let files: AWSFile[] = [];
    const response = await s3.listObjectsV2(params).promise();
    let nextContinuationToken =
      response.IsTruncated && response.NextContinuationToken
        ? response.NextContinuationToken
        : null;

    const contents = response.Contents || [];
    contents.forEach((c) => {
      if (c.Key && c.LastModified) {
        files.push({ key: c.Key, lastModified: c.LastModified });
      }
    });

    while (nextContinuationToken) {
      const { files: nextFiles, continuationToken } =
        await this.s3ListBucketResult(
          bucketName,
          prefix,
          lastKey,
          nextContinuationToken
        );
      nextContinuationToken = continuationToken;
      files = files.concat(nextFiles);
    }

    return {
      files,
      continuationToken:
        response.IsTruncated && response.NextContinuationToken
          ? response.NextContinuationToken
          : null,
    };
  }

  public deleteObject(bucketName: string, key: string) {
    const params = {
      Bucket: bucketName,
      Key: key,
    };
    const s3 = this.getS3Object(bucketName);

    return new Promise((resolve) => {
      s3.deleteObject(params, function (err) {
        if (err) {
          throw new Error("Error deleting old key");
        }
        resolve(null);
      });
    });
  }

  public copyObject(
    oldBucketName: string,
    oldKey: string,
    newKey: string,
    newBucketName: string = oldBucketName
  ) {
    const params = {
      Bucket: newBucketName,
      CopySource: `${oldBucketName}/${oldKey}`,
      Key: `${newKey}`,
    };
    const s3 = this.getS3Object(oldBucketName);

    return new Promise((resolve) => {
      s3.copyObject(params, function (err) {
        if (err) {
          throw new Error("Error copying old key");
        }
        resolve(null);
      });
    });
  }

  public async moveObject(
    oldBucketName: string,
    oldKey: string,
    newKey: string,
    newBucketName: string = oldBucketName
  ) {
    await this.copyObject(oldBucketName, oldKey, newKey, newBucketName);
    await this.deleteObject(oldBucketName, oldKey);
  }

  /**
   * @description Uploads a media to S3
   * @param bucketName Bucket name
   * @param mediaName Media name
   * @param base64Media Media body converted to base 64
   * @param type Media type
   * @return string S3 media URL or error accordingly
   */
  public async uploadMediaToS3(
    bucketName: string,
    mediaName: string,
    file: fileUpload.UploadedFile,
    type: string
  ) {
    const params: AWS.S3.PutObjectRequest = {
      Bucket: bucketName,
      Key: mediaName,
      ContentType: type,
      Body: fs.createReadStream(file.tempFilePath),
    };
    try {
      const s3 = this.getS3Object(bucketName);
      console.log("Uploading media to S3", params.Bucket, params.Key);
      return s3.upload(params).promise();
    } catch (err) {
      console.log("Error uploading video to S3", err);
      throw new Error("Error uploading video to S3");
    }
  }

  public putObject<T>(bucketName: string, key: string, body: T) {
    const params = {
      Body: body,
      Bucket: bucketName,
      Key: key,
    };

    const s3 = this.getS3Object(bucketName);
    console.log("Uploading file to S3", params.Bucket, params.Key);

    return new Promise((resolve) => {
      s3.putObject(params as AWS.S3.PutObjectRequest, function (err) {
        resolve(null);

        if (err) {
          console.log(err);
          throw new Error("Error putting object");
        }
      });
    });
  }

  public getSignedUrl({
    bucketName,
    key,
    operation = "getObject",
    contentType,
    expires = 10,
  }: {
    bucketName: string;
    key: string;
    operation?: "getObject" | "putObject";
    contentType?: string;
    expires?: number;
  }) {
    const params: {
      Bucket: string;
      Key: string;
      Expires: number;
      ContentType?: string;
    } = {
      Bucket: bucketName,
      Key: key,
      Expires: expires,
    };

    if (operation === "putObject") {
      params.ContentType = contentType;
    }
    const s3 = this.getS3Object(bucketName);

    return s3.getSignedUrl(operation, params);
  }

  public async getTextFromS3(bucketName: string, fileKey: string) {
    try {
      const s3File = await this.getObject(bucketName, fileKey);
      if (s3File.Body) {
        // remove whitespaces at the end of the file, usually the EOF newline
        return s3File.Body.toString("utf-8").trim();
      }
      return null;
    } catch (error: unknown) {
      console.log("getTextFromS3", (error as Error).message);
      return null;
    }
  }

  public async getJSONFromS3(bucketName: string, fileKey: string) {
    try {
      const response = await this.getObject(bucketName, fileKey);
      if (response && response.Body) {
        const string = response.Body.toString("utf-8");
        return JSON.parse(string);
      }
      return null;
    } catch (err: unknown) {
      console.log(
        `Error getting file ${fileKey} in bucket ${bucketName}\n`,
        (err as Error).message
      );
      return null;
    }
  }

  async getParquetFromS3(
    bucketName: string,
    fileKey: string
  ): Promise<Parquet[]> {
    const response = await this.getObject(bucketName, fileKey);
    if (response && response.Body) {
      const s3Client = this.getS3Object(bucketName) as unknown as ClientS3;
      const reader = await parquetjs.ParquetReader.openS3(s3Client, {
        Bucket: bucketName,
        Key: fileKey,
      });
      const cursor = reader.getCursor();
      const rows = [];
      let record = null;
      while ((record = await cursor.next())) {
        rows.push(record as Parquet);
      }
      return rows;
    }
    throw new Error("Error getting parquet from S3");
  }
}
