#!/usr/bin/env node
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";

const bundledNodeDir =
  "/Users/rajatgupta/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin";
const pathParts = [];

if (existsSync(`${bundledNodeDir}/node`)) pathParts.push(bundledNodeDir);
if (process.env.PATH) pathParts.push(process.env.PATH);

const child = spawn(
  "pnpm",
  ["dlx", "--allow-build=sharp", "mint", ...process.argv.slice(2)],
  {
    env: {
      ...process.env,
      PATH: pathParts.join(":"),
    },
    stdio: "inherit",
  },
);

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
