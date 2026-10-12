import type { DiagramNode, Shape } from "@rhumb/kernel";

import { ConnectorShape } from "./ConnectorShape";
import { DecisionShape } from "./DecisionShape";
import { IoShape } from "./IoShape";
import { PredefinedProcessShape } from "./PredefinedProcessShape";
import { PreparationShape } from "./PreparationShape";
import { ProcessShape } from "./ProcessShape";
import { TerminatorShape } from "./TerminatorShape";

const SHAPE_MAP = new Map<
  DiagramNode["kind"],
  new (node: DiagramNode) => Shape
>([
  ["process", ProcessShape],
  ["decision", DecisionShape],
  ["terminator", TerminatorShape],
  ["io", IoShape],
  ["preparation", PreparationShape],
  ["predefinedProcess", PredefinedProcessShape],
  ["connector", ConnectorShape],
]);

export class ShapeFactory {
  public create(node: DiagramNode): Shape {
    const ShapeClass = SHAPE_MAP.get(node.kind);

    if (!ShapeClass) {
      throw new Error(`No shape class found for node kind: ${node.kind}`);
    }

    return new ShapeClass(node);
  }
}
