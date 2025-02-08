let destData = {};

const _select = (v) => {
	const visibleNonExist = true;
	const diff = (v.diff || false) ? `${v.x},${v.y};${v.sideX},${v.sideY}` : `${v.x},${v.y}`;

	if (v.neverDisplay) {
		return;
	}
	if (v.hr) {
		return `<hr>`
	}
	if (v.nonExist && visibleNonExist) {
		return `<option value="${diff}">${v.name}</option>`
	}
	if (!v.disabled) {
		return `<option value="${diff}">${v.name}</option>`
	} else {
		return `<option value="${diff}" disabled>${v.name}</option>`
	}
};

async function drawSelectSeishin() {
	let str = destData.seishin.map(_select).join("\n");			
	document.querySelector("#select-dest").innerHTML = str;
}
async function drawSelectKaigan() {
	let str = destData.kaigan.map(_select).join("\n");			
	document.querySelector("#select-dest").innerHTML = str;
}
(async () => {
	destData = await (await fetch("data/dest.json")).json();
	const data = ["_", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
	let str = data.map((v, i) => `<option value="${i}">${v}</option>`).join("\n");
	document.querySelector("#select-number1").innerHTML = str;
	document.querySelector("#select-number2").innerHTML = str;
	drawSelectSeishin();
})();