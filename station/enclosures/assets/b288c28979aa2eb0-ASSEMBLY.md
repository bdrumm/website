# Assembly guide — compact Waveshare 5-C case

**Revision F: one shared device cup, 131.2 × 75.0 × 23.7 mm.**
The outer front/rear edges have a 0.6 mm chamfer with 0.15 mm rounded
transitions. Minimum front rim width is 1.138 mm.
The docking receivers are recessed into the rear; there are no external ears.
The same printed cup works handheld or in holder W3. Portable assembly adds
the battery and rear camera; wall assembly leaves their mounting spaces empty.
Speaker thickness is confirmed at **4 mm**; its length/width and cable exit
still need measurement. The small side slots and board-button openings stay
closed. Computer clearance does not establish physical fit.

The intact glass/display/PCB enters through the cup's front. Four rear screws
engage its factory posts. **Keep the PCB attached to the display.** The posts
carry the load; the case must not squeeze the glass.

## 1. Gather parts and record measurements

| Item | Quantity / requirement |
|---|---|
| Printed assembly | Shared device cup F (one printed assembly part) |
| Test prints | Glass ring, mounting template, USB strip, speaker clip coupon |
| Display | Waveshare ESP32-P4-WIFI6-Touch-LCD-5-C assembly |
| Screws | 4 × M2.5 × 5 mm pan/button head, provisional; heads under 5.6 mm |
| Battery | 52 × 36 × 10 mm **including casing**, confirmed |
| Speaker / camera | Actual supplied parts; speaker **4 mm thick**, lead **50 mm**, confirmed |
| Retention | Battery adhesive 0.25 mm; speaker perimeter gasket 0.25 mm; camera support pads 0.3 mm installed |
| Insulation | Nonconductive film on battery's PCB-facing surface |
| Tools | Calipers, hand driver, plastic spudger, soft mat, deburring tool |

The 2 mm screw-seat web leaves about 3 mm engagement with a 5 mm screw.
Check actual usable thread depth, under-head screw length and driver clearance;
use shorter screws if needed. A screw must not bottom against the display.

Measure maximum envelopes, including lips, tabs and strain relief:

| Measurement | CAD assumption / actual result |
|---|---|
| Speaker body L × W × T | Thickness **4 mm confirmed**; assumed L × W 40 × 30 mm; actual L × W: __________ |
| Speaker outlet and wire exit | Face / edge / corner offset: __________ |
| Speaker usable lead | Confirmed 50 mm; exit to seated plug: __________ |
| Camera rigid L × W / total lens height | Assumed 16 × 16 × 8 mm; actual: __________ |
| Lens diameter / center from edges | Assumed Ø10 mm, centered; actual: __________ |
| Camera usable flex / bend route | Seated connector to rigid section: __________ |
| Both USB housings / shoulders | Assumed 14 × 8 mm; actual: __________ |
| Battery lead exit / usable length | __________ |
| Four posts' usable thread depth | __________ |
| Actual microphone acoustic path | __________ |

**Pass:** measured bodies fit the cradles and leads reach through installation.
Otherwise revise the CAD and clearance checks before approving the cup.

## 2. Print the coupons, then prepare the cup

The combined `exports/p4-5c-case-and-wall-holder.3mf` contains the cup and
holder as two separate objects in their print orientation.

Print at 100% in millimeters; do not scale the model to fix one feature. With
USB removed and battery disconnected:

1. Try the glass ring around every edge and corner. It must not grip the glass.
2. Align the mounting template to all four factory posts simultaneously,
   without bending either part.
3. Try both actual USB plugs through the coupon together. Their housings and
   shoulders must clear. The full cup will also need an insertion-depth check.
4. Test the speaker clip coupon with the actual rigid housing. Slip its left
   edge under the fixed lips, then press the right housing edge past both
   catches. Push only on the rigid enclosure. Release by deflecting the right
   fingers outward with a plastic spudger and lifting the right edge. The
   clips must recover without cracks or whitening; do not force a mismatch.
   Both rear leaf slots must stay clear, and each catch must move outward
   and return independently. Move the housing through all available lateral play: both right catches
   must remain engaged. The narrow left stop gap is a fit-sensitive feature.

