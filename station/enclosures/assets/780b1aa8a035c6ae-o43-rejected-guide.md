# O43 — Batteryless switch, measured 4.3-inch board

**Measurement prototype — physical fit is not yet approved.**

Case, portrait: **71.6 × 132.3 × 18.8 mm**. Main rim including bezel: **17.6 mm**. Mount face to front rim: **28.1 mm**. Existing wall-cover projection is additional. Print the case, removable bezel and holder as a matched set; N43/O43 holders are not interchangeable.

This version has **no battery or camera**. A 14 mm lower chin shelters the side-exit USB elbows. The open rear region and holder provide a **30.4 × 31 × 10 mm** clear cable envelope: 2.5 mm extends into the device and 7.5 mm is inside the holder. Release is on the **left**.

Plug USB-to-UART into the board with the case off its holder. Route the source end through the central opening to the existing covered USB supply. Support the connected device beside the holder while installing its screws, then gather slack clear of the hooks and clip before docking. The modeled elbow body is provisional (11.7 × 15 × 13 mm after orientation); cable OD is 3.5 mm and centerline bend radius is 6 mm. Use an actual side-exit elbow; do not twist a keyed USB plug 90° in its socket. USB models show only the external plug portion, not internal mated contacts.

## Fit and hardware

This revision is for the PCB labeled **ESP32-P4-WIFI6-Touch-LCD-4.3**. The owner measured the glass at **114 × 65 mm** and front glass to screw end at **11.5 mm**, and confirmed a **92 × 50 mm** screw pattern. Speaker housing: **26 × 26 × 5 mm**, lead **50 mm**. No battery is installed in O43.

The newer manufacturer drawing has **114.4 × 66.8 mm** glass and an **11.15 mm** post face. The case uses the owner's outline and depth. The manufacturer electronics retain their physical size; they are translated, never scaled. The nominal glass-to-post offset is provisional, with screw adjustment of ±0.35 mm along the long dimension and ±1.0 mm across the short dimension. Nominal centers in the rear-view USB-left glass frame: x8.75/100.75, y7.5/57.5.

The glass cavity is **114.7 × 67 mm**, retaining 0.35 mm at each top/bottom end of the 114 mm axis and providing **1.0 mm per left/right side** of the 65 mm axis. The physical glass remains 114 × 65 mm; no component was scaled. Print the **glass-fit-ring** and **mount-pattern-template** first. The flat post template checks spacing; use calipers to compare its glass outline with the actual glass-to-post offsets. The **fit-jig** also registers the glass rim and screw seats at their actual depth. If the glass or posts need force, stop and record the mismatch; do not scale the whole print or tighten screws to pull the screen into place.

Use four M2.5 screws with **7 mm OD metal washers, up to 0.5 mm thick**. The slotted supports have a 2 mm bearing web. Choose screw length from that web, washer thickness and the actual usable post thread depth: L = 2 mm + washer thickness + safe engagement. A 4 mm screw with a 0.5 mm washer gives approximately 1.5 mm engagement. Confirm this suits the actual posts before tightening; the screw must not bottom out or reach the display stack. Head OD must fit the modeled 7.6 mm well before its adjustment allowance.

## Print and clean

- Use the supplied millimeter 3MF at 100% scale. Each contains three separate objects: the device cup, removable front bezel and matching holder. Electronics and cable envelopes are preview references only.
- PETG, 0.4 mm nozzle, 0.2 mm layers, five perimeters and 25% gyroid are the starting profile. Use supports from the bed and on the model where required under hook caps, receiver roofs and the elevated latch. Preserve the export orientation.
- Print the case rear face down, opening upward. Raised pods mean the surrounding back needs support. Print the holder wall face down, hooks upward. Print the bezel front face down, tongues upward; its plate is 1.2 mm thick, tongues are 0.8 mm thick with 0.35 mm root blends.
- Remove supports from all clip slots, hook entries, screw wells and the 2.3 mm latch stop gap. Cut supports into pieces instead of levering against a spring. Inspect roots for cracks or layer separation.
- First test the supplied speaker and mount coupons. Slip the actual speaker under the two fixed lips, then press the opposite housing edge past the two long catches. The seat provides 0.25 mm axial play; it does not compress the gasket by design. The speaker's radiating face sits 1.45 mm inside the exterior, including 0.25 mm gasket allowance and a 1.2 mm grille wall. Keep adhesive away from flexure slots and the sound outlet.

## Assemble the device

