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

Latch rounding must preserve the internal retaining shoulder and running gap. Inspect the underside finger catch and its blend in an actual CAD section and underside view before publishing.

Keep fingernail access directly below each lip. Check the gauge clearance and remaining scoop wall, and preserve the pin, bearing and retaining faces when softening exposed mounting edges.

Keep all four latch side slots clear through the raised shell band. Check a continuous slot gauge for residual overhanging bridges, including where the band is higher than the opening corners.

The raised outer band must blend smoothly into the shell and latch face. Preserve cavity thickness and test continuity across the former band ledges at Z ±3.5 mm. Keep functional retaining shoulders square.

Strap eyes must keep their through-openings and a strong outer web while their edges and roots are rounded. Inspect the strap view. Check fingernail entry into the grip itself and the material above and in front of that recess.

The strap tail must fade into the actual narrowing shell instead of ending in a raised stub. Inspect its silhouette and sample the final outer skin beyond the tail termination.

Covered center-joint sockets must have 45-degree ceilings in the connection-down print orientation. Preserve tab clearance and the retaining shoulder; inspect the capped joint section and verify sloped roof face normals and cover thickness.

Keep unloaded inward-set latch geometry distinct from its elastic seated state. Verify positive preload, seated contact, release clearance, and 45-degree connection-facing bevels in the actual unloaded print orientation. Preserve the central retaining shoulders and compare geometry outside the latch regions against the prior revision.

The 45-degree connection-facing bevel must cover the main tongue end, not only the hook or grip. Match the stationary U-slot edge to the bevel with a running gap. Measure remaining flat downward-facing tongue area and verify that the fixed slot rim does not move with latch release in either CAD or the preview.

The editable CAD and source checks are distributed in baguette-v3-source-and-print.zip. Extract to a writable model workspace before changing geometry. Publish rebuilt assets and both matching archives together.
