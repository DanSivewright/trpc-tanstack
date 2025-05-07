//  @ts-check
import { tanstackConfig } from "@tanstack/eslint-config"
import pluginRouter from "@tanstack/eslint-plugin-router"

export default [...pluginRouter.configs["flat/recommended"], ...tanstackConfig]
