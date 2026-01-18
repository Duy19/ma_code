import { ThemeProvider, CssBaseline } from "@mui/material";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import theme from "./theme";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import FreeScheduler from "./pages/FreeScheduler";
import Chapter1_1 from "./pages/Chapter1/Chapter1_1";
import Chapter1_2 from "./pages/Chapter1/Chapter1_2";
import Chapter1_3 from "./pages/Chapter1/Chapter1_3";
import Chapter1_4 from "./pages/Chapter1/Chapter1_4";
import Chapter1_5 from "./pages/Chapter1/Chapter1_5";
import Chapter1_6 from "./pages/Chapter1/Chapter1_6";
import Chapter1_Fixed from "./pages/Chapter1/Chapter1_Fixed";
import Chapter2_1 from "./pages/Chapter2/Chapter2_1";
import Chapter3 from "./pages/Chapter3";
import Tutorial from "./pages/Tutorial/Tutorial";
import Tutorial2 from "./pages/Tutorial/Tutorial2";
import Tutorial3 from "./pages/Tutorial/Tutorial3";

function App() {
  return ( 
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="freeScheduler" element={<FreeScheduler />} />
            <Route path="chapter1_1" element={<Chapter1_1 />} />
            <Route path="chapter1_2" element={<Chapter1_2 />} />
            <Route path="chapter1_3" element={<Chapter1_3 />} />
            <Route path="chapter1_4" element={<Chapter1_4 />} />
            <Route path="chapter1_5" element={<Chapter1_5 />} />
            <Route path="chapter1_6" element={<Chapter1_6 />} />
            <Route path="chapter1_fixed" element={<Chapter1_Fixed />} />
            <Route path="chapter2_1" element={<Chapter2_1 />} />
            <Route path="chapter3" element={<Chapter3 />} />
            <Route path="tutorial" element={<Tutorial />} />
            <Route path="tutorial2" element={<Tutorial2 />} />
            <Route path="tutorial3" element={<Tutorial3 />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider> 
  );
}

export default App;
