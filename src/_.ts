import fs from "fs"
import YAML from "js-yaml"
type Enumerate<N extends number, A extends number[] = []> = A['length'] extends N ? A[number] : Enumerate<N, [...A, A['length']]>;
type IntRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>;
type Radix = IntRange<2, 37>;
const digits = "0123456789abcdefghijklmnopqrstuvwxyz"
let bases: Record<number, string> = {}
for (let i = 2; i <= digits.length; i++) {
	bases[i] = `[${digits.slice(0, i)}]`
}
const ENCODING: Array<string> = (YAML.load(fs.readFileSync("encoding.yml", "utf8")) as Array<string>).flat(Infinity)
function getLength(base: Radix) {
	return ENCODING
		.indexOf(ENCODING
			.at(-1)
			?? ""
		)
		.toString(base)
		.length
}
function encode(input: string, base: Radix) {
	return input.replace(/[\S\s]/g, m => {
		let CHAR: string | number = ENCODING
			.indexOf(m)
		CHAR = CHAR === -1
			? 0
			: CHAR
		CHAR = CHAR
			.toString(base)
		return "0".repeat(getLength(base) - CHAR.length) + CHAR
	})
}
function decode(input: string, base: Radix) {
	let baseNum = bases[base]
	return input.replace(
		new RegExp(`${baseNum}{${getLength(base)}}`, "gi"),
		m => ENCODING[parseInt(m, base)] ?? m
	)
}
function FMT(input: string, base: Radix) {
	const e = encode(input, base)
	const d = decode(e, base)
	return { e, d }
}
const IN = fs.readFileSync("test.txt", { encoding: "utf8" })
fs.mkdirSync("radix")
Object.keys(bases)
	.map(Number)
	.forEach(b => {
		const base = b as Radix
		const out = FMT(IN, base)
		fs.writeFileSync(`radix/${base}.log`,
			[
				out.e,
				out.d
			].join("\n\n")
		)
	})
