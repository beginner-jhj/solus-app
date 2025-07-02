import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout.jsx";
import Home from "./pages/Home.jsx";
import Schedule from "./pages/Schedule.jsx";
import AssistantPage from "./pages/AssistantPage.jsx";
import SigninForm from "./pages/Signin.jsx";
import SurveyPage from "./pages/SurveyPage.jsx";
import MyProfile from "./pages/MyProflie.jsx";
import SettingPage from "./pages/SettingPage.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />}></Route>
          <Route path="schedule" element={<Schedule />}></Route>
          <Route path="assistant" element={<AssistantPage />} />
        </Route>
        <Route path="/signin" element={<SigninForm />} />
        <Route path="/survey" element={<SurveyPage />} />
        <Route path="/my-profile" element={<MyProfile />} />
        <Route path="/setting" element={<SettingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
