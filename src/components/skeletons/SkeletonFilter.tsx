//src/components/skeletons/SkeletonFilter.tsx

import Stack from "@mui/material/Stack";
import Skeleton from "@mui/material/Skeleton";

export function SkeletonFilter() {
  return (
    <Stack spacing={2}>
      <Skeleton variant="rectangular" height={50} sx={{ borderRadius: 2 }} />
      <Skeleton variant="rectangular" height={50} sx={{ borderRadius: 2 }} />
      <Skeleton variant="rectangular" height={50} sx={{ borderRadius: 2 }} />
      <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 2 }} />
    </Stack>
  );
}
