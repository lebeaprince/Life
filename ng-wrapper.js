const { spawnSync } = require("child_process");

const nodeMajor = parseInt(process.versions.node.split(".")[0], 10);
const nodeArgs = [];

if (nodeMajor >= 17) {
  nodeArgs.push("--openssl-legacy-provider");
}

let ngPath;
try {
  ngPath = require.resolve("@angular/cli/bin/ng");
} catch (error) {
  if (error && error.code === "MODULE_NOT_FOUND") {
    let expectedVersion;
    try {
      const pkg = require("./package.json");
      expectedVersion =
        (pkg.devDependencies && pkg.devDependencies["@angular/cli"]) ||
        (pkg.dependencies && pkg.dependencies["@angular/cli"]) ||
        expectedVersion;
    } catch (readError) {
      // Keep the generic message if package.json cannot be read.
    }

    const installHint = expectedVersion
      ? `npm install -D @angular/cli@${expectedVersion}`
      : "npm install -D @angular/cli";
    const installPrefix = expectedVersion
      ? "or install the pinned CLI version:"
      : "or install the CLI directly:";

    console.error(
      [
        "Angular CLI is not installed for this project.",
        "Run `npm install` (ensure dev dependencies are included),",
        `${installPrefix} ${installHint}.`,
      ].join(" ")
    );
    process.exit(1);
  }

  throw error;
}
nodeArgs.push(ngPath, ...process.argv.slice(2));

const result = spawnSync(process.execPath, nodeArgs, { stdio: "inherit" });
process.exit(result.status === null ? 1 : result.status);
