import "./styles.css";
import {
  OrbitError,
  OrbitGenerator,
  encode,
  parse,
  toDecimalString,
  toHexString,
} from "@orbit-id/core";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("#app missing");

app.innerHTML = `
  <div class="shell">
    <header class="topbar">
      <a class="brand" href="#">
        <span class="brand-mark" aria-hidden="true"></span>
        <span>Orbit ID</span>
      </a>
      <nav class="top-links" aria-label="docs">
        <a href="https://github.com/ponstream24/orbit-id/blob/main/docs/ja/orbit-id-v1.md" target="_blank" rel="noreferrer">仕様</a>
        <a href="https://github.com/ponstream24/orbit-id/blob/main/docs/ja/test-vectors.md" target="_blank" rel="noreferrer">テストベクタ</a>
        <a href="https://github.com/ponstream24/orbit-id/tree/main/spec/conformance" target="_blank" rel="noreferrer">Conformance</a>
        <a href="https://github.com/ponstream24/orbit-id" target="_blank" rel="noreferrer">GitHub</a>
      </nav>
    </header>

    <main class="main">
      <div class="page-head">
        <div class="badge">
          <span class="badge-dot" aria-hidden="true"></span>
          <span>ブラウザ完結 · 登録不要</span>
        </div>
        <h1 class="page-title">Orbit ID プレイグラウンド</h1>
        <p class="page-desc">
          Orbit ID v1 の生成・解析・エンコードをその場で試せます。不正な入力は拒否理由を表示します。
        </p>
        <ul class="checks">
          <li>処理はブラウザ内で完結します</li>
          <li>入力データはサーバーへ送りません</li>
        </ul>
      </div>

      <section class="grid">
        <article class="card">
          <div class="card-head">
            <h2>解析</h2>
            <button type="button" class="btn btn-ghost" id="btn-parse-clear">クリア</button>
          </div>
          <div class="card-body">
            <div class="field">
              <label for="id-input">Decimal ID</label>
              <input
                class="mono"
                id="id-input"
                inputmode="numeric"
                spellcheck="false"
                placeholder="140612821619842090"
              />
            </div>
            <div class="actions">
              <button type="button" class="btn btn-primary" id="btn-parse">解析する</button>
            </div>
            <div id="parse-out" class="panel" aria-live="polite">結果がここに表示されます</div>
          </div>
        </article>

        <article class="card">
          <div class="card-head">
            <h2>生成 / エンコード</h2>
            <button type="button" class="btn btn-ghost" id="btn-gen-clear">クリア</button>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="field">
                <label for="type">Type (1–63)</label>
                <input id="type" type="number" min="1" max="63" value="1" />
              </div>
              <div class="field">
                <label for="node">Node (0–127)</label>
                <input id="node" type="number" min="0" max="127" value="1" />
              </div>
            </div>
            <div class="row">
              <div class="field">
                <label for="timestamp">Timestamp（Orbit ms・任意）</label>
                <input class="mono" id="timestamp" inputmode="numeric" placeholder="auto" />
              </div>
              <div class="field">
                <label for="sequence">Sequence（任意）</label>
                <input id="sequence" type="number" min="0" max="1023" placeholder="0" />
              </div>
            </div>
            <div class="actions">
              <button type="button" class="btn btn-primary" id="btn-generate">生成する</button>
              <button type="button" class="btn btn-ghost" id="btn-encode">フィールドをエンコード</button>
            </div>
            <div id="gen-out" class="panel" aria-live="polite">結果がここに表示されます</div>
          </div>
        </article>
      </section>

      <p class="foot">
        Built with <code>@orbit-id/core</code>.
        仕様上の formal capacity は実測スループットではありません。
      </p>
    </main>
  </div>
`;

const idInput = must("#id-input") as HTMLInputElement;
const parseOut = must("#parse-out");
const genOut = must("#gen-out");
const typeInput = must("#type") as HTMLInputElement;
const nodeInput = must("#node") as HTMLInputElement;
const timestampInput = must("#timestamp") as HTMLInputElement;
const sequenceInput = must("#sequence") as HTMLInputElement;

must("#btn-parse").addEventListener("click", () => {
  try {
    const fields = parse(idInput.value.trim());
    setOutput(parseOut, {
      timestamp: fields.timestamp.toString(),
      type: fields.type,
      node: fields.node,
      sequence: fields.sequence,
      hex: toHexString(encode(fields)),
    });
  } catch (e) {
    setError(parseOut, e);
  }
});

must("#btn-generate").addEventListener("click", () => {
  try {
    const type = Number(typeInput.value);
    const node = Number(nodeInput.value);
    const generator = new OrbitGenerator({ node });
    const id = generator.generate(type);
    const fields = parse(id);
    setOutput(genOut, {
      id: toDecimalString(id),
      hex: toHexString(id),
      ...fields,
      timestamp: fields.timestamp.toString(),
    });
    idInput.value = toDecimalString(id);
  } catch (e) {
    setError(genOut, e);
  }
});

must("#btn-encode").addEventListener("click", () => {
  try {
    const type = Number(typeInput.value);
    const node = Number(nodeInput.value);
    const sequence = sequenceInput.value === "" ? 0 : Number(sequenceInput.value);
    const timestamp =
      timestampInput.value.trim() === ""
        ? BigInt(Date.now()) - 1767225600000n
        : BigInt(timestampInput.value.trim());
    const id = encode({ timestamp, type, node, sequence });
    setOutput(genOut, {
      id: toDecimalString(id),
      hex: toHexString(id),
      timestamp: timestamp.toString(),
      type,
      node,
      sequence,
    });
    idInput.value = toDecimalString(id);
  } catch (e) {
    setError(genOut, e);
  }
});

must("#btn-parse-clear").addEventListener("click", () => {
  idInput.value = "";
  resetPanel(parseOut);
});

must("#btn-gen-clear").addEventListener("click", () => {
  typeInput.value = "1";
  nodeInput.value = "1";
  timestampInput.value = "";
  sequenceInput.value = "";
  resetPanel(genOut);
});

function must(sel: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(sel);
  if (!el) throw new Error(`missing ${sel}`);
  return el;
}

function resetPanel(el: HTMLElement): void {
  el.className = "panel";
  el.textContent = "結果がここに表示されます";
}

function setOutput(el: HTMLElement, value: unknown): void {
  el.className = "panel ok";
  el.textContent = JSON.stringify(value, (_, v) => (typeof v === "bigint" ? v.toString() : v), 2);
}

function setError(el: HTMLElement, err: unknown): void {
  el.className = "panel err";
  if (err instanceof OrbitError) {
    el.textContent = `${err.code}: ${err.message}`;
    return;
  }
  el.textContent = err instanceof Error ? err.message : String(err);
}
