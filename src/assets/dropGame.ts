
export type DraggableObject = {
  id: string;
  label: string;
  type: string;
  detail?: string;
};

export type DropSlot = {
  id: string;
  label: string;
  accepts: string[];
  helper?: string;
};

type FormulaSegment =
  | { kind: "text"; value: string }
  | { kind: "slot"; slotId: string };

export type Vault = {
  id: string;
  title: string;
  prompt: string;
  segments: FormulaSegment[];
  slots: DropSlot[];
  items: DraggableObject[];
};

export const DropMasterVault: Vault[] = [
  {
    id: "Task Utilization",
    title: "Task Utilization",
    prompt: "Drag and drop the correct values for Task T_1 Utilization.",
    segments: [
      { kind: "text", value: "U_1 = " },
      { kind: "slot", slotId: "C_i" },
      { kind: "text", value: " / " },
      { kind: "slot", slotId: "T_i" },
    ],

    slots: [
      { id: "C_i", label: "Execution \\: C_i", accepts: ["C_i"], helper: "" },
      { id: "T_i", label: "Period \\: T_i", accepts: ["T_1"], helper: "" },
    ],
    items: [
      { id: "c1", label: "C_1 = 3", type: "C_i", detail: "" },
      { id: "v12", label: "12 V", type: "voltage" },
      { id: "d1", label: "D = 8", type: "deadline", detail: "" },
      { id: "t1", label: "T_1 = 5", type: "T_1", detail: "" },
      { id: "t2", label: "T_2 = 6", type: "T_2", detail: "" },
    ],
  },

  {
    id: "TDA",
    title: "Time Demand Analysis",
    prompt: "Drag and drop the correct variables into the slots.",
        segments: [
      { kind: "text", value: "\\Delta = " },
      { kind: "slot", slotId: "C_k" },
      { kind: "text", value: " + \\sum_{\\tau_i \\in hp(\\tau_k)}" },
      { kind: "text", value: " \\Bigg\\lceil" },
      { kind: "slot", slotId: "delta" },
      { kind: "text", value: " / " },
      { kind: "slot", slotId: "T_i" },
      { kind: "text", value: " \\Bigg\\rceil  " },
      { kind: "slot", slotId: "C_i" },
    ],
        slots: [
      { id: "delta", label: "", accepts: ["delta"], helper: "" },
      { id: "T_i", label: "", accepts: ["T_i"], helper: "" },
      { id: "C_k", label: "", accepts: ["C_k"], helper: "" },
      { id: "C_i", label: "", accepts: ["C_i"], helper: "" },
    ],
        items: [
      { id: "ck", label: "C_k", type: "C_k", detail: "" },
      { id: "ti", label: "T_i", type: "T_i", detail: "" },
      { id: "di", label: "D_i", type: "D_i", detail: "" },
      { id: "ci", label: "C_i", type: "C_i", detail: "" },
      { id: "delta", label: "\\Delta", type: "delta", detail: "" },
      { id: "rk", label: "R_k", type: "R_k", detail: "" },
    ],
  },

  {
    id: "Hyperbolic Bound",
    title: "Hyperbolic Bound",
    prompt: "Drag and drop the correct variables into the slots.",
    segments: [
      { kind: "slot", slotId: "product" },
      { kind: "text", value: " ( " },
      { kind: "slot", slotId: "U_i" },
      { kind: "text", value: " + " },
      { kind: "slot", slotId: "one" },
      { kind: "text", value: " ) \\leq " },
      { kind: "slot", slotId: "two" },
    ],
    slots: [
      { id: "product", label: "", accepts: ["product"], helper: "" },
      { id: "U_i", label: "", accepts: ["U_i"], helper: "" },
      { id: "one", label: "", accepts: ["one"], helper: "" },
      { id: "two", label: "", accepts: ["two"], helper: "" },
    ],
    items: [
      { id: "product", label: "\\prod_{i=1}^k", type: "product", detail: "" },
      { id: "uk", label: "U_k", type: "U_k", detail: "" },
      { id: "one", label: "1", type: "one", detail: "" },
      { id: "two", label: "2", type: "two", detail: "" },
      { id: "zero", label: "0", type: "zero", detail: "" },
      { id: "ui", label: "U_i", type: "U_i", detail: "" },
    ],
  },

    {
    id: "Liu & Layland Bound",
    title: "Liu & Layland Bound",
    prompt: "Drag and drop the correct variables into the slots.",
    segments: [
      { kind: "slot", slotId: "ulub" },
      { kind: "text", value: " = " },
      { kind: "slot", slotId: "n" },
      { kind: "text", value: " ( " },
      { kind: "slot", slotId: "two" },
      { kind: "text", value: " - " },
      { kind: "slot", slotId: "one" },
      { kind: "text", value: " ) \\geq" },
      { kind: "slot", slotId: "bound" },
    ],
    slots: [
      { id: "ulub", label: "", accepts: ["ulub"], helper: "" },
      { id: "n", label: "", accepts: ["n"], helper: "" },
      { id: "one", label: "", accepts: ["one"], helper: "" },
      { id: "two", label: "", accepts: ["two"], helper: "" },
      { id: "bound", label: "", accepts: ["bound"], helper: "" },
    ],
    items: [
      { id: "ulub", label: "U_{lub}(RM - P, n)", type: "ulub", detail: "" },
      { id: "n", label: "n", type: "n", detail: "" },
      { id: "one", label: "1", type: "one", detail: "" },
      { id: "two", label: "2^{\\frac{1}{n}}", type: "two", detail: "" },
      { id: "k", label: "k", type: "k", detail: "" },
      { id: "ui", label: "U_i", type: "U_i", detail: "" },
      { id: "number", label: "0.2026", type: "number", detail: "" },
      { id: "bound", label: "\\ln(2)", type: "bound", detail: "" },
    ],
  },
];