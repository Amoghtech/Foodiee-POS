import { useSelector } from "react-redux";
import { Switch, Route, Redirect } from "react-router-dom";
import Auth from "./pages/Auth";
import App from "./App";
import useRefreshToken from "./hooks/useRefreshToken";
import Loader from "./UI/Loaders/Loader";
import "react-toastify/dist/ReactToastify.css";
import useFireBaseInitialise from "./hooks/useFireBaseInitialise";
import { Toaster } from "react-hot-toast";
function Layout() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const refreshToken = useRefreshToken();
  useFireBaseInitialise(isAuthenticated);
  if (refreshToken?.isLoading) {
    return <Loader />;
  }
  return (
    <div className="w-full h-screen overflow-hidden">
      <div className="w-full h-full">
        <Switch>
          {!isAuthenticated && (
            <Route path="/auth" exact>
              <Auth />
            </Route>
          )}
          {isAuthenticated && (
            <Route path="/">
              <App />
            </Route>
          )}
          <Route path="*">
            <Redirect to={isAuthenticated ? "/" : "/auth"} />
          </Route>
        </Switch>
        <Toaster
          toastOptions={{
            style: {
              padding: "16px",
              color: "white",
            },
            success: {
              style: {
                background: "#00b300",
              },
            },
            error: {
              style: {
                background: "red",
              },
            },
          }}
        />
      </div>
    </div>
  );
}

export default Layout;
