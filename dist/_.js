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
const ENCODING = js_yaml_1.default.load(fs_1.default.readFileSync("encoding.yml", "utf8")).flat(Infinity);
const UNI = js_yaml_1.default.load(fs_1.default.readFileSync("uni.yml", "utf8"));
function getLength(base) {
    return ENCODING
        .indexOf(ENCODING
        .at(-1)
        ?? "")
        .toString(base)
        .length;
}
function encode(input, base) {
    return input.replace(/[\S\s]/g, m => {
        let CHAR = ENCODING
            .indexOf(m);
        CHAR = CHAR === -1
            ? 0
            : CHAR;
        CHAR = CHAR
            .toString(base);
        return "0".repeat(getLength(base) - CHAR.length) + CHAR;
    });
}
function decode(input, base) {
    let baseNum = bases[base];
    input = input.replace(new RegExp(`${baseNum}{${getLength(base)}}`, "gi"), m => ENCODING[parseInt(m, base)] ?? m);
    UNI.forEach((kv, i) => {
        Object.entries(kv).forEach(([k, v]) => {
            input = input
                .replace(`${k}${"_".repeat(i + 1)}`, v);
        });
    });
    return input;
}
function FMT(input, base) {
    const e = encode(input, base);
    const d = decode(e, base);
    return { e, d };
}
const IN = fs_1.default.readFileSync("test.txt", { encoding: "utf8" }).trim();
fs_1.default.mkdirSync("radix");
Object.keys(bases)
    .map(Number)
    .forEach(b => {
    const base = b;
    const out = FMT(IN, base);
    fs_1.default.writeFileSync(`radix/${base}`, [
        out.e,
        "=".repeat(out.e.length),
        out.d,
    ].join("\n"));
});
