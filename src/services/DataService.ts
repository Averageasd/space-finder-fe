/* eslint-disable @typescript-eslint/no-explicit-any */
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { AuthService } from "./AuthService";

export class DataService {

    private authService: AuthService;
    private s3Client: S3Client;

    constructor(authService: AuthService){
        this.authService = authService;

    }

    public async createSpace(name: string, location:string, photo?: File){
        if (photo){
            const uploadUrl = await this.uploadPublicFile(photo);
            console.log(uploadUrl);
        }
        return '123'
    }

    private async uploadPublicFile(file: File){
        const credentials = await this.authService.getTemporaryCredentials();
        console.log(credentials);
        if (!this.s3Client){
            this.s3Client = new S3Client({
                credentials: credentials as any,
                region: 'us-east-1',
                requestChecksumCalculation: "WHEN_REQUIRED"
            });
        }

        const command = new PutObjectCommand({
            Bucket:'datastack-spacephotobucketfd921cb8-yoofz929has2',
            Key: file.name,
            ACL: 'public-read',
            Body: file,
        });

        try{
             await this.s3Client.send(command);  
            return `https://${command.input.Bucket}.s3.us-east-1.amazonaws.com/${command.input.Key}`; 
        }
        catch(error){
            console.log(error);
        }
        
    }

    public isAuthorized(){
        return true;
    }
}