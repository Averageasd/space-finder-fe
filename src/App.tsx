import { useState } from 'react'
import './App.css'
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom'
import NavBar from './components/NavBar'

function App() {
  
  const [userName, setUserName] = useState<string | undefined>(undefined);

  const router = createBrowserRouter([
    {
      element: (
        <>
          <NavBar userName={userName}/>
          <Outlet />
        </>
      ),
      children:[
        {
          path: "/",
          element: <div>Hello world!</div>,
        },
        {
          path: "/login",
          element: <div>Login page</div>,
        },
        {
          path: "/profile",
          element: <div>Profile page</div>,
        },
        {
          path: "/createSpace",
          element: <div>Create page</div>,
        },
        {
          path: "/spaces",
          element: <div>Space page </div>,
        },
      ]
    },
  ]);

  return (
    <div className="wrapper">
      <RouterProvider router={router} />
    </div>
  )
}

export default App
