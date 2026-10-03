import { describe, expect, it } from "vitest";
import {
  blockSummary,
  cleanBlocks,
  countChars,
  createBlock,
  editorReducer,
  fromView,
  getIn,
  isDirty,
  moveItem,
  pageStatus,
  readCount,
  readLocalized,
  removeAt,
  setIn,
  type EditorState,
} from "./state";
import type { AdminPageView, BlockDef, EditorBlock } from "./types";

const hero: EditorBlock = { id: "a", type: "hero", data: { title: { vi: "Một" } } };
const banner: EditorBlock = { id: "b", type: "banner", data: { title: { vi: "Hai" } } };
const cta: EditorBlock = { id: "c", type: "cta", data: { title: { vi: "Ba" } } };

function view(over: Partial<AdminPageView> = {}): AdminPageView {
  return {
    pageKey: "home",
    version: 3,
    pub: null,
    draft: null,
    working: { blocks: [hero, banner, cta] },
    ...over,
  };
}

function loaded(over: Partial<AdminPageView> = {}): EditorState {
  return fromView(view(over));
}

describe("fromView", () => {
  it("lấy working làm bản đang soạn và bản đã lưu, không dùng chung tham chiếu", () => {
    const state = loaded({ draft: { blocks: [hero] }, pub: { blocks: [] } });
    expect(state.blocks).toEqual([hero, banner, cta]);
    expect(state.savedBlocks).toEqual(state.blocks);
    expect(state.blocks[0]).not.toBe(hero);
    expect(state.blocks[0]).not.toBe(state.savedBlocks[0]);
    expect(state.hasDraft).toBe(true);
    expect(state.hasPub).toBe(true);
    expect(state.version).toBe(3);
  });

  it("trang chưa có gì: version 0, không nháp, không bản đăng", () => {
    const state = fromView({
      pageKey: "about",
      version: 0,
      pub: null,
      draft: null,
      working: { blocks: [] },
    });
    expect(state).toMatchObject({ version: 0, hasDraft: false, hasPub: false, blocks: [] });
  });
});

describe("createBlock", () => {
  it("tạo block rỗng với id cho trước hoặc uuid", () => {
    expect(createBlock("hero", "x")).toEqual({ id: "x", type: "hero", data: {} });
    const auto = createBlock("hero");
    expect(auto.id).toMatch(/^[A-Za-z0-9_-]{1,64}$/);
  });
});

describe("moveItem / removeAt", () => {
  it("đổi chỗ và không đụng mảng gốc", () => {
    const list = ["a", "b", "c"];
    expect(moveItem(list, 0, 2)).toEqual(["b", "c", "a"]);
    expect(moveItem(list, 2, 0)).toEqual(["c", "a", "b"]);
    expect(list).toEqual(["a", "b", "c"]);
  });

  it("chỉ số ngoài khoảng hoặc trùng thì giữ nguyên", () => {
    expect(moveItem(["a", "b"], 0, 5)).toEqual(["a", "b"]);
    expect(moveItem(["a", "b"], -1, 0)).toEqual(["a", "b"]);
    expect(moveItem(["a", "b"], 1, 1)).toEqual(["a", "b"]);
  });

  it("removeAt bỏ đúng phần tử", () => {
    expect(removeAt(["a", "b", "c"], 1)).toEqual(["a", "c"]);
  });
});

describe("getIn / setIn", () => {
  it("ghi bất biến theo đường dẫn lồng nhau", () => {
    const root = { items: [{ t: { vi: "x" } }] };
    const next = setIn(root, ["items", 0, "t", "vi"], "y") as typeof root;
    expect(next.items[0].t.vi).toBe("y");
    expect(root.items[0].t.vi).toBe("x");
  });

  it("tạo cấu trúc còn thiếu, và value undefined thì xóa khóa", () => {
    expect(setIn({}, ["title", "vi"], "a")).toEqual({ title: { vi: "a" } });
    expect(setIn({ a: 1, b: 2 }, ["a"], undefined)).toEqual({ b: 2 });
  });

  it("getIn trả undefined khi đường dẫn không tồn tại", () => {
    expect(getIn({ a: [1] }, ["a", 0])).toBe(1);
    expect(getIn({ a: [1] }, ["b", 0])).toBeUndefined();
    expect(getIn(null, ["a"])).toBeUndefined();
  });
});

describe("editorReducer", () => {
  it("add thêm block vào cuối", () => {
    const next = editorReducer(loaded(), { type: "add", block: createBlock("stats", "n") });
    expect(next?.blocks.map((b) => b.id)).toEqual(["a", "b", "c", "n"]);
  });

  it("remove bỏ đúng block theo id", () => {
    const next = editorReducer(loaded(), { type: "remove", id: "b" });
    expect(next?.blocks.map((b) => b.id)).toEqual(["a", "c"]);
  });

  it("move đổi thứ tự", () => {
    const next = editorReducer(loaded(), { type: "move", from: 0, to: 2 });
    expect(next?.blocks.map((b) => b.id)).toEqual(["b", "c", "a"]);
  });

  it("setValue chỉ sửa đúng block", () => {
    const next = editorReducer(loaded(), {
      type: "setValue",
      id: "b",
      path: ["title", "en"],
      value: "Two",
    });
    expect(next?.blocks[1].data).toEqual({ title: { vi: "Hai", en: "Two" } });
    expect(next?.blocks[0].data).toEqual({ title: { vi: "Một" } });
  });

  it("load thay toàn bộ, reset về null, và bỏ qua hành động khi chưa có trạng thái", () => {
    const state = loaded();
    const reloaded = editorReducer(state, { type: "load", view: view({ version: 9 }) });
    expect(reloaded?.version).toBe(9);
    expect(editorReducer(state, { type: "reset" })).toBeNull();
    expect(editorReducer(null, { type: "remove", id: "a" })).toBeNull();
  });
});

