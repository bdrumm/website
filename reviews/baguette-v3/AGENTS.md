# Baguette model review

The user requires design review before committing or publishing changes, especially hinge, latch and shell geometry conflicts.

For every geometry revision:
- Validate the complete manufacturing assembly, including installed joiners and released latches, through its full operating motion. Require a continuous clearance bound in addition to sampled intersections.
- Inspect closed, partly open and fully open CAD renders, plus hinge and latch cross-sections. Check shell continuity, direct hinge attachment, retaining lips, print clearance and disconnected solids.
- Correct conflicts before committing. Do not use display-only repairs or treat a mesh render as evidence that a mechanism works.
- Regenerate matching preview meshes, print objects and coupons. Run fresh offline slices with input and output hashes. Record the visual review against the exact generator and preview hashes.
- Run source/prepublish-review.py before committing or publishing. Keep physical printing and load testing explicitly separate from CAD validation.

Publishing to the existing site is authorized in this task. Do not migrate hosting or change unrelated site content.

The editable CAD and source checks are distributed in baguette-v3-source-and-print.zip. Extract to a writable model workspace before changing geometry. Publish rebuilt assets and both matching archives together.
