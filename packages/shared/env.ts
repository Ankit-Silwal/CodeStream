import { existsSync } from "node:fs";
import { dirname, join, parse } from "node:path";
import { config } from "dotenv";

const findEnvFile = (startDir: string) => {
  let currentDir = startDir;
  const { root } = parse(startDir);

  while (true) {
    const candidate = join(currentDir, ".env");
    if (existsSync(candidate)) return candidate;
    if (currentDir === root) return undefined;
    currentDir = dirname(currentDir);
  }
};

const envPath = process.env.DOTENV_CONFIG_PATH ?? findEnvFile(process.env.INIT_CWD ?? process.cwd());

if (envPath) {
  config({
    path: envPath,
    override: process.env.NODE_ENV !== "production",
  });
}
