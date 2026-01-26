import { useState, type ReactNode } from "react";
import { Paper, Box, Typography, Button } from "@mui/material";

export interface Definition {
  term: string;
  definition: string;
}

interface DefinitionsBoxProps {
  definitions?: Definition[];
  customContent?: ReactNode;
  title?: string;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export default function DefinitionsBox({
  definitions = [],
  customContent,
  title = "Definitions",
  onCollapsedChange,
}: DefinitionsBoxProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onCollapsedChange?.(newState);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Question Mark Button */}
      <Button
        onClick={handleToggle}
        variant="contained"
        sx={{
          minWidth: 35,
          width: 35,
          height: 35,
          borderRadius: '50%',
          fontSize: '16px',
          fontWeight: 'bold',
          backgroundColor: '#3b82f6',
          color: 'white',
          '&:hover': {
            backgroundColor: '#2563eb',
          },
        }}
      >
        ?
      </Button>

      {/* Dropdown Panel */}
      {isOpen && (
        <Paper
          elevation={6}
          sx={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 1,
            padding: 2,
            backgroundColor: '#f1f5f9',
            minWidth: 280,
            maxWidth: 350,
            maxHeight: 400,
            overflowY: 'auto',
            animation: 'slideDown 0.3s ease-out',
            '@keyframes slideDown': {
              from: {
                opacity: 0,
                transform: 'translateY(-10px)',
              },
              to: {
                opacity: 1,
                transform: 'translateY(0)',
              },
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-8px',
              right: '16px',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderBottom: '8px solid #f1f5f9',
            },
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            {title}
          </Typography>
          
          {customContent ? (
            customContent
          ) : (
            <Box>
              {definitions.map((def, index) => (
                <Box key={index} sx={{ marginBottom: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#1f2937' }}>
                    {def.term}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#475569', mt: 0.5 }}>
                    {def.definition}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
}
