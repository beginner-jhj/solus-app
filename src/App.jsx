import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout.jsx";
import TodaySchedule from "./pages/TodaySchedule.jsx";
import Schedule from "./pages/Schedule.jsx";
import AssistantPage from "./pages/AssistantPage.jsx";
import SigninForm from "./pages/Signin.jsx";
import AskNickname from "./pages/AskNickname.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<TodaySchedule />}></Route>
          <Route path="schedule" element={<Schedule />}></Route>
          <Route path="assistant" element={<AssistantPage />} />
        </Route>
        <Route path="/signin" element={<SigninForm />} />
        <Route path="/survey" element={<AskNickname />} />
      </Routes>
    </Router>
  );
}

export default App;
