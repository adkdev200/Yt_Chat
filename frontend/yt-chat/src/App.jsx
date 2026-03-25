import { Routes, Route } from "react-router-dom";

import NextPage from "./NextPage";
import YoutubeAIChatHeader from "./YoutubeAIChatHeader";

function App() {
  return (
    <>
    
      <Routes>
        <Route path="/" element={<YoutubeAIChatHeader/>} />
        <Route path="/next" element={<NextPage />} />
      </Routes>
    </>
  );
}

export default App;