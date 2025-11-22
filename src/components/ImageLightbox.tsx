import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";

import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

interface Props {
  open: boolean;
  onClose: () => void;
  src: string;
  borderColor: string;
}

export function ImageLightbox({ open, onClose, src, borderColor }: Props) {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          backdropFilter: "blur(12px)",
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 2,
        }}
      >
        {/* ✖ Close Button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: "fixed",
            top: 16,
            right: 16,
            color: "white",
            zIndex: 20,
          }}
        >
          <CloseIcon fontSize="large" />
        </IconButton>

        {/* Bild */}
        <Box
          component="img"
          src={src}
          alt="Kandidatenfoto"
          onClick={(e) => e.stopPropagation()} // verhindert close beim Klick
          sx={{
            maxWidth: "90%",
            maxHeight: "90%",
            borderRadius: "16px",
            border: `6px solid ${borderColor}`,
            boxShadow: "0px 10px 30px rgba(0,0,0,0.5)",
          }}
        />
      </Box>
    </Modal>
  );
}
