import { DOMParser, HTMLDocument, Node, Element } from "jsr:@b-fuze/deno-dom";

export function DomWaker(html: string): string {
	const doc = new DOMParser().parseFromString(html, "text/html");
	headerWaker(doc);
	robotoConvertWaker(doc);

	return doc.documentElement?.outerHTML || "";
}

function headerWaker(doc: HTMLDocument) {
	const h1 = doc.querySelectorAll("h1,h2,h3,h4,h5,h6");
	for (const element of h1) {
		for (const child of element.childNodes) {
			// h1~h6内にあるタグを削除
			if (child.nodeType == Node.ELEMENT_NODE) {
				element.removeChild(child);
			}
		}
	}
}
function robotoConvertWaker(doc: HTMLDocument) {
	for (const element of doc.querySelectorAll("*")) {
		
		if (element.nodeType != Node.ELEMENT_NODE) {
			continue;
		}
		if (!hasOnlyTextNodes(element)) {
			continue;
		}
		// スペースでsplitし、英語のみならRobotoを適用
		const resultHtml = [];
		const splitted = element.innerText.split(" ");
		for (const word of splitted) {
			if (isAsciiOnly(word)) {
				resultHtml.push(`<span class="english">${word}</span>`);
			} else {
				resultHtml.push(`<span class="japanese">${word}</span>`);
			}
		}
		element.innerHTML = resultHtml.join(" ");
	}
	function isAsciiOnly(word: string) {
		const asciiOnlyRegex = /^[\x20-\x7F]+$/;
		return asciiOnlyRegex.test(word);
	}
	function hasOnlyTextNodes(element: Element): boolean {
		if (!element.hasChildNodes())
			return false;
		return Array.from(element.childNodes).every(
			(node) => node.nodeType === Node.TEXT_NODE
		);
	}
	
}