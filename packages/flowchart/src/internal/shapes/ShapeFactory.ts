import type { DiagramNode, Shape } from "@rhumb/kernel";

import { CardShape } from "./CardShape";
import { CommentShape } from "./CommentShape";
import { ConnectorShape } from "./ConnectorShape";
import { DecisionShape } from "./DecisionShape";
import { DirectStorageShape } from "./DirectStorageShape";
import { DisplayShape } from "./DisplayShape";
import { DocumentShape } from "./DocumentShape";
import { InternalStorageShape } from "./InternalStorageShape";
import { IoShape } from "./IoShape";
import { LoopEndShape } from "./LoopEndShape";
import { LoopStartShape } from "./LoopStartShape";
import { ManualInputShape } from "./ManualInputShape";
import { ManualOperationShape } from "./ManualOperationShape";
import { PaperTapeShape } from "./PaperTapeShape";
import { ParallelShape } from "./ParallelShape";
import { PredefinedProcessShape } from "./PredefinedProcessShape";
import { PreparationShape } from "./PreparationShape";
import { ProcessShape } from "./ProcessShape";
import { SequentialStorageShape } from "./SequentialStorageShape";
import { StoredDataShape } from "./StoredDataShape";
import { TerminatorShape } from "./TerminatorShape";
import { TransferShape } from "./TransferShape";

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
  ["storedData", StoredDataShape],
  ["internalStorage", InternalStorageShape],
  ["sequentialStorage", SequentialStorageShape],
  ["directStorage", DirectStorageShape],
  ["document", DocumentShape],
  ["paperTape", PaperTapeShape],
  ["manualInput", ManualInputShape],
  ["card", CardShape],
  ["display", DisplayShape],
  ["manualOperation", ManualOperationShape],
  ["parallel", ParallelShape],
  ["loopStart", LoopStartShape],
  ["loopEnd", LoopEndShape],
  ["transfer", TransferShape],
  ["comment", CommentShape],
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
