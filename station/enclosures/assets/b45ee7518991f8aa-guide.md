# Wall setup W3 - common E case, assembly and installation

The wall assembly has **exactly two printed pieces**: the same common E device
case used off the wall, and its concealed wall holder. Device-case STL and STEP
files are byte-identical in both configurations. Wall use omits the battery and
camera components; their mounting spaces and the camera aperture remain in the
shared cup. USB ports face downward, with the screen facing the room.

All docking components fit inside the case's rounded outline. Three recessed
rear keyholes engage T-head hooks on the holder. A recessed bottom catch locks
the downward slide. The holder is inset 1 mm around the case perimeter.
Exterior RESET, BOOT and POWER access and both small side slots remain closed.

Use the matching **E cup and W3 holder**. Earlier external-ear cups and holders
use a different interface. This is a CAD-checked measurement and snap-fit
prototype. Speaker thickness is confirmed at 4 mm and its lead at 50 mm;
the 40 x 30 mm footprint and physical latch fit still need checking.

![Installed wall device](render/wall-mounted.png)

## 1. Parts, dimensions and preparation

| Item | Specification |
|---|---|
| Print 1 | `exports/devicecase.stl`: shared E cup with recessed receivers and speaker catches |
| Print 2 | `exports/wallholder.stl`: inset frame, three fixed T-head hooks and integral bottom catch |
| Device case, USB down | 75.0 wide x 131.2 tall x 23.7 deep mm |
| Holder including hidden hooks | 73.0 x 129.2 x 9.2 mm; hooks enter the cup |
| Wall-to-front-rim projection | 29.7 mm: 23.7 mm cup + 3.0 mm air gap + 3.0 mm backplate |
| Board retention | Four M2.5 screws into the factory threaded posts; 112 x 57 mm pattern |
| Wall fastener centers | 100.0 mm vertically; upper round hole and lower adjustment slot |
| Wall screw envelope | 4.5 mm through clearance; head at most 8.4 mm diameter x 2.6 mm tall |
| Speaker seal | Perimeter gasket/adhesive, 0.25 mm installed; keep sound outlet clear |

M2.5 x 5 mm remains a provisional board-screw candidate: the 2 mm printed web
leaves about 3 mm theoretical engagement. Check actual post depth and head fit;
use a shorter screw if necessary. Wall screws and anchors must suit the wall.
Their 1.2 mm-deep head recesses leave 1.8 mm of backplate material.

Print both exported STL files at 100%, flat rear face down. Start with PETG,
0.20 mm layers, four perimeters and five top/bottom layers. **The holder needs
removable support under its elevated release beam and T-head overhangs.**
The release beam bends toward the wall, through the part thickness. Remove
supports completely through its open relief; check free movement before use.
Keep support out of the speaker leaves and receiver tracks. The common cup's
receiver chambers open toward the board, so their rear webs build from the bed.

First print the paired `mount-receiver-coupon.stl` and `mount-hook-coupon.stl`.
Check head entry, a 4 mm slide and captured fit without forcing. They test the
hook interface only; bench-test the complete holder's catch separately. The
speaker coupon, glass ring, USB strip and board-mount template are additional
fit-check prints. None becomes an installed third part. Do not print electronic
`*-preview.stl` reference meshes.

## 2. Check the speaker before committing to the full case

![Interior showing the speaker near the rear grille](render/wall-case-interior.png)

1. Measure the rigid speaker housing length, width and thickness. Identify its
   emitting face and wire exit. Do not include loose cable in body dimensions.
2. Test the speaker-clip coupon. The two fixed lips hold one edge; the two
   opposite flexible leaves catch the other edge. The catch acts on the rigid
   housing, never the diaphragm, grille fabric or wires.
3. Place a 0.25 mm installed perimeter gasket around the sound outlet. It seals
   against the rear grille without covering it. The clips provide mechanical
   capture with 0.25 mm axial play, not continuous preload. Lightly tack the
   perimeter gasket to hold the seal and prevent rattle; adhesive does not
   replace the clips. Do not silently substitute thicker foam.
4. Slide the connector-side housing edge under the fixed lips, then gently
   raise the opposite edge about 8°, then lower it over both catch ramps
   toward the grille until both catches return over the housing edge. The modeled axial free play is 0.25 mm.
5. The emitting face is 1.45 mm from the exterior, including the 1.2 mm grille
   membrane and 0.25 mm seal. A 0.4 mm pocket brings the speaker into the rear
   wall. Confirm it does not rock, rattle or require forced deformation.

The fixed-side stop has only 0.10 mm nominal lateral clearance. Calibrate that
fit with the actual speaker and coupon; do not force a too-tight print. Both
right catches must stay engaged when the housing is moved through its full
side play. The new 12.5 mm long, 0.8 mm thick leaves flex within the rear-wall
plane. Their nominal local catch travel is 0.50 mm and free-end travel about
0.75 mm. The coupon is necessary before final use; the design does not
establish insertion force or fatigue life.

If the housing differs from 40 × 30 × 4 mm, update the model and its clearances.
Do not use thick foam to compensate: it changes clip fit and board clearance.

## 3. Assemble the device case on the bench

1. Leave USB disconnected. Omit the battery and camera module for wall use;
   leave the common battery cradle and camera support empty. The common rear
   camera aperture remains unused. It does not provide a useful room-facing
   view when the device is mounted against the wall.
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

