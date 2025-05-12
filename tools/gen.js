
	import fs from "fs";
	import utf8 from 'utf8';

	const text = fs.readFileSync("gen/browser/worker.js", "utf-8");
	var bytes = utf8.encode(text);
	const webworker = btoa(bytes);

	const template = fs.readFileSync("src/template.js", "utf-8");

	const source = eval("`" + template + "`")
	fs.mkdirSync("dist", { recursive: true });
	fs.writeFileSync("dist/browser/worker.js", source);

