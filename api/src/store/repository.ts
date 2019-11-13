import { S3Repository } from "@yingyeothon/repository-s3";
import mem from "mem";

export const getRepository = mem(
  () => new S3Repository({ bucketName: process.env.BUCKET_NAME! })
);
