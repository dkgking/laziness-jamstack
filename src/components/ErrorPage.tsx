import { useLingui } from "@lingui/react";
import { type ErrorComponentProps, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppLayout } from "#/layouts/AppLayout";
import { LocalizedLink } from "#/libs/i18n";

/**
 * An error thrown while a route loads or renders (the router's
 * defaultErrorComponent). The error's own message shows only in development,
 * so a server's details never reach visitors.
 */
export function ErrorPage({ error }: ErrorComponentProps) {
	const { i18n } = useLingui();
	const router = useRouter();

	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<AppLayout>
			<div className="flex flex-1 flex-col items-center justify-center py-24 text-center">
				<h1 className="text-4xl font-bold">{i18n._("Something went wrong")}</h1>
				<p className="mt-2 text-slate-600">
					{i18n._("This page could not be shown. Try again in a moment.")}
				</p>
				{import.meta.env.DEV && (
					<pre className="mt-6 max-w-full overflow-x-auto rounded-lg bg-slate-100 p-4 text-left text-sm text-red-700">
						{error instanceof Error ? error.message : String(error)}
					</pre>
				)}
				<div className="mt-8 flex gap-3">
					<button
						type="button"
						// invalidate() runs the loaders again and resets the error boundary.
						onClick={() => void router.invalidate()}
						className="rounded-lg bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-700"
					>
						{i18n._("Try again")}
					</button>
					<LocalizedLink
						to="/"
						className="rounded-lg border border-slate-300 px-5 py-3 font-medium hover:bg-slate-50"
					>
						{i18n._("Back to home")}
					</LocalizedLink>
				</div>
			</div>
		</AppLayout>
	);
}
