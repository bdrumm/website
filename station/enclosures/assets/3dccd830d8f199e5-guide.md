# Wall version W1 — assembly and installation

The final assembly has **exactly two printed pieces**: the device case and the
wall holder. It has no battery, camera, camera opening, or exterior openings
for RESET, BOOT or POWER. Two USB ports face downward in portrait orientation.
Microphone openings and the rear speaker grille remain acoustic features.

This is a CAD-checked **measurement and snap-fit prototype**. The speaker body
is still an assumed 40 × 30 × 6 mm and its lead is confirmed at 50 mm. Final
speaker dimensions, cable boots and physical latch fit must be checked.

![Installed wall device](render/wall-mounted.png)

## 1. Parts, dimensions and preparation

| Item | Specification |
|---|---|
| Print 1 | `exports/devicecase.stl` — complete rear cup, integral speaker catches and docking ears |
| Print 2 | `exports/wallholder.stl` — open wall frame, two fixed lower hooks, integral top release latch |
| Device body | 75.0 wide × 131.2 tall × 20.4 deep mm in wall orientation |
| Device including docking ears | 77.6 × 132.15 × 20.4 mm |
| Wall holder | 80.4 × 139.75 × 12.0 mm |
| Installed wall-to-front-rim projection | 26.4 mm: 20.4 mm device + 3.0 mm air gap + 3.0 mm backplate |
| Board retention | Four M2.5 screws through the cup into the existing threaded posts |
| Wall retention | Two suitable wall screws and substrate-specific anchors, if needed; 4.5 mm through clearance |
| Maximum proposed wall screw head | 8.4 mm diameter × 2.6 mm height; 1.2 mm-deep counterbore leaves 1.8 mm of plate |
| Speaker seal | Thin perimeter gasket/adhesive, 0.25 mm installed thickness; leave sound outlet clear |

The 112 × 57 mm factory screw pattern is preserved. M2.5 × 5 mm is a provisional
screw-length candidate with the 2.0 mm printed web (about 3 mm theoretical
engagement). Verify actual post thread depth and head fit; use M2.5 × 4 mm
if the real post cannot accept that engagement. Hardware is separate from the
two printed pieces. Wall screws do not enter the device or touch the PCB.

Use the supplied rear-face-down STL orientation. Both parts sit at z=0, and
the holder latch bends within the printed layers. A starting prototype setup
is PETG, 0.20 mm layers, four perimeters and five top/bottom layers. Inspect the
slicer around all hooks: allow local support only if required by your printer,
and keep support out of the speaker slots and release clearances. The main
top latch starts on the build plane and is isolated by a full-depth slot.

The optional fit-ring, USB coupon, mount template and speaker-clip coupon in
`exports/` are temporary test prints. They are **not installed components**.
The other `*-preview.stl` meshes show electronic parts and are not printed.

## 2. Check the speaker before committing to the full case

![Interior showing the speaker near the rear grille](render/wall-case-interior.png)

1. Measure the rigid speaker housing length, width and thickness. Identify its
   emitting face and wire exit. Do not include loose cable in body dimensions.
2. Test the speaker-clip coupon. The two fixed lips hold one edge; the two
   opposite flexible fingers catch the other edge. The catch acts on the rigid
   housing, never the diaphragm, grille fabric or wires.
3. Place a 0.25 mm installed perimeter gasket around the sound outlet. It seals
   against the rear grille without covering it. The clips provide mechanical
   capture with 0.25 mm axial play, not continuous preload. Lightly tack the
   perimeter gasket to hold the seal and prevent rattle; adhesive does not
   replace the clips. Do not silently substitute thicker foam.
4. Slide the connector-side housing edge under the fixed lips, then gently
   press the opposite edge toward the grille until both fingers return over
   the housing edge. The modeled axial free play is 0.25 mm.
5. The emitting face is 1.45 mm from the exterior, including the 1.2 mm grille
   membrane and 0.25 mm seal. A 0.4 mm pocket brings the speaker into the rear
   wall. Confirm it does not rock, rattle or require forced deformation.

The fixed-side stop has only 0.10 mm nominal lateral clearance. Calibrate that
fit with the actual speaker and coupon; do not force a too-tight print. Both
right catches must stay engaged when the housing is moved through its full
side play. Angled insertion may require about 0.70 mm catch movement versus
0.50 mm for aligned insertion, so the coupon is necessary before final use.

If the housing differs from 40 × 30 × 6 mm, update the model and its clearances.
Do not use thick foam to compensate: it changes clip fit and board clearance.

## 3. Assemble the device case on the bench

1. Leave USB disconnected. Remove or omit the battery and camera module. Do
   not tuck a connected camera behind this version; there is no optical path.
2. Rest the cup rear-face down on a soft surface. Install the speaker first as
   above. Its wire notch faces the nearby board speaker connector.
3. Hold the intact screen/PCB assembly near the cup and connect the 50 mm
   speaker lead. Guide the lead through the relief beside the fixed lips.
   Check slack with the board in its installed position before lowering it.
   The lead must not cross a screw post, clip tip or board component.
4. Lower the intact board/display through the open front. Its four threaded
   posts must contact the printed supports. The glass has clearance at its
   perimeter; do not press on the glass to overcome misalignment.
