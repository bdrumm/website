# Baguette browser composites

The product page loads the published V3.19 manufacturing GLB once and passes its buffer to the main rotatable viewer and a shared gallery renderer. Seven lifestyle cards combine generated clean photo backgrounds with real CAD geometry, accessory webbing, physically based polymer materials, image-based lighting and shadow receivers. Fourteen feature previews render the same mesh with the reviewed close-up cameras. The unloaded tongue and actual sliced-layer diagrams remain their original CAD images; section colors retain their engineering legend.

## Sizes and accessory concepts

The interactive model sits above the type selector. Pro Max uses the current manufacturing model at its original scale; Pro and Mini show the complete assembly at uniform 0.72× and 0.44× scales. All seven lifestyle scenes follow the same selection. These are explicitly labeled proportional previews, not newly validated CAD variants or final dimensions. Source vertex/index buffers, normals, component proportions and downloadable geometry remain unchanged. Technical feature close-ups stay at the original manufacturing scale.

The configurator supports zero, one or two expansion modules, a credit card holder and an external bottle holder. These are labeled as accessory concepts pending dimensions and attachment design. Selections update the visible setup summary and are saved as device preferences and shareable URL parameters (`size`, `expand`, `cards`, `bottle`). Existing color choices are preserved. The size illustrations follow the selected finish. Purse and non-baguette storage scenes demonstrate the broader everyday-carry use cases at the selected scale.

## Geometry and alignment

`src/baguette-render-model.js` clones the object hierarchy and materials while sharing the original vertex and index buffers. There is no smoothing, remeshing, deformation or individual part scaling. Lid movement uses the original hinge and released-latch morph. The assembled case spans 621.74 mm along its long axis.

`src/baguette-scenes.js` stores each plate's normalized framing, rigid pose, lighting and foreground masks. Poses are visually calibrated to the illustrated scenes; these backgrounds do not provide measured camera or depth data. The product geometry is exact to the source mesh, while its placement and lighting within the photograph are artistic calibration.

Accessory cord passes through the actual slots at X ±271.5, Y −3.5, Z 54 mm. The cord bears against each eye's existing outer bridge. Hanging poses roll the whole assembly so the eyes lie above the shell. The two taut webbing branches attach to those transformed points on every frame. The hiking scene carries the product from the shoulder, with the arm masked in front of the strap. Straps are illustrative accessories, not printable product parts.

Lifestyle cards use a calibrated 30° perspective camera. Shoulder endpoints are unprojected at their actual scene depth, avoiding the scale drift caused by treating all points as if they lie in the image plane. Grounded cases scale around the actual base floor, and suspended cases scale around the eye-slot plane; cord loops and webbing ends stay attached during size changes. The hanging shadow receiver is closer to the case to reduce the floating appearance. These are photographic calibrations, not measured scene reconstructions.

## Color and motion

Ivory, Graphite, Forest, Clay and Cobalt share one finish store. Each selection changes all product materials, including offscreen gallery models, without changing backgrounds or section annotation colors. The selected finish is saved locally and in the page URL, so “Copy setup” includes it.

Pointer movement, arrow keys and page scrolling produce a small change in perspective. Product rotation is bounded to roughly half a degree per axis, with a shared two-pixel shift of the photograph, CAD canvas and foreground mask. All three layers use identical 1.018× overscan; the previous independently transformed canvas could drift away from the photo. This limit keeps the unmeasured foreground masks aligned. “Parallax off” stops the effect; the initial setting honors reduced-motion preferences. The main viewer retains rotation-only navigation so wheel/touch scrolling moves the page. The section-view toolbar, exploded/cutaway controls and per-feature “Inspect in 3D” jumps are removed. Only Open/Close case and Copy setup remain beside the rotation hint.

## Rendering cost and fallback

There are only two WebGL contexts: the main viewer and one gallery renderer. Gallery scene trees share CAD buffers and one prefiltered lighting environment. Only visible cards render; each result is composited into its display canvas. Shadow maps are released when cards leave the viewport margin and regenerated on return. Raster resolution is capped at 1.75× device pixels / 1800 px width, with adaptive 1024–2048 px shadow maps. Hidden feature choices do no rendering.

The original CAD preview images remain as loading and WebGL-unavailable fallbacks. These fallback images and the fixed technical diagrams do not change finish. Photo settings remain labeled as illustrations, and existing prototype/physical-test status is preserved.

## Verification

`src/baguette-composites.test.mjs` loads the actual GLB and verifies shared geometry, unchanged source transforms/materials, original hinge motion, the two open eye slots and solid outer bridges, synchronized finishes, and preserved section annotations. Tests also verify exact uniform size ratios, unchanged ground contact through lid movement, fixed suspension-plane height, and perspective strap endpoints projecting to their intended photo coordinates at multiple depths. This is a presentation change, not new mechanical validation.
