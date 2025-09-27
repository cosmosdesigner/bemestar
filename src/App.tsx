import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import ManageLocations from "./pages/ManageLocations";
import Overview from "./pages/Overview";
import Plan from "./pages/Plan";
import { Toaster } from "@/components/ui/sonner";
import "./index.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="plan" element={<Plan />} />
          <Route path="manage" element={<ManageLocations />} />
          <Route path="overview" element={<Overview />} />
        </Route>
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
