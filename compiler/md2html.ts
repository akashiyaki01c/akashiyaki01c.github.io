import { RenderOptions, render } from "jsr:@deno/gfm@0.6";
import * as Path from "https://deno.land/std@0.223.0/path/mod.ts";
import * as fs from 'https://deno.land/std@0.55.0/fs/mod.ts'
import {slug} from "npm:github-slugger@^2.0";

/** deno-gfmに食わせる用のオプション */
const options: RenderOptions = {
	allowMath: true,
	allowedTags: ["*"],
	allowedClasses: {
		"table": ["sticky"],
	},
	disableHtmlSanitization: true
};
const decoder = new TextDecoder("utf-8");

/** 一つのmarkdownファイルが持つデータ */
export type MarkdownFileData = {
	headerTitle: string,
	headerPankuzu: string[],
	body: string,
};
/** パンくずリスト内の1要素が持つデータ */
type Pankuzu = {name: string, path: string};

/** Markdownファイルのヘッダ行からタイトルを取得する関数 */
function getHeaderTitle(headerText: string) {
	return headerText?.split(";")[0];
}
/** Markdownファイルのヘッダ行からパンくずリストを取得する関数 */
function getHeaderPankuzu(headerText: string, isIndex: boolean): Pankuzu[] {
	const headerPankuzu = headerText?.split(";")[1];
	if (!headerPankuzu) { return []; }
	const pankuzus = headerPankuzu.split("/").map(v => v.trim()).reverse();
	const result: Pankuzu[] = [];
	
	if (isIndex) {
		result.push({name: pankuzus[0], path: "javascript:void"});
		pankuzus.slice(1).forEach((_v, i) => {
			result.push({
				name: pankuzus[i+1],
				path: "../".repeat(i+1)
			});
		});
		return result.reverse();
	} else {
		result.push({name: pankuzus[0], path: "javascript:void"});
		result.push({name: pankuzus[1], path: "./"});
		pankuzus.slice(2).forEach((_v, i) => {
			result.push({
				name: pankuzus[i+2],
				path: "../".repeat(i+1)
			});
		});
		return result.reverse();
	}
}
/** パンくずリストをHTML stringに変換する関数 */
function getPankuzuHtml(pankuzu: Pankuzu[]): string {
	return pankuzu.map(v => `<li><a href="${v.path}">${v.name}</a></li>`).join("");
}
/** 元となるHTML文字列から、完全なHTML文字列を取得する関数 */
export function compileFromHtml(header: string, body: string, asideHeader: string, isIndex: boolean): string {
	const mdTitle = getHeaderTitle(header);
	const mdPankuzu = getHeaderPankuzu(header, isIndex);

	const templetePath = Path.resolve(import.meta.dirname!, "./templete.html");

	const html = decoder.decode(Deno.readFileSync(templetePath))
		.replaceAll("${mdTitle}", mdTitle)
		.replaceAll("${pankuzu}", getPankuzuHtml(mdPankuzu))
		.replaceAll("${body}", body)
		.replaceAll("${aside_header}", asideHeader);
	return html;
}
/** 元となるMarkdown文字列から、完全なHTML文字列を取得する関数 */
export function compileFromMarkdown(header: string, body: string, isIndex: boolean): string {
	const mdBody = render(body, options);
	return compileFromHtml(header, mdBody, getTocHtml(body), isIndex);
}
/** Markdown/HTMLファイルから、ヘッダ行とボディ行を分割して返す関数 */
function getHeaderAndBody(file: string): {header: string, body: string} {
	const mdRows = file.split("\n");
	const header = mdRows[0];
	const body = mdRows.slice(1).join("\n");
	return {header, body};
}
/** Markdownファイルから完全なHTMLファイルに変換する関数 */
function mdFileToHtmlFile(mdFilePath: string, htmlFilePath: string) {
	const file = Deno.readTextFileSync(mdFilePath);
	const { header, body } = getHeaderAndBody(file);
	const isIndex = mdFilePath.endsWith("index.md");

	const html = compileFromMarkdown(header, body, isIndex);

	fs.ensureDirSync(Path.dirname(htmlFilePath))
	Deno.writeTextFileSync(htmlFilePath, html);
}
/** HTMLファイルから完全なHTMLファイルに変換する関数 */
function htmlFileToHtmlFile(mdFilePath: string, htmlFilePath: string) {
	const file = Deno.readTextFileSync(mdFilePath);
	const { header, body } = getHeaderAndBody(file);
	const isIndex = mdFilePath.endsWith("index.html");

	const html = compileFromHtml(header, body, "", isIndex);

	fs.ensureDirSync(Path.dirname(htmlFilePath));
	Deno.writeTextFileSync(htmlFilePath, html);
}
/** ファイルをコンパイルして完全なHTMLファイルに変換する関数 */
export function compileFile(filePath: string) {
	const toFilePath = Path.resolve(import.meta.dirname || "", "../", filePath.replace("markdowns/", "output/").replace(".md", ".html"));
	console.log(filePath, toFilePath);
	switch (Path.extname(filePath)) {
		case ".md": {
			mdFileToHtmlFile(filePath, toFilePath);
			break;
		}
		case ".html": {
			htmlFileToHtmlFile(filePath, toFilePath);
			break;
		}
		case ".css": {
			fs.ensureDirSync(Path.dirname(toFilePath));
			const cssString = Deno.readFileSync(filePath);
			Deno.writeFileSync(toFilePath, cssString);
			break;
		}
		default: {
			fs.ensureDirSync(Path.dirname(toFilePath));
			Deno.writeFileSync(toFilePath, Deno.readFileSync(filePath));
			break;
		}
	}
}

type HeaderElement = {
	header: number,
	text: string
};

/** Markdown文字列から目次のHTMLを生成する関数 */
function getTocHtml(markdownText: string): string {
	const headerText = getHeaderTexts(markdownText);
	return headerText
		.map(v => `<div class="header-${v.header}"><a href="#${slug(v.text || "")}">${v.text}</a></div>`)
		.join("");
}
/** Markdown文字列からh1..h6要素を抽出する関数 */
function getHeaderTexts(markdownText: string): HeaderElement[] {
	const rows = markdownText.split("\n");
	const headerRows = rows
		.filter(v => /^#{1,6}/.test(v))
		.map(v => v.match(/^(?<headerText>#{1,6}) (?<text>.*)/)?.groups)
		.filter(v => v)
		.map(v => {return {header: v?.headerText.length, text: v?.text}})
		.filter(v => v.header && v.text) as HeaderElement[];
	return headerRows;
}