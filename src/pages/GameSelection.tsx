import {
  Card,
  CardContent,
  CardMedia,
  Container,
  Typography,
  Box,
  Fade,
} from "@mui/material";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface GameCard {
  id: string;
  title: string;
  description: string;
  path: string;
  color: string;
  imgPath?: string;
}

const games: GameCard[] = [
  {
    id: "draw-schedules",
    title: "Draw Schedules",
    description:
      "Practice drawing real-time task schedules using different scheduling algorithms. Learn how tasks are scheduled over time.",
    path: "/chapter1_D",
    color: "#259bf0",
    imgPath: new URL("../assets/overlay/drawgame.png", import.meta.url).href,
  },
  {
    id: "deduct-parameters",
    title: "Deduct Parameters",
    description:
      "Analyze and deduce scheduling parameters from given scenarios. Strengthen your understanding of task characteristics.",
    path: "/chapter2_C",
    color: "#7b43fe",
    imgPath: new URL("../assets/overlay/deductgame.png", import.meta.url).href,
  },
  {
    id: "quiz",
    title: "Quiz",
    description:
      "Test your knowledge with comprehensive quizzes covering scheduling algorithms and real-time systems concepts.",
    path: "/chapter1_Quiz",
    color: "#f31081",
    imgPath: new URL("../assets/overlay/drawgame.png", import.meta.url).href,
  },
  {
    id: "drag-drop",
    title: "Drag & Drop",
    description:
      "Interactive game where you arrange and organize scheduling elements. Learn by doing with intuitive drag-and-drop mechanics.",
    path: "/Chapter2_DragDrop",
    color: "#0b26f5",
    imgPath: new URL("../assets/overlay/deductgame.png", import.meta.url).href,
  },
];

const GameSelection = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        py: 8,
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 8, textAlign: "center" }}>
          <Typography
            variant="h3"
            sx={{
              color: "white",
              fontWeight: 800,
              mb: 2,
              letterSpacing: -0.5,
            }}
          >
            Select Your Game
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "rgba(255, 255, 255, 0.9)",
              fontWeight: 300,
              maxWidth: 600,
              mx: "auto",
            }}
          >
            Choose a learning activity to master real-time scheduling
            algorithms
          </Typography>
        </Box>

        {/* Game Cards Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
            gap: 4,
            maxWidth: 1000,
            mx: "auto",
          }}
        >
          {games.map((game, index) => (
            <Fade in timeout={500 + index * 100} key={game.id}>
                <Link
                  to={game.path}
                  style={{ textDecoration: "none" }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      backgroundImage: `linear-gradient(135deg, ${game.color}22 0%, ${game.color}11 100%)`,
                      border: `2px solid ${game.color}33`,
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: `0 20px 40px ${game.color}44`,
                        border: `2px solid ${game.color}66`,
                      },
                    }}
                  >
                    {/* Image */}
                    <CardMedia
                      image={game.imgPath}
                      sx={{
                        height: 160,
                        backgroundSize: "contain",
                        backgroundPosition: "center",
                        backgroundColor: `${game.color}11`,
                      }}
                    />

                    {/* Content */}
                    <CardContent
                      sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 700,
                            color: "#1a202c",
                            mb: 1,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          {game.title}
                          <Box
                            sx={{
                              opacity: 0,
                              transform: "translateX(-8px)",
                              transition:
                                "all 0.3s ease",
                            }}
                            className="game-card-arrow"
                          >
                            <ArrowRight size={20} color={game.color} />
                          </Box>
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#4a5568",
                            lineHeight: 1.6,
                            mb: 3,
                          }}
                        >
                          {game.description}
                        </Typography>
                      </Box>

                      {/* Play Button */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          color: game.color,
                          fontWeight: 600,
                          fontSize: "0.95rem",
                        }}
                      >
                        Play Now
                        <ArrowRight size={18} />
                      </Box>
                    </CardContent>
                  </Card>
                </Link>
              </Fade>
            ))}
        </Box>
      </Container>

      {/* Add hover effect styles */}
      <style>{`
        a:hover .game-card-arrow {
          opacity: 1;
          transform: translateX(4px);
        }
      `}</style>
    </Box>
  );
};

export default GameSelection;
