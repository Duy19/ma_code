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
        transition: "all 0.2s",
        "&:hover": { 
          transform: "translateY(-2px)",
          color: "#6366f1",
        },
      }}
    >
      <HomeIcon />
    </IconButton>
  );
}
