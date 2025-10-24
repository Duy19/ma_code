import { IconButton } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import { Link } from "react-router-dom";

// Home button that links to the main page
export default function HomeButton() {
  return (
    <IconButton
      component={Link}
      to="/"
      color="primary"
      sx={{
        position: "fixed",
        top: 16,
        left: 16,
        bgcolor: "background.paper",
        boxShadow: 1,
        "&:hover": { bgcolor: "background.paper" },
      }}
    >
      <HomeIcon />
    </IconButton>
  );
}