**Pass:** free glass clearance, simultaneous hole alignment and room for both
plugs. Correct failed dimensions rather than forcing hardware into a print.

Print the cup **rear face on the bed, open front upward**, as exported.
Provisional settings: PETG, 0.4 mm nozzle, 0.2 mm layers, four perimeters, five
bottom layers. Inspect USB roofs and the small clip hooks in the slicer; add local
supports only where required. Keep supports out of flexure gaps. Use the
exported orientation so the rear-wall leaf springs lie on the build plane.
Keep brim, adhesive and support material out of their isolation slots. These settings require validation on your printer.

Remove supports and debris from screw wells, cradles, grille and vents.
Smooth every edge touching the pack or ribbon. Check for warping and clean
mounting seats; do not sand away seat height to hide a fit problem.

## 3. Trial-fit the empty case

Lower the intact display/PCB through the front with its USB sockets facing
the openings. All four factory posts must reach the seats together. Check
the glass perimeter and internal button clearance. The outside walls at
RESET, BOOT and POWER are solid; access requires opening the case.

Hold the assembly securely and insert both USB plugs, separately and together.
They must fully seat and withdraw without moving the board sideways. Check
cable shoulders clear the wall. Remove plugs and lift the assembly out while
supporting it, not pulling connectors.

**Pass:** no rocking, trapped buttons or obstruction. Never use screws to
pull an unseated assembly into position.

## 4. Identify connectors and rehearse lowering

View the PCB rear with USB left and buttons at the top. Confirm labels on the
actual revision against `reference/board-hardware.webp`:

| Part | Correct connector |
|---|---|
| Speaker | **SPK**, upper-left |
| Main battery | **BAT**, lower-left; verify actual pin polarity |
| Camera | **CAMERA**, right of center |

**RTC** at lower-right is not the main battery input. The existing
**DISPLAY** flex at left-center stays connected.

Before peeling adhesive liners, place battery left-middle, speaker upper-right
and camera lower-right, lens toward the rear opening. Support the display
just above the cup on a stable padded support or with a second pair of hands.
Connect SPK and CAMERA while unpowered; leave BAT unplugged.

Identify the actual camera latch and flex contact orientation. Open the latch
correctly, seat the ribbon squarely and close it without force. Do not infer
contacts from cable color or crease the ribbon at its rigid section.

Rehearse lowering **and lifting**. Measure the actual speaker wire route from
its exit to the seated plug, including bends and installation slack. The
initial layout's roughly 35 mm shortest distance does **not** establish that a
50 mm lead works. Repeat for camera flex and battery lead. Nothing may become
taut or carry the display's weight. If this fails, revise placement before
fixing accessories; a fully seated fit alone is insufficient.

## 5. Retain accessories and route leads

Disconnect rehearsal connections while supporting both ends.

1. **Camera:** its flex can lift the rigid module away from the PCB, as you
   confirmed. Aim the lens straight out of the rear opening. The integral
   U-shaped nest supports the rigid section on three padded rails, with its
   left side open for flex routing toward CAMERA. Apply removable 0.3 mm
   installed pads only where the real module has clear, rigid support areas.
   Seat it against those pads and within the side guides. Neither the lens
   nor flex should carry mounting load. The modeled lens face is 0.3 mm
   below the exterior. Recalculate the nest height after measuring the real
   module; do not pull the ribbon taut to reach a guessed height. Before
   closure, confirm the lens is centered and the flex makes a relaxed bend
   without rubbing a post, speaker clip or sharp edge.
