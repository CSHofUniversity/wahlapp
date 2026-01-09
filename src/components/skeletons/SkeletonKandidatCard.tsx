//src/components/skeletons/SkeletonKandidatCard.tsx

import Stack from "@mui/material/Stack";
import Skeleton from "@mui/material/Skeleton";

export function SkeletonKandidatCard() {
  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <Stack direction="row" spacing={2}>
        <Skeleton variant="circular" width={72} height={72} />
        <Stack flexGrow={1} spacing={1}>
          <Skeleton variant="text" width="60%" height={28} />
          <Skeleton variant="text" width="40%" height={22} />
        </Stack>
        <Stack direction="row" spacing={1}>
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="circular" width={40} height={40} />
        </Stack>
      </Stack>

      <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
    </Stack>
  );
}
