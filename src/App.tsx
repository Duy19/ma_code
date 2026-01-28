import { ThemeProvider, CssBaseline } from "@mui/material";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import theme from "./theme";
import Layout from "./components/General/Layout";
import Home from "./pages/Home";
import FreeScheduler from "./pages/FreeScheduler";
import Chapter1_A from "./pages/Chapter1/Chapter1_A"
import Chapter1_B from "./pages/Chapter1/Chapter1_B"
import Chapter1_C from "./pages/Chapter1/Chapter1_C";
import Chapter1_D from "./pages/Chapter1/Chapter1_D";
import Chapter2_A from "./pages/Chapter2/Chapter2_A";
import Chapter2_B from "./pages/Chapter2/Chapter2_B";
import Chapter2_C from "./pages/Chapter2/Chapter2_C";
import Chapter2_Quiz from "./pages/Chapter2/Chapter2_Quiz";
import Chapter2_DragDrop from "./pages/Chapter2/Chapter2_DragDrop";
import Chapter3 from "./pages/Chapter3/Chapter3";
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
            <Route path="chapter1_A" element={<Chapter1_A />} />
            <Route path="chapter1_B" element={<Chapter1_B />} />
            <Route path="chapter1_C" element={<Chapter1_C />} />
            <Route path="chapter1_D" element={<Chapter1_D />} />
            <Route path="chapter2_A" element={<Chapter2_A />} />
            <Route path="chapter2_B" element={<Chapter2_B />} />
            <Route path="chapter2_C" element={<Chapter2_C />} />
            <Route path="chapter2_Quiz" element={<Chapter2_Quiz />} />
            <Route path="chapter2_dragdrop" element={<Chapter2_DragDrop />} />
            <Route path="tutorial" element={<Tutorial />} />
            <Route path="tutorial2" element={<Tutorial2 />} />
            <Route path="tutorial3" element={<Tutorial3 />} />
            <Route path="chapter3" element={<Chapter3 />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider> 
  );
}

export default App;
