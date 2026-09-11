# Baguette model review

The user requires design review before committing or publishing changes, especially hinge, latch and shell geometry conflicts.

For every geometry revision:
- Validate the complete manufacturing assembly, including the integrated center joint and released latches, through its full operating motion. Require a continuous clearance bound in addition to sampled intersections.
- Inspect closed, partly open and fully open CAD renders, plus hinge and latch cross-sections. Check shell continuity, direct hinge attachment, retaining lips, print clearance and disconnected solids.
- Correct conflicts before committing. Do not use display-only repairs or treat a mesh render as evidence that a mechanism works.
- Regenerate matching preview meshes, print objects and coupons. Run fresh offline slices with input and output hashes. Record the visual review against the exact generator and preview hashes.
- Run source/prepublish-review.py before committing or publishing. Keep physical printing and load testing explicitly separate from CAD validation.

Publishing to the existing site is authorized in this task. Do not migrate hosting or change unrelated site content.

The center joint uses integral one-way snap tabs. Do not restore loose bonding sleeves or adhesive assembly unless the user requests it. Review insertion, spring return, withdrawal resistance and receiver wall thickness.

All six interior ribs are intentionally removed. Center-joint tongues must remain within the shell edge and enter covered blind sockets. Check inward and outward covers, the closed end and exposed-tongue flex clearance before publishing.

Keep the reinforced cavity wall guard and former thin-wall slice review. Preserve the previous exterior hinge profile while adding strength inward. Half A must have solid snap roots without recessed flex channels. Blend the center attachment into the inner cavity without abrupt transverse ledges. Hash joint-profile.json and joint-blend.py.txt along with the generator and inspect actual sliced wall paths before publishing.

The editable CAD and source checks are distributed in baguette-v3-source-and-print.zip. Extract to a writable model workspace before changing geometry. Publish rebuilt assets and both matching archives together.
