"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const digits = "0123456789abcdefghijklmnopqrstuvwxyz";
let bases = {};
for (let i = 2; i <= digits.length; i++) {
    bases[i] = `[${digits.slice(0, i)}]`;
}
const UNI = js_yaml_1.default.load(fs_1.default.readFileSync("uni.yml", "utf8"));
const ENCODING = [
    ...js_yaml_1.default.load(fs_1.default.readFileSync("encoding.yml", "utf8"))
        .flat(Infinity),
    ...UNI
        .map(i => Object.values(i))
        .flat()
];
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
    /*UNI.forEach((kv: Record<string, string>, i: number): void => {
        Object.entries(kv)
            .forEach(([k, v]: [string, string]): void => {
                input = input.replace(new RegExp(`${k}${"_".repeat(i + 1)}`, "g"), v)
            })
    })*/
    return input;
}
function FMT(input, base) {
    const e = encode(input, base);
    const d = decode(e, base);
    return { e, d };
}
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
fs_1.default.writeFileSync("encoded.txt", OUT.join("\n"));
fs_1.default.writeFileSync("test.md", [
    "`" + FMT(IN, 36).e + "`",
    "*".repeat(FMT(IN, 36).e.length),
    FMT(IN, 36).d
].join("\n"));
