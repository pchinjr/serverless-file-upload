import awsLite from '@aws-lite/client'
import arc from '@architect/functions'
const s3Config = JSON.parse(process.env.ARC_S3RVER_CONFIG || '{}')
const aws = await awsLite({ ...s3Config, plugins: [ import('@aws-lite/s3') ] })

export async function handler(req) {
    try {
        const body = JSON.parse(req.body);
        const decodedFile = Buffer.from(body.file, 'base64');
        const params = {
            "Body": decodedFile,
            "Bucket": process.env.ARC_STORAGE_PUBLIC_FILEUPLOADBUCKET,
            "Key": body.filename,
            "ContentType": body.contentType
        };
        await aws.s3.PutObject(params).then(() => console.log('congrats!'))
        await arc.events.publish({
            name: 'write-metadata',
            payload: { key: body.filename }
        })
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Praise Cage!" }),
        };
    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error uploading file", error: err.message }),
        };
    }

}

