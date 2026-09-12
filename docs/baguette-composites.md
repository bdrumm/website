# Baguette browser composites

The product page loads the published V3.17 manufacturing GLB once and passes its buffer to the main rotatable viewer and a shared gallery renderer. Seven lifestyle cards combine generated clean photo backgrounds with real CAD geometry, accessory webbing, physically based polymer materials, image-based lighting and shadow receivers. Fourteen feature previews render the same mesh with the reviewed close-up cameras. The unloaded tongue and actual sliced-layer diagrams remain their original CAD images; section colors retain their engineering legend.

## Sizes and accessory concepts

The existing manufacturing model is presented as Pro Max, with Pro and Mini introduced as shorter size concepts. Their relative-size illustrations are interface graphics, not scaled manufacturing meshes or dimensioned product specifications. The page explicitly identifies the 3D viewer and lifestyle renders as the current Pro Max prototype. No downloadable geometry has changed.

The configurator supports zero, one or two expansion modules, a credit card holder and an external bottle holder. These are labeled as accessory concepts pending dimensions and attachment design. Selections update the visible setup summary and are saved as device preferences and shareable URL parameters (`size`, `expand`, `cards`, `bottle`). Existing color and model-view parameters are preserved. The size illustrations follow the selected finish. New purse and non-baguette storage scenes demonstrate the broader everyday-carry use cases using the current model.

## Geometry and alignment

`src/baguette-render-model.js` clones the object hierarchy and materials while sharing the original vertex and index buffers. There is no smoothing, remeshing, deformation or individual part scaling. Lid movement uses the original hinge and released-latch morph. The assembled case spans 621.74 mm along its long axis.

`src/baguette-scenes.js` stores each plate's normalized framing, rigid pose, lighting and foreground masks. Poses are visually calibrated to the illustrated scenes; these backgrounds do not provide measured camera or depth data. The product geometry is exact to the source mesh, while its placement and lighting within the photograph are artistic calibration.

Accessory cord passes through the actual slots at X ±271.5, Y −3.5, Z 54 mm. The cord bears against each eye's existing outer bridge. Hanging poses roll the whole assembly so the eyes lie above the shell. The two taut webbing branches attach to those transformed points on every frame. The hiking scene carries the product from the shoulder, with the arm masked in front of the strap. Straps are illustrative accessories, not printable product parts.

## Color and motion

Ivory, Graphite, Forest, Clay and Cobalt share one finish store. Each selection changes all product materials, including offscreen gallery models, without changing backgrounds or section annotation colors. The selected finish is saved locally and in the page URL, so “Copy this view” includes it.

Pointer movement, arrow keys and page scrolling produce a small change in perspective. Product rotation is bounded to roughly one degree per axis, with a two-pixel background shift. This limit keeps the unmeasured foreground masks aligned. “Parallax off” stops the effect; the initial setting honors reduced-motion preferences. The main viewer retains rotation-only controls so wheel/touch scrolling moves the page.

## Rendering cost and fallback

There are only two WebGL contexts: the main viewer and one gallery renderer. Gallery scene trees share CAD buffers and one prefiltered lighting environment. Only visible cards render; each result is composited into its display canvas. Shadow maps are released when cards leave the viewport margin and regenerated on return. Raster resolution is capped at 1.75× device pixels / 1800 px width, with adaptive 1024–2048 px shadow maps. Hidden feature choices do no rendering.

The original CAD preview images remain as loading and WebGL-unavailable fallbacks. These fallback images and the fixed technical diagrams do not change finish. Photo settings remain labeled as illustrations, and existing prototype/physical-test status is preserved.

## Verification

`src/baguette-composites.test.mjs` loads the actual GLB and verifies shared geometry, unchanged source transforms/materials, original hinge motion, the two open eye slots and solid outer bridges, synchronized finishes, and preserved section annotations. Browser review covers all five lifestyle compositions, the main color controls, feature camera choices, desktop/mobile layouts, dark/light themes and console errors. This is a presentation change, not new mechanical validation.
