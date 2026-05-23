import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import ReviewGeneratorPage from "./screens/ReviewGenerator/ReviewGeneratorPage";
import InsufficientCreditsPage from "./screens/InsufficientCredits/InsufficientCreditsPage";
import { store } from "./redux/store";
const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ReviewGeneratorPage />} />
          <Route path="/no-credits" element={<InsufficientCreditsPage />} />
          <Route path="/:businessId" element={<ReviewGeneratorPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" />
    </Provider>
  );
};

export default App;
