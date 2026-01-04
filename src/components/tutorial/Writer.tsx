import { useEffect, useRef, useState } from "react";
import { Typography } from "@mui/material";
import { marked } from "marked";

interface Props {
  text?: string;
  speed?: number;
}

export default function TypewriterText({
  text = "",
  speed = 15,
}: Props) {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setDisplayed("");
    indexRef.current = 0;

    if (!text) return;

    const typeNext = () => {
      indexRef.current += 1;
      setDisplayed(text.slice(0, indexRef.current));

      if (indexRef.current < text.length) {
        timeoutRef.current = window.setTimeout(typeNext, speed);
      }
    };

    timeoutRef.current = window.setTimeout(typeNext, speed);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, speed]);

  const html = marked.parseInline(displayed);
  return (
    <Typography
      variant="body1"
      sx={{ whiteSpace: "pre-line", minHeight: 24 }}
      dangerouslySetInnerHTML={{ __html: html }}
    >
    </Typography>
  );
}
