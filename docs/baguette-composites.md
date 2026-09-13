# Baguette product photography

The public gallery now displays complete, saved lifestyle renderings. There are seven scenes (carry, everyday purse, personal essentials, rain, picnic, train travel and shoulder carry while hiking), each in Ivory, Graphite, Forest, Clay, Cobalt, Matte Silver and Yellow. Selecting a finish switches the image files through the shared finish store. The gallery uses ordinary lazy-loaded JPEG images; it does not create a WebGL renderer, overlay a model, track the pointer, or animate parallax.

The images are generated illustrations referenced to the current V3.19 closed, open and strap-eye CAD renders. Each Ivory scene was visually checked for the slender capsule silhouette, center joint, two compact latches, two original same-edge strap eyes, and appropriate open or suspended orientation. The six other finishes were produced as color-only edits of that scene. These images are visual presentations, not dimensioned CAD or evidence of physical product testing. Exact prompts, reference hashes and asset provenance are recorded in `assets/baguette-use-cases/photos-v1/`.

The gallery shows the current Pro Max proportions in the selected finish. Pro and Mini remain proportional concepts in the separate top model viewer, which still follows the size and finish selectors and supports rotation and opening the actual hinge. The size selection does not rescale photographs. Add-on selections remain concepts and do not create invented accessory hardware in the photos.

Feature close-ups use the original saved CAD review images, shown in Ivory or their engineering annotation colors. They retain their existing photo choices and downloadable manufacturing files. No source geometry, print asset or download has changed.

The former real-time gallery renderer in `src/baguette-composites.js` is retained as historical source but is no longer imported or bundled by the public viewer. Its geometry checks still exercise the shared original-mesh and hinge helpers. The photo tests verify that all 49 scene/finish combinations resolve to distinct, full-resolution JPEGs within the asset size limit.
