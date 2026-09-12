# Baguette holder use-case renderings

## Everyday purse and storage scenes · 2026-09-12

Added `purse-background.jpg` and `essentials-background.jpg`, generated with the **built-in image-generation tool**, then saved here as 1536×1024 JPEGs at quality 88. These images contain backgrounds and everyday objects only; the live page overlays the actual current Pro Max CAD model. Pro, Mini and the selected expansion, card-holder and bottle-holder options are labeled as concepts; no unreviewed printable variants are distributed.

### purse-background.jpg — exact prompt

Use case: photorealistic-natural. Asset type: clean background plate for a browser-rendered product lifestyle scene, landscape 1536x1024. A stylish adult in a warm charcoal cropped jacket and straight stone-colored trousers, cropped from shoulders to upper thighs, standing outside a quiet cream-stone city café. Front three-quarter view, torso nearly straight to camera, adult at center. Their hands are resting in trouser pockets and both forearms sit towards the outer edges, leaving the hip/waist area unobstructed. Natural soft late afternoon light from upper left, realistic clothing weave and understated city background. The central waist area from x=18% to 82%, y=45% to 72% must be completely uninterrupted clothing with no foreground object, so an actual slim 3D case and straps can be rendered there afterward. No bag, purse, case, strap, bread, container, logos, text, watermarks or extra people. Keep shoulders at y=0 and hips around y=60%. Editorial product photography background only.

### essentials-background.jpg — exact prompt

Use case: photorealistic-natural. Asset type: clean background plate for a browser-rendered product lifestyle scene, landscape 1536x1024. An elegant overhead / shallow three-quarter view of a pale oak café table, warm diffuse daylight from upper left. The middle band of the table x=12% to 88%, y=29% to 69% is completely EMPTY and clear, reserved for a real 3D case to be rendered later. Neatly arrange a few ordinary personal essentials around the OUTSIDE edges of this empty area: a slim blank dark card wallet and two metal keys at bottom left, tortoiseshell sunglasses and a small lip balm at bottom right, a closed small notebook at upper right, soft neutral linen folded at upper left. Real materials, credible small objects, restrained editorial styling. The clear center is the dominant visual area, no painted shadow of a missing case. No baguette, food, purse, bag, product case, straps, bottle, logos, readable text or watermark. Landscape 1536x1024.


## Live CAD composites · 2026-09-12

The public project page now uses the five `*-background.jpg` files as clean background plates. The product, cord loops and webbing are rendered in the browser above each plate. The earlier complete illustrations below are preserved as source assets and are no longer used as the public lifestyle previews.

Background plates were edited with the **built-in image-generation tool** from their corresponding `carry.jpg`, `rain.jpg`, `picnic.jpg`, `travel.jpg` and `backpacking.jpg` originals. Outputs were converted to 1536×1024 JPEGs at quality 88. The real product geometry comes from `../../reviews/baguette-v3/baguette-v3.glb` (V3.17), not from image generation. See `../../docs/baguette-composites.md` for rendering and calibration details.

Saved assets: `carry-background.jpg`, `rain-background.jpg`, `picnic-background.jpg`, `travel-background.jpg`, `backpacking-background.jpg` in this directory.

### Exact background-edit prompt

