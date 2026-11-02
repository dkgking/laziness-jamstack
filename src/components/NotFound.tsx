import { useLingui } from "@lingui/react";
import { AppLayout } from "#/layouts/AppLayout";
import { LocalizedLink } from "#/libs/i18n";

/** Unmatched paths and `throw notFound()` (the router's defaultNotFoundComponent). */
export function NotFound() {
	const { i18n } = useLingui();
	return (
		<AppLayout>
			<div className="flex flex-1 flex-col items-center justify-center py-24 text-center">
				<h1 className="text-4xl font-bold">{i18n._("Page not found")}</h1>
				<p className="mt-2 text-slate-600">
					{i18n._("The page you are looking for does not exist.")}
				</p>
				<LocalizedLink
					to="/"
					className="mt-8 rounded-lg bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-700"
				>
					{i18n._("Back to home")}
				</LocalizedLink>
			</div>
		</AppLayout>
	);
}
