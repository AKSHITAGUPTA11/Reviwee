// App.tsx
import { Provider } from "react-redux";
import PageRoutes from "./PageRoutes";
import { Toaster } from "react-hot-toast";
import store from "./redux/store";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GOOGLE_CLINT_ID } from "./utils/constants";

const App = () => {


  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLINT_ID}>
      <Provider store={store}>
          <PageRoutes />
      </Provider>
      <Toaster position="top-center" />
    </GoogleOAuthProvider>
  );
};

export default App;
