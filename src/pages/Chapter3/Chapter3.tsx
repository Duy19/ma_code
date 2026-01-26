import { Box, Container } from '@mui/material';
import { SummaryContent } from "../../components/Summary/summary";

export default function Chapter3() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <h2 className="text-2xl font-semibold">Chapter 3</h2>
        <p className="text-gray-600 mt-2">Suspension & Co</p>
      </Box>
    </Container>
  );
}
