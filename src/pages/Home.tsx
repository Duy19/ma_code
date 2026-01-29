import {
  Typography,
  Box,
  Container,
  Card,
  CardContent,
  Grid,
  Stack,
} from "@mui/material";
import { Link } from "react-router-dom";

const chapters = [
  {
    title: "Chapter 1: Scheduling Strategies",
    description: "Introduction to real-time scheduling algorithms",
    sections: [
      { name: "Earliest Deadline First", path: "/chapter1_A" },
      { name: "Fixed-Priority Scheduling", path: "/chapter1_B" },
      { name: "Comparison of EDF, RM, DM", path: "/chapter1_C" },
      { name: "Draw Schedules", path: "/chapter1_D" },
      { name: "Quiz", path: "/chapter1_Quiz" },
    ],
    color: "#6366f1",
  },
  {
    title: "Chapter 2: Scheduling Analysis",
    description: "Analyzing schedulability of real-time tasks",
    sections: [
      { name: "Critical Instant Theorem", path: "/chapter2_A" },
      { name: "Time Demand Analysis", path: "/chapter2_B" },
      { name: "Utilization Bounds", path: "/chapter2_C" },
      { name: "Quiz", path: "/Chapter2_Quiz" },
      { name: "Drag&Drop Game", path: "/Chapter2_DragDrop" },
    ],
    color: "#8b5cf6",
  },
  {
    title: "Chapter 3: Suspension",
    description: "Handling task suspension in real-time systems",
    sections: [
      { name: "What is Suspension?", path: "/chapter3" },
      { name: "Dynamic Suspension Handling", path: "/" },
      { name: "Fragmented Suspension", path: "/" },
      { name: "Quiz", path: "/" },
    ],
    color: "#ec4899",
  },
  {
    title: "Others",
    description: "Additional tools and games",
    sections: [
      { name: "Free Scheduler", path: "/freeScheduler" },
      { name: "Games", path: "/" },
    ],
    color: "#10b981",
  },
];

export default function Home() {
  return (
    <Box
      sx={{
        flex: 1,
        bgcolor: "background.default",
        minHeight: "100vh",
        py: 3,
      }}
    >
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h3"
            fontWeight="700"
            gutterBottom
            sx={{
              background: "linear-gradient(45deg, #6366f1 30%, #ec4899 90%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 1,
            }}
          >
            Real-Time Games
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mb: 2, fontWeight: 300 }}
          >
            Interactive Learning Platform for Real-Time Systems
          </Typography>
        </Box>

        {/* Tutorial Card */}
        <Box sx={{ mb: 1, display: "flex", justifyContent: "center" }}>
          <Card
            component={Link}
            to="/tutorial"
            elevation={0}
            sx={{
              textDecoration: "none",
              maxWidth: 320,
              width: "100%",
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              border: "none",
              transition: "all 0.3s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 12px 28px rgba(99, 102, 241, 0.35)",
              },
            }}
          >
            <CardContent sx={{ py: 1, px: 2, textAlign: "center" }}>
              <Typography
                variant="body1"
                fontWeight="600"
                sx={{ color: "white", mb: 0.1 }}
              >
                Chapter 0: Start Tutorial
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "white", opacity: 0.95, fontWeight: 300, fontSize: "0.8rem" }}
              >
                Introduction to real-time systems
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Table of Contents */}
        <Box>
          <Typography variant="h6" fontWeight="600" gutterBottom sx={{ mb: 1.5 }}>
            Overview
          </Typography>
          <Grid container spacing={2}>
            {chapters.map((chapter, idx) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    border: "1px solid",
                    borderColor: "divider",
                    transition: "all 0.3s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: `0 12px 32px ${chapter.color}25`,
                      borderColor: chapter.color,
                    },
                  }}
                >
                  <Box
                    sx={{
                      height: 6,
                      bgcolor: chapter.color,
                    }}
                  />
                  <CardContent sx={{ p: 2 }}>
                    <Typography
                      variant="body1"
                      fontWeight="600"
                      gutterBottom
                      sx={{ mb: 0.5 }}
                    >
                      {chapter.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1.5 }}
                    >
                      {chapter.description}
                    </Typography>
                    <Stack spacing={1}>
                      {chapter.sections.map((section) => (
                        <Box
                          key={section.path}
                          component={Link}
                          to={section.path}
                          sx={{
                            textDecoration: "none",
                            display: "block",
                            p: 1,
                            borderRadius: 1,
                            border: "1px solid",
                            borderColor: "divider",
                            bgcolor: "background.paper",
                            transition: "all 0.2s",
                            "&:hover": {
                              bgcolor: "action.hover",
                              borderColor: chapter.color,
                              transform: "translateX(4px)",
                            },
                          }}
                        >
                          <Typography
                            variant="body2"
                            fontWeight="500"
                            sx={{ color: "text.primary" }}
                          >
                            {section.name}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}
