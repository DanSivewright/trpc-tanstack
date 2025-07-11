// app/client.tsx
/// <reference types="vinxi/types/client" />
import { StartClient } from "@tanstack/react-start"
import { hydrateRoot } from "react-dom/client"

import { createRouter } from "./router"

const router = createRouter()

// @ts-ignore
hydrateRoot(document, <StartClient router={router} />)
