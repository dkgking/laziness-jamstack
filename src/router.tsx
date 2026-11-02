import { setupI18n } from "@lingui/core";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { getGlobalStartContext } from "@tanstack/react-start";
import { ErrorPage } from "./components/ErrorPage";
import { NotFound } from "./components/NotFound";
import { routerWithI18n } from "./libs/i18n";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
	const context = getGlobalStartContext();
	const i18n = context?.i18n ?? setupI18n();

	const router = createTanStackRouter({
		routeTree,
		context: { i18n },
		scrollRestoration: true,
		defaultPreload: "intent",
		defaultNotFoundComponent: NotFound,
		defaultErrorComponent: ErrorPage,
	});

	return routerWithI18n(router, i18n);
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
