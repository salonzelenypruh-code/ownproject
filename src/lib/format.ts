/** 1100 -> „1 100“ (s pevnou mezerou) */
export const formatPrice = (n: number) => n.toLocaleString("cs-CZ").replace(/\s/g, " ");

export type DescBlock = { type: "p"; text: string } | { type: "ul"; items: string[] };

/** Popis služby: odstavce oddělené prázdným řádkem, řádky začínající „- “ tvoří odrážky. */
export function parseDescription(src: string): DescBlock[] {
  const blocks: DescBlock[] = [];
  for (const chunk of src.replace(/\r/g, "").split(/\n\s*\n/)) {
    const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
    let para: string[] = [];
    let list: string[] = [];
    const flushPara = () => { if (para.length) blocks.push({ type: "p", text: para.join(" ") }); para = []; };
    const flushList = () => { if (list.length) blocks.push({ type: "ul", items: list }); list = []; };
    for (const l of lines) {
      if (/^[-•*]\s+/.test(l)) { flushPara(); list.push(l.replace(/^[-•*]\s+/, "")); }
      else { flushList(); para.push(l); }
    }
    flushPara();
    flushList();
  }
  return blocks;
}