Use case: precise-object-edit. Create a CLEAN BACKGROUND PLATE from the supplied lifestyle photograph. Remove the entire ivory baguette case, ALL of its carry strap/webbing/cord loops, and every product-cast shadow. Reconstruct the clothing, person, fabric, table or scenery naturally and seamlessly behind those removed objects. Preserve the person, pose, face crop, hands, clothing, backpack (including the backpack's own original black/olive shoulder harness), background, camera, framing, existing natural lighting, weather, other objects and resolution EXACTLY. Do not introduce any replacement product, case, strap, bag, bread or new foreground object. For the picnic scene only, also remove the baguette INSIDE the case, leaving uninterrupted linen blanket where the entire case and bread were. For rain, keep raindrops on the coat and the rainy background. This will be used behind an accurately positioned real 3D product, so the formerly occupied product area must be completely empty and naturally inpainted. Landscape 1536x1024, no text or watermark.

## Original illustration provenance

Generated with the built-in image-generation tool on 2026-09-12, using the V3.14 CAD renders in `reviews/baguette-v3/` as references. These are concept illustrations, not photographs of a tested physical product. Straps are illustrative accessories and are not part of the printable geometry.

## Source references

- `../../reviews/baguette-v3/closed.jpg`
- `../../reviews/baguette-v3/strap.jpg`
- `../../reviews/baguette-v3/open.jpg`

## Shared generation prompt

Use case: photorealistic-natural. Asset type: landscape editorial lifestyle rendering for the Parametric Space baguette holder project page, 1536×1024. Reference images are exact CAD renders of the CURRENT product: closed case, strap eye detail, and open case respectively. Preserve its precise identity: a slender 600 mm long rigid warm ivory/champagne capsule shaped like a baguette, roughly 80 mm wide, rounded ends, gently sculpted shallow diagonal marks, horizontal clamshell seam, single center transverse joint, two small flush latches along the front rim, and exactly two integrated flattened rounded rectangular strap eyes at the two front-rim ends. Satin 3D-printed polymer, never leather or fabric casing. Added dark olive 15 mm woven webbing is a separate accessory and must connect ONLY through those existing small end eye slots with thin cord loops; don't invent new attachment points, handles, wrapping bands or metal rings. Believable adult scale, crisp product geometry, restrained natural colors and realistic soft light. No text, logo, watermark, collage, floating parts, or duplicate product.

## Scene prompts

### carry.jpg

Show the closed case suspended horizontally at an adult's hip by one long olive shoulder strap passing up over their opposite shoulder. Frame from upper torso to thigh, face outside frame, relaxed neutral linen clothing, quiet stone street background. Case prominent and entirely visible with both end connections readable; strap tension follows gravity. Natural morning light. The image should clearly explain hands-free shoulder carry.

### rain.jpg

Show the closed case worn diagonally beside an adult's hip on the same olive strap in a light rain shower. Crop from shoulder to mid-thigh; charcoal rain jacket, wet stone sidewalk, soft blurred city background. Fine raindrops visible on the shell and jacket, moody overcast light. Keep both end eye connections physically plausible and show the front latches and middle seam. A gentle everyday rainy walk, not submersion or a waterproof demonstration.

### picnic.jpg

Show the OPEN case at about 100 degrees with a real crusty baguette nestled in its lower shell on a simple natural linen picnic blanket in grass. Match the open reference hinge position, narrow lower shell, smooth rib-free interior and all current geometry. The removable olive strap rests loosely beside it, attached to both existing end eyes. A small apple and a folded cloth are secondary in background. Three-quarter overhead composition with whole case visible, warm dappled afternoon light, believable bread size fitting within the 600 mm case.

### travel.jpg

Show the closed ivory case resting lengthwise on a train window-side table, with an olive carry strap connected through the two existing end eyes and lying in a relaxed loop on the table. Entire 600 mm case visible, both small latches and center seam recognizable, composition with blurred countryside through window and a small neutral weekend bag on the adjacent seat. Quiet travel editorial, soft window light, no readable signage. Keep product the dominant subject.

### backpacking.jpg

Show a rear three-quarter view of an adult walking a wooded trail with a subdued olive hiking backpack. The closed ivory 600 mm holder is carried horizontally across the outside lower face of the pack, secured by short webbing accessory links threaded through its TWO actual end eye slots to the pack webbing. The links are taut and visibly support the case. No straps wrap around or hide the case; front seam, two latches and center joint remain readable. Whole case visible, realistic adult scale, muted forest, diffuse daylight, functional and candid, no other people.

## Attachment correction

Applied to carry, rain and backpacking after visual review, with the original generated scene plus the strap and closed CAD renders as references.

Use case: precise-object-edit. Image 1 is the target lifestyle rendering. Image 2 is the exact real CAD strap-eye reference; image 3 is the full exact closed case. Change ONLY the strap attachment at each end of the case in image 1. The two flattened rectangular projecting EYES on the FRONT RIM already exist and are currently EMPTY. Route each dark olive cord loop THROUGH the empty slot in those existing low front-rim eyes. REMOVE the invented raised eyes/holes on TOP of the lid entirely and restore a smooth unbroken lid there. There must be exactly TWO total attachment eyes, the existing low projecting ones at each end of the front seam, BOTH occupied by cord. Move the lower strap ends forward/down just enough to pass through these slots, maintaining taut support against gravity. Keep the case shape, size, latches, center seam, person, scene, lighting, weather, and every other detail unchanged. No additional hardware, no duplicate eyes, no new holes or handles, no text.

## Suspension and shoulder-carry revision · 2026-09-12

Updated `carry.jpg`, `rain.jpg` and `backpacking.jpg` with the built-in image-generation tool. The carrying case hangs below its two outward-projecting attachment eyes, with the straps pulling clear of the shell. The hiking scene uses a shoulder strap rather than attachments to the backpack. The picnic and train scenes retain their resting, unloaded straps.

### Shared suspension edit prompt

Use case: precise-object-edit.
Asset type: photorealistic lifestyle rendering for the existing baguette-holder project, landscape 1536x1024.
Inputs: image 1 is the lifestyle edit target. Image 2 shows the true CAD attachment-eye geometry. Image 3 shows the complete true case as a geometry reference, NOT its desired hanging orientation.
Primary correction: physically correct suspension from the TWO OUTWARD-PROJECTING strap eyes. In the target the case incorrectly sits flat like a tray while the straps bend over its lid. ROLL THE ENTIRE RIGID CASE roughly 90 degrees ABOUT ITS LONG AXIS: its broad lid face should be nearly VERTICAL, facing the viewer outward like the side of a shoulder bag. Its two actual protruding strap eyes should now be along the UPPER long edge, visibly ABOVE the case's center of mass. All shell geometry, center joint, seams, eyes and two latches rotate TOGETHER. Do not relocate, duplicate or invent eyes.
Thread a short olive cord loop through EACH existing eye slot. Under the case's weight each loop bears against the OUTER bridge of its eye, extends OUTWARD AWAY from the shell and then UP toward the shoulder strap. The two strap branches run straight and taut through free air to the shoulder. Leave visible daylight between strap/cord and the case surface; never run them over the lid, through the shell, wrapped around an end, or hooked to a latch. The entire body hangs BELOW those two tension points with believable gravity and balance. Match a real suspended slender shoulder bag, not a flat tray supported from below.
Preserve the original 600 mm slender warm ivory 3D-printed capsule design, its shallow diagonal contours, center transverse joint, two flush latches, exactly two original integral rectangular strap eyes, correct adult scale, satin polymer, and visual identity. Keep the whole product visible. No typography, labels, logos, watermarks, extra hardware or duplicate products.

### Scene-specific edits

#### carry.jpg

Preserve this person, linen clothing, street, lighting and general framing. Carry the reoriented case at the same hip from one continuous olive strap over the shoulder. Both outward eye connections and the broad upright lid face must be clear. Change only the case's hanging orientation and strap load path, preserving its exact rigid shape.

#### rain.jpg

Preserve this person, black rain jacket, raindrops, street, light and general framing. Carry the reoriented case at the same hip from the olive shoulder strap. The two eye connections are above the hanging shell, with taut strap branches clear of the surface. Change only the case's hanging orientation and strap load path, preserving its exact rigid shape.

#### backpacking.jpg

Change how the hiker carries the case. REMOVE the two short links suspending it from the backpack. Instead add one continuous olive SHOULDER STRAP worn OVER THE PERSON'S SHOULDER, passing across the torso, with two taut branches descending to the actual case eyes. The case hangs freely beside the person's hip, on their side, NOT attached to or resting across the backpack. Adjust the person's angle slightly to a side/rear three-quarter view if needed to make the shoulder strap and both eye connections visible. Preserve the same forest trail, lake, muted olive clothing and backpack, natural light and overall editorial photographic style. No hand holding the case; the shoulder strap bears its weight.

### Latch-position correction

Use case: precise-object-edit. Image 1 is the target lifestyle scene with the CORRECT new suspended orientation. Image 2 is the actual CAD closed case showing exact relation between strap eyes, clamshell seam and latches. Keep the new hanging orientation, taut strap path clear of the shell, shoulder carry, two upper strap eyes, person, pose, background, lighting and framing UNCHANGED. Correct ONLY the misplaced latch edge: in the real model the TWO latches and the TWO strap eyes are on the SAME long edge. Move both small ivory latch clips from the LOWER visible edge to the UPPER long rim, between the two existing strap eyes, one on either side of the center joint, approximately one-quarter and three-quarters along the case. Ensure a thin straight clamshell seam connects along this SAME UPPER rim beneath the eyes and the two latches. Remove the old lower latch clips completely and restore a smooth lower silhouette there. Preserve exactly two latches and two eyes, exact slender capsule, center transverse joint and subtle sculpted shape. Do not change the eyes or move the straps. Do not flatten the case back into a tray; it must still hang below the two high outer tension points. No added parts, holes, duplicate latches, text or watermark. Landscape 1536x1024.
