import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface Props {
  color?: string;
  text?: string;
  size?: number;
}

export function ParteiLogo({ color = "#999", text = "?", size = 44 }: Props) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: "50%",
        bgcolor: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontWeight: "bold",
        fontSize: size * 0.4,
      }}
    >
      <Typography>{text}</Typography>
    </Box>
  );
}
