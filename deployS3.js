import dotenv from "dotenv";
if (process.env["ENV"] === "local") {
    console.log("Loading .env.s3");
    dotenv.config({path: ".env.s3"});
}
import aws from "aws-sdk";
import fs from "fs";


async function main() {
    const s3 = new aws.S3();

    const {BUCKET, KEY} = process.env;

    if (!BUCKET) {
        throw new Error("Bucket not defined");
    }
    if (!KEY) {
        throw new Error("Key not defined");
    }

    const files = ["index.html", "build/index.js"];

    for (const file of files) {
        const key = `${KEY}/${file}`;
        console.log(`Uploading ${file} to bucket ${BUCKET} with key ${key}`);
        await s3.putObject({
            Bucket: BUCKET,
            Key: key,
            Body: fs.readFileSync(file)
        }).promise();
    }

}

main();