# Assembly guide — compact Waveshare 5-C case

**Revision B: measurement prototype, 131.2 × 75 × 23.7 mm.** This saves 0.7 mm
(about 3%) versus revision A. Speaker, camera and cable details still need
measurement; computer clearance does not establish physical fit.

The intact glass/display/PCB enters through the cup's front. Four rear screws
engage its factory posts. **Keep the PCB attached to the display.** The posts
carry the load; the case must not squeeze the glass.

## 1. Gather parts and record measurements

| Item | Quantity / requirement |
|---|---|
| Printed parts | Current cup, glass ring, mounting template and USB coupon |
| Display | Waveshare ESP32-P4-WIFI6-Touch-LCD-5-C assembly |
| Screws | 4 × M2.5 × 5 mm pan/button head, provisional; heads under 5.6 mm |
| Battery | 52 × 36 × 10 mm **including casing**, confirmed |
| Speaker / camera | Actual supplied parts; speaker lead is **50 mm**, confirmed |
| Retention | Battery adhesive 0.25 mm; speaker perimeter gasket 0.5 mm; camera pads 0.3 mm installed |
| Insulation | Nonconductive film on battery's PCB-facing surface |
| Tools | Calipers, hand driver, plastic spudger, soft mat, deburring tool |

The 2 mm screw-seat web leaves about 3 mm engagement with a 5 mm screw.
Check actual usable thread depth, under-head screw length and driver clearance;
use shorter screws if needed. A screw must not bottom against the display.

Measure maximum envelopes, including lips, tabs and strain relief:

| Measurement | CAD assumption / actual result |
|---|---|
| Speaker body L × W × T | Assumed 40 × 30 × 6 mm; actual: __________ |
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

Print at 100% in millimeters; do not scale the model to fix one feature. With
USB removed and battery disconnected:

1. Try the glass ring around every edge and corner. It must not grip the glass.
2. Align the mounting template to all four factory posts simultaneously,
   without bending either part.
3. Try both actual USB plugs through the coupon together. Their housings and
   shoulders must clear. The full cup will also need an insertion-depth check.

**Pass:** free glass clearance, simultaneous hole alignment and room for both
plugs. Correct failed dimensions rather than forcing hardware into a print.

Print the cup **rear face on the bed, open front upward**, as exported.
Provisional settings: PETG, 0.4 mm nozzle, 0.2 mm layers, four perimeters, five
bottom layers. Inspect USB/button opening roofs in the slicer; add local
supports if needed. These settings require validation on your printer.

Remove supports and debris from screw wells, cradles, grille and vents.
Smooth every edge touching the pack or ribbon. Check for warping and clean
mounting seats; do not sand away seat height to hide a fit problem.

## 3. Trial-fit the empty case

Lower the intact display/PCB through the front with its USB sockets facing
the openings. All four factory posts must reach the seats together. Check
the glass perimeter and button movement.

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

1. **Camera:** align the lens with its aperture. Apply small removable 0.3 mm installed pads
   to the four lands only where the actual rigid camera section has clear
   support areas. Do not press components or lens. Leave the flex exit free;
   image testing must confirm the aperture does not shade the picture.
2. **Speaker:** face the verified sound outlet toward the grille. Apply a
   0.5 mm perimeter gasket that retains its enclosure without blocking sound. Keep
   this installed thickness allowance. Route the lead away from seats and
   closing edges.
3. **Battery:** inspect the casing; use removable adhesive in the smooth
   cradle and leave its pull tab accessible. The cradle alone does not hold
   the pack against the rear wall. Revision B budgets **0.25 mm rear adhesive**
   and **0.25 mm total insulating film plus adhesive** on the PCB-facing side.
   Extra foam consumes clearance. Do not rigidly clamp or compress the pack.

The battery relief is on the cradle's left edge; change it if the real lead
exits elsewhere. Keep wires off mounting seats and the glass perimeter, and
leave microphones and vents open. Repeat the final closure rehearsal with
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
flush, edges trap no wires, camera latch is closed and buttons move freely.
Verify BAT connection and unobstructed sound/vent openings.

Use the installed working firmware to check:

- Full screen visibility and touch response across the screen.
- Each USB port's intended function, full insertion and simultaneous physical
  clearance with both plugs fitted.
- Camera aim and image, including shadows from the aperture.
- Speaker output without enclosure buzz; microphone response through the
  actual acoustic paths.
- Power control and battery operation. Observe operation and charging with
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
