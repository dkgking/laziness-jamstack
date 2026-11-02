import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";

// Every server function runs at build time and is saved as JSON next to the
// pages, so a static host serves it (no /_serverFn requests). Put it LAST in
// each server function's middleware list.
export const staticMiddleware = [staticFunctionMiddleware];
