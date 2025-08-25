import { signOut } from "@aws-amplify/auth";
import { NavLink, useNavigate } from "react-router-dom";

type NavBarProps = {
  userName: string | undefined;
  setUserNameCb: (userName: string) => void;
};
export default function NavBar({ userName, setUserNameCb }: NavBarProps) {

  const navigate = useNavigate();
  function renderLoginLogout() {
    if (userName) {
      return (
        <NavLink onClick={async()=>{
          await signOut();
          setUserNameCb('');
          navigate('/');
        }} to="/logout">
          {userName}
        </NavLink>
      );
    } else {
      return (
        <NavLink to="/login">
          Login
        </NavLink>
      );
    }
  }

  return (
    <div className="navbar">
      <NavLink to={"/"}>Home</NavLink>
      <NavLink to={"/profile"}>Profile</NavLink>
      <NavLink to={"/spaces"}>Spaces</NavLink>
      <NavLink to={"/createSpace"}>Create space</NavLink>
      {renderLoginLogout()}
    </div>
  );
}