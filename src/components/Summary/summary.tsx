import { Paper, Box, Typography, List, ListItem } from '@mui/material';
import { Summary } from './summaryContent';
import { renderWithMath } from '../../utils/formulas';

// Component to display summary content based on provided IDs


interface SummaryProps {
  ids: string[];
  descriptionVariant?: 'body1' | 'body2' | 'h6' | 'h5' | 'h4';
  contentVariant?: 'body1' | 'body2' | 'h6' | 'h5' | 'h4';
}

export function SummaryContent({ 
  ids, 
  descriptionVariant = 'body1', 
  contentVariant = 'body1' 
}: SummaryProps) {
  const components = Summary.filter(component => ids.includes(component.id));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {components.map((component) => (
        <Paper key={component.id} elevation={6} sx={{ p: 4, backgroundColor: '#f1f5f9' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            {component.title}
          </Typography>
          {component.description && (
            <Typography variant={descriptionVariant} sx={{ mb: 2, color: '#475569' }}>
              {renderWithMath(component.description)}
            </Typography>
          )}
          <List sx={{ listStyleType: 'disc', pl: 4 }}>
            {component.content.map((item, index) => (
              <ListItem key={index} sx={{ display: 'list-item', py: 0.5 }}>
                <Typography variant={contentVariant}>{renderWithMath(item)}</Typography>
              </ListItem>
            ))}
          </List>
        </Paper>
      ))}
    </Box>
  );
}
