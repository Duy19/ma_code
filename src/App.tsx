import { ThemeProvider, CssBaseline } from "@mui/material";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import theme from "./theme";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import FreeScheduler from "./pages/FreeScheduler";
import Chapter1 from "./pages/Chapter1";
import Chapter2 from "./pages/Chapter2";
import Chapter3 from "./pages/Chapter3";
import Tutorial from "./pages/Tutorial";

function App() {
  return ( 
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="freeScheduler" element={<FreeScheduler />} />
            <Route path="chapter1" element={<Chapter1 />} />
            <Route path="chapter2" element={<Chapter2 />} />
            <Route path="chapter3" element={<Chapter3 />} />
            <Route path="tutorial" element={<Tutorial />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider> 
  );
}

export default App;
