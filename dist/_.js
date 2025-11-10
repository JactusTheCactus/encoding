"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const sass_1 = __importDefault(require("sass"));
const digits = "0123456789abcdefghijklmnopqrstuvwxyz";
let bases = {};
for (let i = 2; i <= digits.length; i++) {
    bases[i] = `[${digits.slice(0, i)}]`;
}
const UNI = js_yaml_1.default
    .load(fs_1.default
    .readFileSync("uni.yml", "utf8"))
    .map(i => {
    return Object.fromEntries(Object.entries(i)
        .map(([k, v]) => [k, String.fromCodePoint(v)]));
});
const ENCODING = [
    ...js_yaml_1.default.load(fs_1.default.readFileSync("encoding.yml", "utf8"))
        .flat(Infinity),
    ...UNI
        .map(i => Object.values(i))
        .flat()
].map(String);
function getLength(base) {
    return ENCODING
        .indexOf(ENCODING
        .at(-1)
        ?? "")
        .toString(base)
        .length;
}
function encode(input, base) {
    return input.replace(/[\S\s]/g, (m) => {
        const idx = ENCODING.indexOf(m);
        return (idx === -1
            ? 0
            : idx)
            .toString(base)
            .toUpperCase()
            .padStart(getLength(base), "0");
    });
}
function decode(input, base) {
    const baseNum = bases[base];
    input = input.replace(new RegExp(`${baseNum}{${getLength(base)}}`, "gi"), (m) => ENCODING[parseInt(m, base)] ?? m);
    for (let i = UNI.length - 1; i >= 0; i--) {
        Object.entries(UNI[i])
            .forEach(([k, v]) => {
            input = input.replace(new RegExp(`${k}${"_".repeat(i + 1)}`, "g"), v);
        });
    }
    return input;
}
function FMT(input, base) {
    const e = encode(input, base);
    const d = decode(e, base);
    return { e, d };
}
if (process.env.FILE) {
    const IN = fs_1.default.readFileSync(process.env.FILE, "utf8")
        .replace(/\.\.\/dist\/(.*?)/g, (_, m) => m);
    const OUT = FMT(IN, 2).d;
    fs_1.default.writeFileSync(process.env.FILE, OUT);
}
else {
    const IN = process.env.DATA;
    fs_1.default.mkdirSync("encoded");
    const OUT = [];
    Object.keys(bases)
        .map(Number)
        .forEach((b) => {
        const base = b;
        const out = FMT(IN, base);
        const RADIX = "0".repeat(2 - `${base}`.length) + base;
        fs_1.default.writeFileSync(`encoded/${RADIX}`, out.e);
        OUT.push(`${RADIX}: ${out.e}`);
    });
    fs_1.default.writeFileSync("encoded.log", OUT.join("\n"));
    fs_1.default.writeFileSync("test.html", [
        "`" + FMT(IN, 2).e + "`",
        "*".repeat(FMT(IN, 2).e.length),
        "<style>",
        sass_1.default.compileString(`
body {
	font:
		20pt
		"Noto Sans",
		sans-serif;
	ul {
		li {
			font-family:
				"Fira Code",
				monospace;
		}
	}
	table {
		text-align:
			center;
		width:
			100%;
		th {
			&::after {
				content:
					":";
			}
			font-weight:
				bold;
		}
		td {
			&.y {
				font-weight:
					bold;
				color:
					#888;
			}
			&.none {
				font-style:
					italic;
			}
		}
	}
}
`, {})
            .css
            .trim(),
        "</style>",
        "<body>",
        `
<ul>
	<li>
		.y
		<ol>
			<li>Has an ASCII form</li>
			<li>
				May or may not fully replace ASCII form
				<ul>
					<li>
						Letters that fully replace ASCII forms make the same sound
						<ul>
							<li>
								Long S (\u{17F}) === S.
								Long S has no Majuscule form;
								Majuscule S remains, while Minuscule s is fully replaced
							</li>
							<li>Wynn (\u{1F7}\u{1BF}) === W</li>
						</ul>
					</li>
					<li>
						Otherwise, they make similar, but different sounds
						<ul>
							<li>
								Ash (\u{C6}\u{E6}) === Ae;
								Ash (\u{C6}\u{E6}) !== A
							</li>
							<li>
								Eth (\u{D0}\u{F0}) === Dh;
								Eth (\u{D0}\u{F0}) !== D
							</li>
							<li>
								Schwa (\u{18F}\u{259}) !== E
							</li>
							<li>
								Eng (\u{14A}\u{14B}) === Ng;
								Eng (\u{14A}\u{14B}) !== N
							</li>
							<li>
								Ethel (\u{152}\u{153}) === Oe;
								Ethel (\u{152}\u{153}) !== O
							</li>
							<li>
								Thorn (\u{DE}\u{FE}) === Th;
								Thorn (\u{DE}\u{FE}) !== T
							</li>
							<li>
								Zhed (\u{1B7}\u{292}) === Zh;
								Zhed (\u{1B7}\u{292}) !== Z
							</li>
						</ul>
					</li>
					<li>
						<q>Xx</q> has alternates that aren't phonetic
						(Majuscule: Dotted Ring, Minuscule: Underdot)
					</li>
				</ul>
			</li>
		</ol>
	</li>
	<li>
		.none
		<ol>
			<li>Has no Non-ASCII form</li>
		</ol>
	</li>
</ul>
`.trim(),
        FMT(IN, 36).d
            .replace(/\[(.)\]( .*)?$/gm, (_, m1, m2) => {
            const text = [m1, m2].join(" ");
            return `<td class="y">${text}</td>`;
        })
            .replace(/\[(.)_\]( .*)?$/gm, (_, m1, m2) => {
            const text = [m1, m2].join(" ");
            return `<td class="none">${text}</td>`;
        })
            .replace(/(\S*?)<td class="(y|none)">(.*?)<\/td>/gm, (_, m1, m2, m3) => `<td class=${m2}>${m1}${m3}</td>`)
            .replace(/\{(.*?)\}\s*(\(.*?\))/gm, (_, m1, m2) => `<th>${m1} <i>${m2}</i></th>`),
        "</body>"
    ].join("\n"));
}
