# P43 — Battery wall, measured 4.3-inch board

**Measurement prototype — physical fit is not yet approved.**

Case, portrait: **71.6 × 118.3 × 24.5 mm**. Main rim: **17.2 mm**. Mount face to front rim: **28.8 mm**. Existing wall-cover projection is additional. Print the one-piece case and holder as a matched set; P43/Q43 holders are not interchangeable.

The **65 × 36 × 10 mm** cased battery lies lengthwise along the display's 114 mm dimension, beside the **26 × 26 × 5 mm** speaker. The dimensions include the battery casing. The speaker retains its full-size housing, long clip leaves and 50 mm lead. This P43 layout supersedes the archived K43 layout for the earlier 52 mm battery.

The battery front is z11.45 mm; its insulating film begins at z11.2 mm, about 0.55 mm above the nominal FPC connector beneath it. The closed pod ends at z23.3 mm, 1.3 mm before the holder plate and 0.3 mm ahead of the modeled 7 mm diameter × 2.2 mm high wall-screw heads. The internal lead recess is at the battery's lower-left edge in the rear-view USB-left frame. The speaker's rear pod has a local chamfer that clears the full-size lower mounting bosses; the retaining lips and housing seat remain intact. The upper rigid hook is relocated toward the free side of the battery. Use the new matching holder: the K43 holder is incompatible. Both USB ports are exposed underneath. Release is on the **right**. No camera is installed.

Place the pack in its cradle with a removable pull tab. The combined insulating film and board-facing adhesive budget is 0.25 mm; rear pad allowance is 0.25 mm. Confirm the actual pack lead can reach the main BAT socket without loading it. Connect BAT last, after verifying polarity and compatibility. Route a bottom USB supply with strain-relief slack. The rear battery pod occupies the space that a rear power plug would otherwise need.

## Fit and hardware

This revision is for the PCB labeled **ESP32-P4-WIFI6-Touch-LCD-4.3**. The owner measured the glass at **114 × 65 mm** and front glass to screw end at **11.5 mm**, and confirmed a **92 × 50 mm** screw pattern. Speaker housing: **26 × 26 × 5 mm**, lead **50 mm**. Battery casing: **65 × 36 × 10 mm**.

The newer manufacturer drawing has **114.4 × 66.8 mm** glass and an **11.15 mm** post face. The case uses the owner's outline and depth. The manufacturer electronics retain their physical size; they are translated, never scaled. The nominal glass-to-post offset is provisional, with screw adjustment of ±0.35 mm along the long dimension and ±1.0 mm across the short dimension. Nominal centers in the rear-view USB-left glass frame: x8.75/100.75, y7.5/57.5.

The glass cavity is **114.7 × 67 mm**, retaining 0.35 mm at each top/bottom end of the 114 mm axis and providing **1.0 mm per left/right side** of the 65 mm axis. The physical glass remains 114 × 65 mm; no component was scaled. Print the **glass-fit-ring** and **mount-pattern-template** first. The flat post template checks spacing; use calipers to compare its glass outline with the actual glass-to-post offsets. The **fit-jig** also registers the glass rim and screw seats at their actual depth. If the glass or posts need force, stop and record the mismatch; do not scale the whole print or tighten screws to pull the screen into place.

Use four M2.5 screws with **7 mm OD metal washers, up to 0.5 mm thick**. The slotted supports have a 2 mm bearing web. Choose screw length from that web, washer thickness and the actual usable post thread depth: L = 2 mm + washer thickness + safe engagement. A 4 mm screw with a 0.5 mm washer gives approximately 1.5 mm engagement. Confirm this suits the actual posts before tightening; the screw must not bottom out or reach the display stack. Head OD must fit the modeled 7.6 mm well before its adjustment allowance.

## Print and clean

- Use the supplied millimeter 3MF at 100% scale. Each contains exactly two objects: the one-piece device case with integral lip, and the matching wall holder. Electronics and cable envelopes are preview references only.
- PETG, 0.4 mm nozzle, 0.2 mm layers, five perimeters and 25% gyroid are the starting profile. Use supports from the bed and on the model where required under hook caps, receiver roofs and the elevated latch. Preserve the export orientation.
- Print the case rear face down, opening upward. Raised pods mean the surrounding back needs support. Print the holder wall face down, hooks upward. The integral 0.8 mm lip prints at the top of the cup. Remove support from beneath both long lip edges; the front aperture gives access.
- Remove supports from all clip slots, hook entries, screw wells and the 2.3 mm latch stop gap. Cut supports into pieces instead of levering against a spring. Inspect roots for cracks or layer separation.
- First test the supplied speaker and mount coupons. Slip the actual speaker under the two fixed lips, then press the opposite housing edge past the two long catches. The seat provides 0.25 mm axial play; it does not compress the gasket by design. The speaker's radiating face sits 1.45 mm inside the exterior, including 0.25 mm gasket allowance and a 1.2 mm grille wall. Keep adhesive away from flexure slots and the sound outlet.

## Assemble the device

