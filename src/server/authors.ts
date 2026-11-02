import { createServerFn } from "@tanstack/react-start";
import { allAuthors } from "content-collections";
import { staticMiddleware } from "./static";

export const listAuthors = createServerFn({ method: "GET" })
	.middleware(staticMiddleware)
	.handler(() => allAuthors.map(({ _meta, ...author }) => author));
