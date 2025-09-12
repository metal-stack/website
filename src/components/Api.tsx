import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";
import { useColorMode } from "@docusaurus/theme-common";
import { useEffect, useState } from "react";
import versions from "../../versions.json";
import YAML from "yaml";
import * as semver from "semver";

export default function Api() {
  const query = new URLSearchParams(window.location.search);
  const version = query.get("version");
  const { colorMode } = useColorMode();
  const [spec, setSpec] = useState("");

  useEffect(() => {
    const metalApiUrl =
      "https://raw.githubusercontent.com/metal-stack/metal-api/refs/tags";

    getReleaseVectorYaml(version)
      .then(
        (releaseVector) =>
          releaseVector["docker-images"]["metal-stack"]["control-plane"][
            "metal-api"
          ]["tag"],
      )
      .then((metalApiVersion) =>
        fetch(`${metalApiUrl}/${metalApiVersion}/spec/metal-api.json`),
      )
      .then((res) => res.text())
      .then(setSpec);
  }, []);

  return (
    <div key={colorMode}>
      {spec && (
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

async function getReleaseVectorYaml(version: string) {
  if (!version) return;

  let releaseVectorPath =
    "https://raw.githubusercontent.com/metal-stack/releases/refs/";

  switch (version) {
    case "next":
      releaseVectorPath += "heads/master/release.yaml";
      break;
    case "latest":
      releaseVectorPath += `tags/${getLatestRelease()}/release.yaml`;
      break;
    default:
      releaseVectorPath += `tags/${version}/release.yaml`;
  }

  const response = await fetch(releaseVectorPath);
  const yamlString = await response.text();
  return YAML.parse(yamlString);
}

function getLatestRelease(): string {
  let latest = "0.0.0";
  for (let version of versions) {
    if (semver.gt(version, latest)) latest = version;
  }
  return latest;
}
