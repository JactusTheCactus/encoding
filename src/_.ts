import fs from "fs"
import YAML from "js-yaml"
import sass from "sass"
type Enumerate<N extends number, A extends number[] = []> = A['length'] extends N ? A[number] : Enumerate<N, [...A, A['length']]>;
type IntRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>;
type Radix = IntRange<2, 37>;
const digits: string = "0123456789abcdefghijklmnopqrstuvwxyz"
let bases: Record<number, string> = {}
for (let i: number = 2; i <= digits.length; i++) {
	bases[i] = `[${digits.slice(0, i)}]`
}
const UNI: Array<Record<string, string>> = (YAML
	.load(fs
		.readFileSync("uni.yml", "utf8")
	) as Array<Record<string, number>>
)
	.map(i => {
		return Object.fromEntries(
			Object.entries(i)
				.map(([k, v]) => [k, String.fromCodePoint(v)])
		)
	})
const ENCODING: Array<string> = [
	...(
		YAML.load(
			fs.readFileSync("encoding.yml", "utf8")
		) as Array<string>
	)
		.flat(Infinity),
	...UNI
		.map(i => Object.values(i))
		.flat() as string[]
].map(String)
function getLength(base: Radix): number {
	return ENCODING
		.indexOf(ENCODING
			.at(-1)
			?? ""
		)
		.toString(base)
		.length
}
function encode(input: string, base: Radix): string {
	return input.replace(/[\S\s]/g, (m: string): string => {
		const idx = ENCODING.indexOf(m)
		return (idx === -1
			? 0
			: idx
		)
			.toString(base)
			.toUpperCase()
			.padStart(getLength(base), "0")
	})
}
function decode(input: string, base: Radix): string {
	const baseNum: string = bases[base]
	input = input.replace(
		new RegExp(`${baseNum}{${getLength(base)}}`, "gi"),
		(m: string): string => ENCODING[parseInt(m, base)] ?? m
	)
	for (
		let i = UNI.length - 1;
		i >= 0;
		i--
	) {
		Object.entries(UNI[i])
			.forEach(([k, v]: [string, string]): void => {
				input = input.replace(new RegExp(`${k}${"_".repeat(i + 1)}`, "g"), v)
			})
	}
	return input
}
function FMT(input: string, base: Radix): Record<"e" | "d", string> {
	const e: string = encode(input, base)
	const d: string = decode(e, base)
	return { e, d }
}
if (process.env.FILE) {
	const IN: string = fs.readFileSync(process.env.FILE, "utf8")
		.replace(/\.\.\/dist\/(.*?)/g, (_, m) => m)
	const OUT: string = FMT(IN, 2).d
	fs.writeFileSync(process.env.FILE, OUT)
} else {
	const IN: string = process.env.DATA
	fs.mkdirSync("encoded")
	const OUT: Array<string> = []
	Object.keys(bases)
		.map(Number)
		.forEach((b: number): void => {
			const base: Radix = b as Radix
			const out: Record<"e" | "d", string> = FMT(IN, base)
			const RADIX: string = "0".repeat(2 - `${base}`.length) + base
			fs.writeFileSync(`encoded/${RADIX}`, out.e)
			OUT.push(`${RADIX}: ${out.e}`)
		})
	fs.writeFileSync("encoded.log", OUT.join("\n"))
	fs.writeFileSync("test.html", [
		// "`" + FMT(IN, 36).e + "`",
		// "*".repeat(FMT(IN, 36).e.length),
		"<style>",
		sass.compileString(`
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
							<li>Yogh (\u{21C}\u{21D}) === G</li>
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
				const text = [m1, m2].join(" ")
				return `<td class="y">${text}</td>`
			})
			.replace(/\[(.)_\]( .*)?$/gm, (_, m1, m2) => {
				const text = [m1, m2].join(" ")
				return `<td class="none">${text}</td>`
			})
			.replace(/(\S*?)<td class="(y|none)">(.*?)<\/td>/gm, (_, m1, m2, m3) => `<td class=${m2}>${m1}${m3}</td>`)
			.replace(/\{(.*?)\}\s*(\(.*?\))/gm, (_, m1, m2) => `<th>${m1} <i>${m2}</i></th>`),
		"</body>"
	].join("\n"))
}
