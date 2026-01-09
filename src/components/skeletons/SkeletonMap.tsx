//src/components/skeletons/SkeletonMap.tsx

import Skeleton from "@mui/material/Skeleton";

export function SkeletonMap() {
  return (
    <Skeleton
      variant="rectangular"
      height={300}
      sx={{ borderRadius: 2, mt: 2 }}
    />
  );
}
