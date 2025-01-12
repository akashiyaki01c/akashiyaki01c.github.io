import { compileFile } from "./md2html.ts";

import * as fs from 'https://deno.land/std@0.55.0/fs/mod.ts'
import "npm:prismjs@1.29.0/components/prism-csharp.js";
import "npm:prismjs@1.29.0/components/prism-javascript.js";
import "npm:prismjs@1.29.0/components/prism-rust.js";
import "npm:prismjs@1.29.0/components/prism-sql.js";
import "npm:prismjs@1.29.0/components/prism-typescript.js";

const watcher = Deno.watchFs(".");
console.log("markdown to html compiler. now watching!");

if (Deno.args[0] && Deno.args[0] == "all") {
	try {
		await Deno.remove("./output/", {recursive: true});
	} catch { /* no-op */ };
	for await (const filePath of fs.walk("./markdowns")) {
		if (filePath.isDirectory) {
			continue;
		}
		compileFile(filePath.path);
	}
	Deno.exit();
}

for await (const event of watcher) {
	try {
		const filePath = event.paths[event.paths.length-1];
		
		if (!filePath.includes("markdowns")) {
			continue;
		} else if (event.kind == "remove") {
			continue;
		} else if (!fs.existsSync(filePath)) {
			continue;
		}
		compileFile(filePath);
		console.log(`convert: ${filePath}`);
	} catch (ex) {
		console.log(`error: ${ex}`);
	}

}