describe("cleanBlocks (spec D5)", () => {
  it("bỏ chuỗi rỗng, chữ rỗng, list rỗng; giữ số 0", () => {
    const blocks: EditorBlock[] = [
      {
        id: "x",
        type: "stats",
        data: {
          title: { vi: "Có", en: "" },
          text: { vi: "", en: "" },
          eyebrow: "",
          buttons: [],
          count: 0,
        },
      },
    ];
    expect(cleanBlocks(blocks)[0].data).toEqual({ title: { vi: "Có" }, count: 0 });
  });

  it("giữ mục list rỗng để server báo lỗi, chỉ bỏ trường rỗng bên trong mục", () => {
    const blocks: EditorBlock[] = [
      {
        id: "x",
        type: "marquee",
        data: { items: [{ t: { vi: "", en: "" } }, { t: { vi: "Giữ" } }] },
      },
    ];
    expect(cleanBlocks(blocks)[0].data).toEqual({ items: [{}, { t: { vi: "Giữ" } }] });
  });

  it("chỉ có tiếng Anh thì vẫn gửi để server báo cần tiếng Việt", () => {
    const blocks: EditorBlock[] = [
      { id: "x", type: "hero", data: { title: { vi: "", en: "Only EN" } } },
    ];
    expect(cleanBlocks(blocks)[0].data).toEqual({ title: { en: "Only EN" } });
  });

  it("NaN bị bỏ, không làm hỏng JSON", () => {
    const blocks: EditorBlock[] = [{ id: "x", type: "stats", data: { n: Number.NaN } }];
    expect(cleanBlocks(blocks)[0].data).toEqual({});
  });
});

describe("isDirty / pageStatus", () => {
  it("vừa nạp xong thì không có thay đổi", () => {
    expect(isDirty(loaded())).toBe(false);
  });

  it("không phụ thuộc thứ tự khóa và bỏ qua chuỗi rỗng", () => {
    const state = loaded();
    const edited = editorReducer(state, {
      type: "setValue",
      id: "a",
      path: ["title", "en"],
      value: "",
    });
    expect(isDirty(edited as EditorState)).toBe(false);
  });

  it("sửa nội dung, đổi thứ tự, thêm hoặc xóa block đều là thay đổi", () => {
    const state = loaded();
    const typed = editorReducer(state, {
      type: "setValue",
      id: "a",
      path: ["title", "vi"],
      value: "Khác",
    }) as EditorState;
    expect(isDirty(typed)).toBe(true);
    expect(isDirty(editorReducer(state, { type: "move", from: 0, to: 1 }) as EditorState)).toBe(true);
    expect(isDirty(editorReducer(state, { type: "remove", id: "a" }) as EditorState)).toBe(true);
    expect(
      isDirty(editorReducer(state, { type: "add", block: createBlock("cta", "z") }) as EditorState),
    ).toBe(true);
  });

  it("đưa nội dung về như cũ thì hết thay đổi", () => {
    const state = loaded();
    const moved = editorReducer(state, { type: "move", from: 0, to: 1 }) as EditorState;
    const back = editorReducer(moved, { type: "move", from: 1, to: 0 }) as EditorState;
    expect(isDirty(back)).toBe(false);
  });

  it("nhãn trạng thái theo thứ tự ưu tiên dirty > draft > published > empty", () => {
    expect(pageStatus(loaded({ draft: { blocks: [hero] } }))).toBe("draft");
    expect(pageStatus(loaded({ pub: { blocks: [hero] } }))).toBe("published");
    expect(pageStatus(loaded({ working: { blocks: [] } }))).toBe("empty");
    const dirty = editorReducer(loaded({ pub: { blocks: [hero] } }), {
      type: "remove",
      id: "a",
    }) as EditorState;
    expect(pageStatus(dirty)).toBe("dirty");
  });
});

describe("hỗ trợ hiển thị", () => {
  const def: BlockDef = {
    type: "hero",
    label: "Đầu trang",
    fields: [
      { key: "image", label: "Ảnh", kind: "image" },
      { key: "eyebrow", label: "Dòng nhỏ", kind: "text", max: 40 },
      { key: "title", label: "Tiêu đề", kind: "title", max: 90, required: true },
    ],
  };

  it("countChars đếm theo code point", () => {
    expect(countChars("Việt Nam")).toBe(8);
    expect(countChars("😀a")).toBe(2);
  });

  it("readLocalized / readCount chịu được dữ liệu thiếu hoặc sai kiểu", () => {
    expect(readLocalized(undefined)).toEqual({ vi: "", en: "" });
    expect(readLocalized({ vi: "a", en: 5 })).toEqual({ vi: "a", en: "" });
    expect(readCount(12)).toBe("12");
    expect(readCount(undefined)).toBe("");
    expect(readCount("12")).toBe("");
  });

  it("blockSummary lấy bản vi đầu tiên theo thứ tự registry, bỏ dấu *, cắt dài", () => {
    expect(blockSummary(def, { title: { vi: "Làm *nên* chuyện" } })).toBe("Làm nên chuyện");
    expect(blockSummary(def, { eyebrow: { vi: "Trước" }, title: { vi: "Sau" } })).toBe("Trước");
    expect(blockSummary(def, { title: { vi: "x".repeat(70) } }, 10)).toBe(`${"x".repeat(10)}…`);
    expect(blockSummary(def, {})).toBe("");
    expect(blockSummary(undefined, { title: { vi: "a" } })).toBe("");
  });
});
