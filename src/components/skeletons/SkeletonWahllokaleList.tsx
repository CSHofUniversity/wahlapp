//src/components/skeletons/SkeletonWahllokaleList.tsx

import Stack from "@mui/material/Stack";
import Skeleton from "@mui/material/Skeleton";

export function SkeletonWahllokaleList() {
  return (
    <Stack spacing={2}>
      {[1, 2, 3].map((k) => (
        <Skeleton
          key={k}
          variant="rectangular"
          height={80}
          sx={{ borderRadius: 2 }}
        />
      ))}
    </Stack>
  );
}