1. Keep USB and BAT disconnected. Keep the display and PCB attached as one unit.
2. Install the speaker with its sound outlet facing the grille. Capture the rigid enclosure, not a diaphragm. Rehearse insertion and removal with the coupon. The molded speaker corner radius and wire exit remain unmeasured.
3. Leave BAT and CAMERA unused. Keep the rear cable bay open; no battery is installed in O43.
4. Support the display beside the case within the **50 mm speaker lead** reach. Connect SPK (GH1.25, 2-pin). Route it to the speaker's open cradle edge, away from screw wells, spring slots and sharp PCB edges. The nominal connector-to-cradle exit distance is about 34 mm; the actual exit, connector and relaxed bends must fit within the existing lead. Wide exploded-view spacing is illustrative, not available wire slack.
5. Lower the complete display through the open front. Both USB sockets face down. Check that the glass sits freely and every factory post rests on its seat. The cup edge stands 0.4 mm beyond the glass. Keep the removable bezel off until the display is seated and fastened.
6. Fit the four screws and washers from the rear. Center the display before tightening gently in a diagonal sequence. Use the adjustment only for the measured offset difference; do not bend the PCB or use the screws to overcome interference.

7. Align the four bezel tongues with their case grooves. Press evenly until all four cam detents seat. The visible opening is **112.4 × 62.4 mm**, overlapping the black glass border by 0.8 mm at each top/bottom end and 1.3 mm at each left/right side, with **0.4 mm clearance over the front glass**. The bezel adds 1.2 mm to the assembled depth. It retains the trim; the four factory screws support the display.

## USB and front-rim trial pieces

The USB openings are **14 × 10 mm**. Their final cuts continue through the inner receiver ledges to the sockets, after all nearby mounting features are added. A **12 × 9 mm rectangular plug-body gauge**, with its shoulder reaching within 0.5 mm of the nominal socket face, clears the case along its approach. This is an assumed test envelope; the owner’s actual plug shoulders are not measured. The receiver’s retaining roof starts at z14.2 mm, beyond the cut ending at z13.6695 mm. The holder roof and hook interface remain intact.

Print **p4-43-bezel-usb-coupons.3mf** first. It contains the actual front ring, common bezel and battery-case USB obstruction region. The thin USB coupon checks both apertures and internal approach, not the wall mount’s strength. Seat each real cable completely, check the shoulder against the coupon, and confirm both neighboring plugs fit. For the switch version also rehearse the actual side-exit elbow and shared rear bay.

Fit the bezel on the ring and pull it off evenly for at least 10 initial cycles. Inspect the four tongue roots for stress whitening, cracks, permanent set or loss of retention. The ideal 0.45 mm deflection screen gives about 1.22% beam strain; it does not validate material strength or print fatigue. If the fit is tight, calibrate the local clearance or material settings before printing the full cup.

## Mount, remove and service

The three rigid hooks carry the device; a separate long leaf provides retention. Hold the case parallel to the holder, **4 mm above** its installed position, engage all three heads, then lower it 4 mm until the catch returns. Support the device until all three hooks and the catch are engaged.

For removal, reach the specified recessed side paddle with a narrow tool. Press it about **2 mm toward the wall**, hold it released, lift the case **4 mm**, then withdraw forward. The stop limits overtravel to about **2.3 mm**. Do not pry the screen or force a latched hook. Leave enough USB service slack for the slide and forward withdrawal.

To open the device, disconnect USB. Use a thin plastic pick in the blind seam relief outside the glass, then pull the bezel straight forward evenly; do not lever on the glass. After the bezel is off, remove the four rear screws and lift the intact display only as far as its leads allow. On the battery version disconnect BAT as soon as accessible. Side control-button openings and rear camera are omitted; board buttons require removal/service access.

The holder retains the modeled **83.34 / 96.83 mm** cover/box screw positions as elongated slots. Check the actual hardware. Use low-profile heads that clear the case and moving parts. The 3 mm holder plate has a central cable opening and internal cable-management space. It is a low-voltage mechanical adapter, not a rated electrical enclosure or mains cover; keep the existing electrical installation properly enclosed.

## Evidence and first physical test

The export checks, exact CAD intersections, board-position samples and release sweep are recorded beside the manufacturing files. Preview and 3MF geometry share the same source. Slicer results use the exact 3MF, not a rendered approximation. None establishes printed strength, clip force, thermal performance or fit of unmeasured USB cable boots.

Dry-fit the measured board and real cables before powering it. Check full USB insertion, access with the wall holder attached, wire slack and absence of point loading on the screen. Use a dummy assembly of the actual device mass to check holding, touch and removal loads. Cycle the mount and speaker clips, inspecting for cracks, permanent set and incomplete return; repeat at operating temperature. Do not use the assembly if clips or support roots are damaged.

Sources: [Waveshare 4.3-inch documentation](https://docs.waveshare.com/ESP32-P4-WIFI6-Touch-LCD-4.3), [official mechanical ZIP](https://files.waveshare.com/wiki/ESP32-P4-WIFI6-Touch-LCD-4.3/ESP32-P4-WIFI6-Touch-LCD-4.3.zip), and the owner's measurements recorded in mechanical-profile.json. The 5-inch A–J files remain in p4-5c-case as historical designs and do not fit this unit.
