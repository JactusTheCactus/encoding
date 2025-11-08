import fs from "fs"
import YAML from "js-yaml"
type Enumerate<N extends number, A extends number[] = []> = A['length'] extends N ? A[number] : Enumerate<N, [...A, A['length']]>;
type IntRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>;
type Radix = IntRange<2, 37>;
const digits: string = "0123456789abcdefghijklmnopqrstuvwxyz"
let bases: Record<number, string> = {}
for (let i: number = 2; i <= digits.length; i++) {
	bases[i] = `[${digits.slice(0, i)}]`
}
const UNI: Array<Record<string, string>> = YAML.load(fs.readFileSync("uni.yml", "utf8")) as Array<Record<string, string>>
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
]
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
	/*UNI.forEach((kv: Record<string, string>, i: number): void => {
		Object.entries(kv)
			.forEach(([k, v]: [string, string]): void => {
				input = input.replace(new RegExp(`${k}${"_".repeat(i + 1)}`, "g"), v)
			})
	})*/
	return input
}
function FMT(input: string, base: Radix): Record<"e" | "d", string> {
	const e: string = encode(input, base)
	const d: string = decode(e, base)
	return { e, d }
}
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
fs.writeFileSync("encoded.txt", OUT.join("\n"))
fs.writeFileSync("test.md", [
	"`" + FMT(IN, 36).e + "`",
	"*".repeat(FMT(IN, 36).e.length),
	FMT(IN, 36).d
].join("\n"))
