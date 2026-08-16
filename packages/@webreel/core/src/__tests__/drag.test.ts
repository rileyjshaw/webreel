import { describe, it, expect } from "vitest";
import { dragEndpoints, stripGhostIdentity } from "../actions.js";

const thumb = { x: 100, y: 380, width: 20, height: 16 };
const anchor = { x: 900, y: 340, width: 44, height: 44 };

describe("dragEndpoints", () => {
  it("goes centre to centre by default", () => {
    expect(dragEndpoints(thumb, anchor)).toEqual({ fx: 110, fy: 388, tx: 922, ty: 362 });
  });

  it('keeps the starting y when the axis is "x"', () => {
    const { fy, ty, tx } = dragEndpoints(thumb, anchor, "x");
    expect(ty).toBe(fy);
    expect(tx).toBe(922);
  });

  it('keeps the starting x when the axis is "y"', () => {
    const { fx, tx, ty } = dragEndpoints(thumb, anchor, "y");
    expect(tx).toBe(fx);
    expect(ty).toBe(362);
  });
});

describe("stripGhostIdentity", () => {
  function fakeElement(
    attrs: Record<string, string>,
    children: Record<string, string>[] = [],
  ) {
    const make = (a: Record<string, string>) => ({
      attrs: { ...a },
      get attributes() {
        return Object.keys(this.attrs).map((name) => ({ name }));
      },
      removeAttribute(name: string) {
        delete this.attrs[name];
      },
      querySelectorAll: () => [] as never[],
    });
    const root = make(attrs);
    const kids = children.map(make);
    root.querySelectorAll = () => kids as never;
    return { root, kids };
  }

  it("removes the attributes a later selector lookup could match", () => {
    const { root } = fakeElement({
      id: "weight",
      name: "weight",
      "data-testid": "slider-weight",
      "data-state": "active",
      role: "slider",
      class: "thumb",
    });
    stripGhostIdentity(root);
    expect(root.attrs).toEqual({ role: "slider", class: "thumb" });
  });

  it("strips descendants too", () => {
    const { root, kids } = fakeElement({ id: "row" }, [
      { id: "input", "data-testid": "value" },
    ]);
    stripGhostIdentity(root);
    expect(root.attrs).toEqual({});
    expect(kids[0].attrs).toEqual({});
  });
});
