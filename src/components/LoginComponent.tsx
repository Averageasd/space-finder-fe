import { SyntheticEvent, useState } from "react";
import { AuthService } from "../services/AuthService";
import { SignInOutput } from "@aws-amplify/auth";
import { Navigate } from "react-router-dom";

type LoginProps = {
  authService: AuthService;
  setUserNameCb: (userName: string) => void;
};

export default function LoginComponent({ authService, setUserNameCb }: LoginProps) {
  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loginSuccess, setLoginSuccess] = useState<boolean>(false);
  const [successfulSignInOutput, setSuccessfulSignInOutput] = useState<object | undefined>(undefined);
  const [showNewPasswordField, setShowNewPasswordField] = useState<boolean>(false);

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    if (userName && password) {
      const loginResponse = await authService.login(userName, password);
      console.log(loginResponse, ' from LoginComponent');
      const userName2 = authService.getUserName();
      if (userName2) {
        setUserNameCb(userName2);
      }

      if (!loginResponse){
        setErrorMessage("invalid credentials");
        return;
      }     

      if ((loginResponse as SignInOutput).nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_PASSWORD') {
            setSuccessfulSignInOutput(loginResponse);
            setPassword('');
            setShowNewPasswordField(true);
      }
      else{
            setLoginSuccess(true);
      }
    } else {
      setErrorMessage("UserName and password required!");
    }
  };

  function renderLoginResult() {
    if (errorMessage) {
      return <label>{errorMessage}</label>;
    }
  }

  const handleSetNewPassword = async(event: SyntheticEvent) => {
    event.preventDefault();
    try{
        const confirmSign = await authService.confirmSignIn(successfulSignInOutput as SignInOutput, password);
        if (confirmSign){
            setLoginSuccess(true);
        }
        else{
            setErrorMessage('please try a password from your initial temporary password');
        }
    }
    catch(error){
        console.log(error);
        setErrorMessage('please try a password from your initial temporary password');
    }
    

  }

  function renderForm(){
    if (!showNewPasswordField){
        return( 
            <div>
                <label>User name</label>
                <input
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                />
                <br />
                <label>Password</label>
                <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                />
                <br />
            </div>
        );
    }
    
    return <div>
        <label>new password</label>
        <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
        />
    </div>
  }

  return (
    <div role="main">
      {loginSuccess && <Navigate to="/profile" replace={true} />}
      <h2>Please login</h2>
      <form onSubmit={(e) => 
        !showNewPasswordField 
        ? handleSubmit(e)
        : handleSetNewPassword(e)}>
        {renderForm()}


        <input type="submit" value="Login" />
      </form>
      <br />
      {renderLoginResult()}
    </div>
  );
}