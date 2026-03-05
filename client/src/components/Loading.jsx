import { Box, CircularProgress } from '@mui/material';
import React from 'react';

const Loading = () => {
  return (
    <Box display="flex" justifyContent="center" mt={5}>
      <CircularProgress />
    </Box>
  );
};

export default Loading;