5. Fit all four rear M2.5 screws loosely, then tighten gradually in a diagonal
   order only until seated. Check that each screw engages the post without
   bottoming and that the screen remains flat.
6. Test USB insertion through both bottom openings with the actual cables.
   Nominal boot openings are 14 × 8 mm. Confirm full electrical engagement,
   rather than assuming a cable that enters the opening is fully connected.
7. Plug in on the bench. Check display, touch, power-on behavior, speaker and
   microphones. Check restart/recovery needs before mounting: the side board
   buttons are enclosed and require opening the cup for direct access.

The nearest modeled speaker-to-board separation is 2.43 mm. This does not
prove that a loose lead or a thicker real speaker clears the board. Before
closing, physically inspect the wire route and retention fingers.

## 4. Fix the holder to the wall

![Holder showing top latch, lower hooks and screw recesses](render/wall-holder-detail.png)

1. Choose the mounting position with the **release tab at the top** and the
   split lower hooks at the bottom. Leave at least 10 mm clear above the tab
   for your finger and enough space below for full plug insertion and the
   actual cable's bend. Do not preload the sockets with a taut cable.
2. Present the empty holder to the wall and mark its two screw centers. They
   share a centerline and are **111.0 mm apart vertically**. The lower hole
   is a 4.5 × 8.5 mm slot, giving 4 mm of adjustment. The optional
   `wall-drill-template.svg` is a paper layout; print at 100% and check its
   50 mm reference bar before use. The physical holder is the final template.
3. Fit screws/anchors appropriate to the actual wall. The design specifies
   hole and head envelopes, not a wall-anchor type or load rating.
4. Tighten until the frame lies flat. Avoid warping the frame or trapping the
   moving top latch. Both heads must fit their recesses and remain within
   the stated envelope. The recessed heads leave clearance behind the case.
5. Confirm that the top tab moves upward 1.2 mm and springs back freely. Its
   sides and the full-depth relief slot must remain clear of wall finish,
   debris, supports or excess plastic.

The holder has a large central opening aligned with the speaker outlet and
3 mm between the case rear and backplate. Sound exits through the frame
opening and surrounding air gap. Do not add full-area foam or tape that seals
this path. Acoustic performance and warm operation need physical checks.

## 5. Dock the device and connect power

![The device case and its separate wall holder](render/wall-two-pieces.png)

1. Hold the case with the screen facing you and USB ports downward. Tilt its
   top about 8° toward you. Keep the two lower side ears level with the hooks.
2. Put the lower ears behind the short front returns of the fixed hooks, then
   lower them onto the seats. These hooks carry the downward load.
3. Pivot the top toward the wall. The top ear follows the latch's sloped lead-in
   and deflects its free tip upward; it then returns over the ear. Verify that
   the tab has fully returned and the device is retained at the top.
4. Support the case and gently check retention without pulling on the glass.
   It must not come away unless the top tab is released. If engagement is weak
   or requires excessive force, remove the device and tune the snap fit.
5. Insert the intended USB supply cable from below, holding the cup while
   inserting. Both port paths are unobstructed by the holder, with a 56.7 mm
   open central sector below them. Give the cable slack independent of the
   case so a pull does not load the latch or USB connector.

The top latch provides 0.8 mm nominal overlap. A 1.2 mm release movement leaves
0.4 mm clearance. Its nominal 28 mm × 1.2 mm cantilever geometry gives about
0.276% ideal surface strain for that movement. This is a geometry estimate,
not a measured fatigue life, pull-off rating or assurance for all filaments.

## 6. Remove and service

1. Disconnect the USB cable and support the device with one hand.
2. Move the exposed top tab upward, away from the case, by roughly 1.2 mm.
   Keep supporting the device while the top latch disengages.
3. Tilt the top toward you about 8°. Lift the device about 3 mm to clear the
   lower hook returns, then pull it away. Do not pull straight outward against
   the lower ears while they remain hooked.
4. Remove the four rear M2.5 screws for board-button access or speaker service.
   Unplug the speaker gently before separating the board from the cup; its
   50 mm lead is not a service tether.
5. To remove the speaker, gently move both flexible fingers away from its
   rigid edge and lift that edge; slide the other edge out from the fixed lips.
   Avoid repeated large clip deflections during fit testing.

## 7. What has been checked

- Both final print meshes are watertight, each is one connected solid, and
  both lie on the print plane in the provided STL orientation.
- The two installed CAD pieces have zero rigid overlap.
- Nominal removal samples cover an 8° tilt, 3 mm lift and forward withdrawal
  without hitting fixed holder material. Latch-tip checks separately cover
  the cam region and the released tip. These are discrete rigid-geometry
  checks; they do not simulate material flex or prove continuous-motion fit.
- The modified cup and modeled speaker have no nominal collisions against
  the official 1,201-solid Waveshare assembly. The nearest speaker separation
  is 2.43 mm. All four original mounting locations remain unchanged.
- Physical speaker fit, 50 mm lead routing, cable boots, latch print tolerance,
  layer strength, thermal behavior and installed wall retention remain to be
  checked. Begin over a bench and use the appropriate wall hardware.

The source is `build_wall.py` plus `dock_geometry.py`, which reuse the shared
parent `case.py`. Manufacturing STEP files preserve portrait assembly
coordinates. The latest numerical results and STL hashes are in
`exports/wall-design-checks.json` and `exports/independent-clearance-checks.json`.