2. **Speaker:** verify its actual sound outlet faces the rear grille. Fit a
   thin perimeter gasket to the rigid housing rim, with **0.25 mm installed
   thickness**. Keep the diaphragm and acoustic outlet clear. Angle the left
   housing edge under the two fixed lips, lower the opposite edge and press
   its rigid rim gently until both right clips engage. The nominal catches
   overlap by 0.25 mm and leave 0.25 mm axial play: retention must not depend
   on squeezing the housing. Each catch is carried by a 12.5 mm leaf running
   along the speaker edge, with relief slots through the rear wall. Keep those
   slots free of adhesive, supports or tape so the leaf can move sideways.
   Light tack at the perimeter gasket maintains
   the acoustic seal and prevents rattle; the clips capture the housing but
   do not preload it. The local grille is 1.2 mm thick; the modeled
   radiating face sits 1.45 mm from the exterior, 0.65 mm closer than revision B.
   Route the lead through the left notch toward SPK. A left/top-left wire exit
   is needed for the proposed 50 mm route; a right-side exit may not reach.
3. **Battery:** inspect the casing; use removable adhesive in the smooth
   cradle and leave its pull tab accessible. The cradle alone does not hold
   the pack against the rear wall. Revision F budgets **0.25 mm rear adhesive**
   and **0.25 mm total insulating film plus adhesive** on the PCB-facing side.
   Extra foam consumes clearance. Do not rigidly clamp or compress the pack.

The battery relief is on the cradle's left edge; change it if the real lead
exits elsewhere. Keep wires off mounting seats and the glass perimeter, and
leave the rear grille and ventilation field open. Repeat the final closure rehearsal with
adhesive and film present.

The modeled minimum rigid gap after insulation is approximately **1.07 mm**.
This excludes lead tabs, installation tolerances and pack expansion; it is
not thermal approval. The pack partly overlaps the processor footprint.

## 6. Connect, close and fasten

With power off and USB removed, support the display in the rehearsed position.
Connect SPK and CAMERA. Verify the pack's electrical specification and
connector polarity against the actual board; wire colors are not proof.
**Connect BAT last.**

Lower evenly while guiding leads into their checked paths. Stop at resistance.
Confirm all posts meet their seats and the rim leaves the glass free. Hold
cup and display together, turn them onto a clean soft flat support, and access
the rear screw wells.

Start all four screws by hand. Bring heads into light contact in opposite
corners, then tighten gently and evenly with the hand driver. No torque has
been validated. Stop if a screw bottoms early, spins freely, or the assembly
bends. Closing must not require glass clamping or pack compression.

## 7. Inspect and accept the assembly

Before USB power, confirm the pack is retained without pressure, seats are
flush, edges trap no wires, camera connector latch is closed and the solid side walls do not touch
any button actuator.
Verify BAT connection and unobstructed sound/vent openings.

Use the installed working firmware to check:

- Full screen visibility and touch response across the screen.
- Each USB port's intended function, full insertion and simultaneous physical
  clearance with both plugs fitted.
- Camera aim and image, including shadows from the aperture.
- Speaker output without enclosure buzz; microphone response through the
  actual acoustic paths.
- Battery operation. External reset, boot and power-button access has been
  removed; use the existing software controls or open the case for service.
  Observe operation and charging with
  the case installed, using available diagnostics and the manufacturers'
  limits. Insulation provides electrical separation; acceptable temperatures
  still need evaluation in this compact arrangement.

Record revision, print material, measured parts, screw length and failures.
Approve the enclosure after physical and functional checks pass.

## 8. Open for service

Power off and remove USB. Support the display while removing the screws.
Turn the unit opening-up, holding both parts. Lift only within the rehearsed
slack, support the display, and disconnect BAT first when accessible. Then
unplug speaker/camera as needed. Never hang the display from leads or ribbon.
MicroSD access uses the same supported opening procedure.


For the batteryless, cameraless wall version, use `wall-mount/WALL-INSTALLATION.md`.
It uses the exact same device cup F plus holder W3, with both USB sockets down.
The wall build omits the battery and camera; the shared cradle, camera nest
and rear camera aperture remain present but unused. This is not a sealed case.
The wall and portable manufacturing STL/STEP files are identical copies.
