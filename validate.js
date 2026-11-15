// Two checks of public/admin/config.yml:
// 1. it is a valid Sveltia CMS config (schema.json);
// 2. every content collection (content-collections.ts) and its CMS collection
//    name the same fields, so what an editor saves is what the build reads;
// 3. every group an editor may leave out (`widget: object`, `required: false`)
//    is one the schema takes as `null`, which is how the CMS saves it.
import fs from "node:fs";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import yaml from "yaml";
import contentConfig from "./content-collections.ts";

const schema = JSON.parse(fs.readFileSync("schema.json", "utf8"));
const data = yaml.parse(fs.readFileSync("public/admin/config.yml", "utf8"));

const ajv = new Ajv({ strict: false, allErrors: true });
addFormats(ajv);
const validate = ajv.compile(schema);

if (!validate(data)) {
	console.error(validate.errors);
	process.exit(1);
}

/** A front matter file's Markdown body: `content` to the build, `body` to the CMS. */
const BODY = { build: "content", cms: "body" };

/** A zod schema without its wrappers (optional, default, transform). */
const bare = (type) => {
	let current = type;
	for (;;) {
		const def = current?.def;
		if (!def) return current;
		if (def.type === "optional" || def.type === "default")
			current = def.innerType;
		else if (def.type === "nullable") current = def.innerType;
		else if (def.type === "pipe") current = def.in;
		else return current;
	}
};

/** The fields a zod schema names, nested ones as `parent.child` (a list's items as `parent[].child`). */
const buildFields = (type, prefix = "") => {
	const inner = bare(type);
	if (inner?.def?.type === "array")
		return buildFields(inner.def.element, `${prefix}[]`);
	if (inner?.def?.type !== "object") return prefix ? [prefix] : [];
	const own = prefix ? [prefix] : [];
	return own.concat(
		Object.entries(inner.shape).flatMap(([key, child]) =>
			buildFields(child, prefix ? `${prefix}.${key}` : key),
		),
	);
};

/** The fields a CMS collection names, in the same spelling. */
const cmsFields = (fields, prefix = "") =>
	(fields ?? []).flatMap((field) => {
		const list = field.widget === "list" && field.fields ? "[]" : "";
		const name = `${prefix ? `${prefix}.` : ""}${field.name}${list}`;
		return [name, ...cmsFields(field.fields, name)];
	});

/** The CMS's optional groups, by the same spelling as `cmsFields` (`prices`, `hero.badge`, `cards[].link`). */
const optionalGroups = (fields, prefix = "") =>
	(fields ?? []).flatMap((field) => {
		const list = field.widget === "list" && field.fields ? "[]" : "";
		const name = `${prefix ? `${prefix}.` : ""}${field.name}${list}`;
		const own =
			field.widget === "object" && field.required === false ? [name] : [];
		return own.concat(optionalGroups(field.fields, name));
	});

/** The zod schema of a field named as `cmsFields` spells it (undefined: the schema has none). */
const schemaAt = (type, name) =>
	name.split(".").reduce((current, part) => {
		const key = part.replace("[]", "");
		const child = bare(current)?.shape?.[key];
		return part.endsWith("[]") ? bare(child)?.def?.element : child;
	}, type);

/** A CMS file's path without its language part (`content/pages/{{locale}}/home.yaml`). */
const plainPath = (file) => file.replace("{{locale}}/", "");

const cms = data.collections.flatMap((collection) =>
	collection.files
		? collection.files.map((file) => ({
				label: `${collection.name}/${file.name}`,
				file: plainPath(file.file),
				fields: file.fields,
			}))
		: [
				{
					label: collection.name,
					folder: collection.folder,
					fields: collection.fields,
				},
			],
);

const problems = [];
const matched = new Set();

for (const collection of contentConfig.content) {
	const oneFile = `${collection.directory}/${String(collection.include).replace("**/", "")}`;
	const entry =
		cms.find((item) => item.file === oneFile) ??
		cms.find((item) => item.folder === collection.directory);
	if (!entry) {
		problems.push(
			`"${collection.name}" (${collection.directory}) has no collection in public/admin/config.yml`,
		);
		continue;
	}
	matched.add(entry);
	const build = new Set(
		buildFields(collection.schema).map((name) =>
			name === BODY.build && collection.parser === "frontmatter"
				? BODY.cms
				: name,
		),
	);
	const edited = new Set(cmsFields(entry.fields));
	for (const name of build)
		if (!edited.has(name))
			problems.push(
				`"${name}" is in the schema of "${collection.name}" but not in the CMS collection "${entry.label}"`,
			);
	for (const name of optionalGroups(entry.fields)) {
		const group = schemaAt(collection.schema, name);
		if (group && !group.safeParse(null).success)
			problems.push(
				`"${name}" may be left out in the CMS collection "${entry.label}" (required: false), and is then saved as null, which the schema of "${collection.name}" refuses: use optionalObject() from src/content/helpers.ts`,
			);
	}
	for (const name of edited)
		if (!build.has(name))
			problems.push(
				`"${name}" is in the CMS collection "${entry.label}" but not in the schema of "${collection.name}"`,
			);
}

for (const entry of cms)
	if (!matched.has(entry))
		problems.push(
			`the CMS collection "${entry.label}" has no content collection in content-collections.ts`,
		);

if (problems.length > 0) {
	console.error("The CMS config and the content schemas differ:");
	for (const problem of problems) console.error(`- ${problem}`);
	process.exit(1);
}

console.log("The CMS config is valid and matches the content schemas.");
