import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";
import { useColorMode } from "@docusaurus/theme-common";
import { useEffect, useState } from "react";

export default function Api() {
  const { colorMode } = useColorMode();
  const [ready, setReady] = useState(false);

  // TODO: fetch metal-api spec
  const spec = "{}";

  useEffect(() => {
    // otherwise styling is broken
    setTimeout(() => {
      setReady(true);
    }, 500);
  }, []);

  useEffect(() => {
    // dark mode is only set initially in the ApiReferenceReact component
    // to force a re-render, toggle ready twice
    setReady(false);
    setTimeout(() => {
      setReady(true);
    }, 100);
  }, [colorMode, setReady]);

  return (
    <div>
      {ready && (
        <ApiReferenceReact
          configuration={{
            content: spec,
            theme: "alternate",
            forceDarkModeState: colorMode,
            hideDarkModeToggle: true,
          }}
        />
      )}
    </div>
  );
}
