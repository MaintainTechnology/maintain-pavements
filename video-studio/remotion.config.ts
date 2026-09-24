/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";
import { enableTailwind } from '@remotion/tailwind-v4';

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// Remotion otherwise forwards every value in .env into its browser runtime.
// The Gemini key belongs only to the separate Node generation script.
Config.setDotEnvLocation("./config/render.env");
Config.overrideBundlerConfig(enableTailwind);
