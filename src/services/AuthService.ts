import { SignInOutput, fetchAuthSession, signIn, confirmSignIn, getCurrentUser, AuthUser} from "@aws-amplify/auth";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { Amplify } from "aws-amplify";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";

const awsRegion = 'us-east-1';

Amplify.configure({
    Auth:{
        Cognito: {
            userPoolId:'us-east-1_13OprXwIG',
            userPoolClientId:'1oeph4jl9la4lk07pcq2gkh2h8',
            identityPoolId:'us-east-1:c3f74f29-61ef-4c61-9f1b-418b5ec38e43'
        }
    }
});

export class AuthService {
    
    private user: SignInOutput | undefined;
    private userName: string = '';
    private jwtToken: string | undefined;
    private authUser: AuthUser | undefined;
    private temporaryCredentials: object | undefined;

    public alreadyLoggedIn(){
        return this.authUser;
        
    }

    public async login(userName: string, password: string): Promise<object | undefined> {
        try {
            const signInOutput: SignInOutput = await signIn({
                username: userName,
                password: password,
                options: {
                    authFlowType: 'USER_PASSWORD_AUTH'
                }
            });
            console.log(signInOutput);
            this.user = signInOutput;
            this.userName = userName;
            if (signInOutput.isSignedIn){
                this.authUser = await this.getCurrentUser();
                await this.generateIdToken();
            }
            return signInOutput;
        }
        catch(error) {
            console.log('error ', error);
        }
    }

    public async confirmSignIn(nextStep: SignInOutput, newPassword: string){
        try{
             const signIn = await confirmSignIn({
                challengeResponse: newPassword
            });
            if (signIn.isSignedIn){
                await this.generateIdToken();
                this.authUser = await this.getCurrentUser();
            }
            return signIn.isSignedIn;
        }
        catch(error){
            console.log(error);
        }  
    }

    public async getTemporaryCredentials(){
        if (this.temporaryCredentials){
            return this.temporaryCredentials;
        }
        this.temporaryCredentials = await this.generateTemporaryCredentials();
        return this.temporaryCredentials;
    }

    private async generateTemporaryCredentials(){
        const cognitoIdentityPool = `cognito-idp.${awsRegion}.amazonaws.com/us-east-1_13OprXwIG`;
        const cognitoIdentity = new CognitoIdentityClient({
            credentials:fromCognitoIdentityPool({
                clientConfig: {
                    region:awsRegion
                },
                identityPoolId:'us-east-1:c3f74f29-61ef-4c61-9f1b-418b5ec38e43',
                logins:{
                    [cognitoIdentityPool]:this.jwtToken!
                }
            })
        });
        const credentials = await cognitoIdentity.config.credentials();
        return credentials;

    }

    public async generateIdToken(){
        this.jwtToken = (await fetchAuthSession()).tokens?.idToken?.toString();
    }


    public getIdToken(): string{
       return this.jwtToken;
    }



    public getUserName(): string {
        return this.userName;
    }

    public async getCurrentUser() {
        try{
            this.authUser = await getCurrentUser();
            await this.generateIdToken();
            return this.authUser;
        }
        catch(error){
            console.log(error);
            this.authUser = undefined;
            return undefined;
        }
        
    }
}