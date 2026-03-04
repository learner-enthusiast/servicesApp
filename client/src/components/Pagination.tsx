import React from 'react';
import { Pagination as MuiPagination, Stack } from '@mui/material';

interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

const Pagination: React.FC<Props> = ({ page, totalPages, onChange }) => {
  console.log(totalPages);
  return (
    <Stack alignItems="center" mt={3}>
      <MuiPagination
        count={totalPages}
        page={page}
        onChange={(_, value) => onChange(value)}
        color="primary"
      />
    </Stack>
  );
};

export default Pagination;
