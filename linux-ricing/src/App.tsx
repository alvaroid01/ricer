import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Configurator } from "./features/Configurator/Configurator";
import "./styles.css";
import Home from "./pages/Home/Home";
import Resources from "./pages/Resources/Resources";

export default function App() {
  return (
    <Router>
        <h1>Linux Ricer</h1>
            <hr />
            <h2>Resources</h2>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/resources" element={<Resources />} />
      </Routes>
    </Router>
  );
}