1. Keep USB and BAT disconnected. Keep the display and PCB attached as one unit.
2. Install the speaker with its sound outlet facing the grille. Capture the rigid enclosure, not a diaphragm. Rehearse insertion and removal with the coupon. The molded speaker corner radius and wire exit remain unmeasured.
3. Fit the battery and insulation as described above. Orient its leads toward the internal lower-left recess; verify the real lead exit and length before applying removable adhesive. Keep the lead in the internal path; no external BAT slot is required.
4. Support the display beside the case within the **50 mm speaker lead** reach. Connect SPK (GH1.25, 2-pin). Route it to the speaker's open cradle edge, away from screw wells, spring slots and sharp PCB edges. The nominal connector-to-cradle exit distance is about 19 mm in the new battery layout; the actual exit, connector and relaxed bends must fit within the existing lead. Wide exploded-view spacing is illustrative, not available wire slack. Connect the main BAT header last, after verifying polarity and compatibility, before closing the case.
5. Tilt the intact display about **7° across its short dimension**, USB downward. Lower the first glass edge through the opening; keep the opposite edge raised. In the canonical rear-view USB-left frame, the initial shift is y−1 mm, pivoting about the glass edge y65. The animation shows the orientation.
6. Slide the tilted display toward the first side lip until that edge is tucked under it. The screen is now offset about **0.8 mm toward that side**; the opposite glass edge clears its lip. The first edge remains just below the lip, with the opposite edge raised.
7. Lower the opposite edge gently until the intact display is flat. Slide it back to center, aiming for **±0.2 mm centering** and even 0.6 mm visible overlap along both left/right edges. Check all four factory posts rest on their seats. Do not flex the glass or force the assembly.
8. Fit the four M2.5 screws and metal washers from the rear. Tighten gently in a diagonal sequence. The screws support the display; the integral lips form its inset surround.

## Integral lip and USB trial pieces

The lip is part of the **same continuous case solid**. It extends **0.6 mm over each left/right glass border**, is **0.8 mm thick**, and leaves **0.4 mm above the glass face**. The screen face therefore sits **1.2 mm behind the outer front edge**. The front aperture is **114.7 × 63.8 mm**: top/bottom lengthwise clearance remains unchanged. There are no detachable bezel parts, spring tongues, attachment grooves or bezel-removal seams.

The glass recess remains **114.7 × 67 mm**. Its side allowance makes the tilt/slide insertion possible; center the screen before tightening the rear screws. The nominal 0.6 mm lip overlap is not maintained if the glass is left at the full 1 mm sideways offset. The usable touch area stays clear when centered.

Print **p4-43-lip-usb-coupons.3mf** first. It contains the actual integral front ring and battery-case USB throat region. Trial the real intact display through the ring in both directions. Check its corners, USB sockets and post alignment in the linked depth jig before printing a full case. No extra bezel is included in either main print package.

Both USB throats remain **14 × 10 mm**, cut through the inner receiver ledges after those features are added. The retaining roof begins at z14.2 mm, beyond the cut ending at z13.6695 mm. A **12 × 9 mm short-shoulder gauge** clears the battery bottom route; the switch version uses its separate rear side-exit elbow route. Test actual plug bodies and full seating with the coupon.

## Mount, remove and service

The three rigid hooks carry the device; a separate long leaf provides retention. Hold the case parallel to the holder, **4 mm above** its installed position, engage all three heads, then lower it 4 mm until the catch returns. Support the device until all three hooks and the catch are engaged.

For removal, reach the specified recessed side paddle with a narrow tool. Press it about **2 mm toward the wall**, hold it released, lift the case **4 mm**, then withdraw forward. The stop limits overtravel to about **2.3 mm**. Do not pry the screen or force a latched hook. Leave enough USB service slack for the slide and forward withdrawal.

To open the device, disconnect USB and remove all four rear screws while supporting the intact display. Shift it about 0.8 mm toward one integral lip, lift the opposite edge to about 7°, slide back to untuck the first edge, then withdraw. Use a temporary removable pull tab on the black border if needed; never lever against the glass. Disconnect BAT as soon as accessible on the battery version. Keep the speaker lead slack and stop if anything catches. The lip stays attached to the case throughout service.

The holder retains the modeled **83.34 / 96.83 mm** cover/box screw positions as elongated slots. Check the actual hardware. Use low-profile heads that clear the case and moving parts. The 3 mm holder plate has a central cable opening and internal cable-management space. It is a low-voltage mechanical adapter, not a rated electrical enclosure or mains cover; keep the existing electrical installation properly enclosed.

## Evidence and first physical test

The export checks, exact CAD intersections, board-position samples and release sweep are recorded beside the manufacturing files. Preview and 3MF geometry share the same source. Slicer results use the exact 3MF, not a rendered approximation. None establishes printed strength, clip force, thermal performance or fit of unmeasured USB cable boots.

Dry-fit the measured board and real cables before powering it. Check full USB insertion, access with the wall holder attached, wire slack and absence of point loading on the screen. Use a dummy assembly of the actual device mass to check holding, touch and removal loads. Cycle the mount and speaker clips, inspecting for cracks, permanent set and incomplete return; repeat at operating temperature. Do not use the assembly if clips or support roots are damaged.

Sources: [Waveshare 4.3-inch documentation](https://docs.waveshare.com/ESP32-P4-WIFI6-Touch-LCD-4.3), [official mechanical ZIP](https://files.waveshare.com/wiki/ESP32-P4-WIFI6-Touch-LCD-4.3/ESP32-P4-WIFI6-Touch-LCD-4.3.zip), and the owner's measurements recorded in mechanical-profile.json. The 5-inch A–J files remain in p4-5c-case as historical designs and do not fit this unit.