The nearest modeled speaker-to-board separation is **7.73 mm** in the common
E case. Rigid-solid checks do not prove that a loose lead or a thicker real
speaker clears the board. Before
closing, physically inspect the wire route and retention fingers.

## 4. Fix the holder to the wall

![Concealed hooks, bottom release and wall fastener recesses](render/wall-holder-detail.png)

1. Orient the holder with the single upper T-head at the top and recessed
   release paddle at the bottom. Leave at least 5 mm above the case for the
   4 mm removal slide, plus room below for a small release tool and USB plugs.
2. Mark the two wall-screw centers on their common centerline, **100.0 mm
   apart vertically**. The lower 4.5 x 8.5 mm slot gives 4 mm of adjustment.
   Print the supplied drill template at actual size; verify both its 50 mm
   calibration bar and 100 mm center spacing. The physical holder is the
   final template.
3. Fit suitable wall screws and anchors. Tighten until the frame rests flat
   without bowing. Keep the moving bottom leaf and its rear relief free of
   wall finish, debris, support residue and adhesive.
4. Check both screw heads sit in their recesses. Confirm the bottom paddle
   can move approximately **2 mm toward the wall** and return freely. Do not
   bend it beyond the release stroke. Test the empty holder over a bench first.

The large frame opening and 3 mm rear air space keep the speaker outlet and
speaker leaf slots clear. Do not seal these paths with full-area foam or tape.
The rear gap also gives access to the recessed release. Physical acoustic and
warm-operation checks remain necessary.

## 5. Dock the device and connect power

![The common case and its separate concealed holder](render/wall-two-pieces.png)

1. Hold the device with the screen facing you and USB ports downward. Keep
   it parallel to the wall, about **4 mm above** its final seated position.
2. Align all three wide keyhole entries with the T-heads. Push straight toward
   the wall until the heads enter and the case approaches the support pads.
   Do not force one hook while the others are misaligned.
3. Slide the case **down 4 mm**. The heads capture the narrow tracks and the
   bottom catch rides its ramp, then returns into the recessed catch pocket.
4. Support the case and check the catch has returned. A gentle upward check
   should encounter the catch after about 0.4 mm free play. The case must stay
   captured without relying on cable tension. If it slides up freely or needs
   excessive force, remove it and correct the printed fit before wall use.
5. Insert the USB supply from below while supporting the cup. Verify full
   connector insertion. Leave slack and room for the cable bend so the USB
   socket and holder carry no cable tension.

The three fixed heads carry the case in their tracks; the bottom catch blocks
the upward removal slide. Nominal head-to-entry clearance is 0.4 mm per side
and neck-to-track clearance is 0.3 mm per side. These values require calibration
for the actual printer. The catch is an integral spring prototype; the CAD does
not establish a retention force, load rating or service life.

## 6. Remove and service

1. Disconnect USB and support the case with one hand.
2. From underneath, insert a small blunt tool into the rear gap at the center
   of the device. The modeled access uses a **2 mm wide, 0.6 mm thick blade**.
   It reaches the recessed paddle behind the case's rear surface; keep the
   tool in this rear gap, away from the USB connectors. Aim near the paddle's
   free end, about 1.5 mm off the device centerline. Identify this end while
   the holder is still on the bench.
3. Press near the paddle's free end approximately **2 mm toward the wall**, hold it released,
   and lift the case **4 mm**. This aligns the heads with the wide entries.
4. Pull the case straight away from the wall. Keep supporting it throughout;
   do not pull outward while the heads remain captured in the narrow tracks.
5. For board-button access or speaker service, remove the four rear M2.5
   screws. Support the display close to the cup and disconnect the speaker
   gently before separating them; its 50 mm wire is not a service tether.
6. To remove the speaker, move both flexible leaves outward in the rear-wall
   plane, lift that housing edge, then slide the other edge from the fixed lips.
   Avoid excessive or repeated clip deflection during fit testing.

## 7. What has been checked

- The shared case and holder are each one connected, watertight printable
  solid. The portable and wall manufacturing case files are identical.
- Exact CAD subtraction verifies that both installed parts fit within the
  rounded 75 x 131.2 mm outline. The holder is inset 1 mm, with no external
  ears, top tab or perimeter hooks.
- Installed parts have zero rigid overlap. Removal samples cover a 4 mm lift
  with the catch released, then straight withdrawal. The closed catch blocks
  upward travel; the released tip and tool path clear fixed holder material.
- The holder clears the speaker leaf access zone. The cup and modeled
  accessories have zero nominal collision with the official 1,201-solid board
  model. Speaker-to-board separation is 7.73 mm in the shared E case.
- These are geometric and ideal spring-envelope checks. They do not simulate
  the full material response or establish continuous-motion tolerance, fatigue,
  layer strength, wire reach, temperature or wall retention. Test the actual
  printed parts and accessories over a bench before installation.

`build_wall.py` copies the common parent cup; `dock_geometry.py` defines the
concealed mechanism. STEP manufacturing files share canonical assembly
coordinates, and separate portrait meshes serve the previews. Numerical
results and file hashes are in `exports/wall-design-checks.json` and
`exports/independent-clearance-checks.json`.
