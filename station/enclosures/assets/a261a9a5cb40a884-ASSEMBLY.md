# Wall installation G / S1 / W4

Two wall configurations share one identical printed display case G. Both omit
battery and camera, including their cradles and the camera aperture. The earlier
portable F design remains in the parent folder. G uses different docking
geometry: do not mix G with the earlier W3 holder.

These are fit prototypes. The supplied board STEP passes rigid interference
checks, but the actual wall insert, right-angle cord and speaker footprint have
not been measured. All dimensions below are millimeters.

## Choose the two-part print

| Configuration | Combined 3MF | Case + holder, mounted W x H x D |
|---|---|---|
| Switch plate S1 | `exports/p4-switch-wall-g-s1.3mf` | 75 x 145.2 x 43.7 |
| Surface holder W4 | `exports/p4-surface-wall-g-w4.3mf` | 75 x 145.2 x 33.7 |

Each configuration-specific 3MF contains two separate printable objects: the same G case and its
selected holder. Print only one copy of the case for each display. The case
alone is 75 x 145.2 x 18.7. S1 has a 22 mm rear cable cavity; W4 has 12 mm.
Depths run from the adapter's rear mounting face to the front rim. An existing
cover's projection adds to the distance from the actual wall. The holder stays
within the case silhouette; its T-heads and release mechanism are concealed.
The front and rear case perimeter retain a 0.6 mm chamfer with 0.15 mm blends.

The single `exports/p4-wall-installations-g-all-parts.3mf` includes one G case
and both holder options as three separate objects. Print the case and only
your selected holder. Its full layout occupies about 145.2 x 241 mm before
margins or brim; rearrange or split plates to suit your printer.

## Wall compatibility and cable assumptions

S1 provisionally targets a North American single-gang installation. Its two
4.2 mm wide slots accept screw centers from 83.34 to 96.83 mm apart, using
matching upper/lower positions. These cover box/device mounting and Decora
cover mounting respectively. The 34.4 x 68 mm central window clears the
nominal 33.4 x 66.93 mm Decora opening. Recesses are 8.4 mm wide, with a
1.9 mm minimum plastic web below the screw head.

This is not a universal wall plate. Toggle-cover spacing (60.33 mm), a duplex
outlet's single central cover screw, multi-gang plates, and other countries'
standards are not included. Confirm the real insert and screw centers first.
Use only the matching two holes, with suitable screws; do not force an unmatched
pattern. An oversized existing cover may remain visible around the device.

The printed adapter mounts outside an appropriately enclosed and covered
electrical installation. It is not a rated mains cover, enclosure, barrier or
switch replacement. If replacing a mains switch, have a qualified electrician
provide a suitable enclosed USB power insert and retain the required cover.
The CAD only routes the low-voltage USB lead on the room side of that cover.

W4 retains 100 mm vertical wall screw spacing, with 4.5 mm clearance holes.
It adds two 8 mm bottom cable exits aligned with the USB ports, a large rear
opening and narrow tie slots in the side rail. Choose anchors and screws for
the real wall and display load. Wall fasteners and source hardware are not
included in either 3MF.

The lower pocket extends the previous case by 14 mm. Both USB boot corridors
open into the rear. The illustrative rigid elbow envelope is 11.7 mm along the
insertion direction, 13 mm wide and 15 mm rearward, excluding the metal tongue.
Its rear extreme is 21 mm behind the glass. The illustrative flexible lead is
3.5 mm diameter with 6 mm centerline bend radius. These are assumptions, not
limits certified by a cable manufacturer. A different strain relief or exit
direction may require a deeper holder or a different pocket. The orange cable
in previews is a clearance reference and is not a printed object.

Record before final fit approval:

- Country, wall insert model, cover type, screw spacing and screw thread.
- USB source socket position and plug projection from the cover's front face.
- Right-angle USB cable body W/H/reach, strain relief, cable diameter and bend limit.
- Speaker length/width and lead exit position. Thickness 4 mm and lead 50 mm are confirmed.
- Usable M2.5 thread depth in all four display posts.

## 1. Print and prepare

Print at 100% in millimeters. Both files arrange the parts with a 10 mm gap,
occupying about 145.2 x 158 mm before margins and brim. Check your actual bed
and slicer. No printer profile or support settings are embedded.

Suggested starting point: PETG, 0.4 mm nozzle, 0.2 mm layers, four perimeters
and five bottom layers. The case is rear face down with its open front up.
The holder is mounting face down, with its hooks toward the top of the print.
Use local supports under elevated T-heads, the long latch and USB overhangs
where the slicer requires them. Keep supports out of receiver tracks and
speaker flexure gaps. Remove them fully without thinning the flexures.

First check `common/glass-fit-ring.stl`, `mount-pattern-template.stl` and
`speaker-clip-coupon.stl` with the real parts. The generic USB coupon only tests
the port opening; it does not prove the new elbow, strain relief or cable route.
Dry-fit the complete G pocket with your cable. The speaker coupon includes the
4 mm housing depth and must flex and recover without cracking or whitening.

Deburr the cable edges, clear the grille and remove print debris from the
four screw wells. Check that all three receiver tracks and the side latch move
freely before installing electronics. Do not scale the whole print to fix one fit.

## 2. Attach the speaker and screen to the case

1. Keep power disconnected. Place the intact display/glass/PCB assembly on a
   padded support. Keep the PCB fastened to the display.
2. Fit a thin 0.25 mm perimeter gasket to the speaker's rigid rim if needed;
   keep its acoustic face clear. Slide its left housing edge under the fixed
   lips, then ease the right edge past both long catches. Push on the housing,
   never the diaphragm. The 4 mm body sits against the rear grille. Adhesive
   is optional; the clips provide the retention.
3. Connect the 50 mm speaker lead to the board's SPK connector while the display
   is supported close to the case. Rehearse lowering and lifting it before
   fastening. The lead must remain slack and avoid the screw posts and clip
   fingers. Its actual exit and route still need physical verification.
4. Lower the complete screen assembly through the open front. Point both USB
   sockets toward the lower pocket. Seat all four factory threaded posts on
   their supports together. The glass perimeter has 0.35 mm nominal clearance;
   it must not be forced into the rim.
5. Fit four M2.5 screws from the rear wells into the factory posts. The pattern
   is 112 x 57 mm in the board's landscape frame (57 x 112 in portrait).
   Provisional screws are M2.5 x 5 mm pan/button head, head diameter below
   5.6 mm. A 2 mm printed seat leaves about 3 mm thread engagement. Verify usable
   depth before choosing length. Tighten by hand just until seated; never use
   the screws to pull an unseated screen into the case.

The case is now attached to the screen independently of the wall holder.
Board control buttons and the small internal-connector side slots remain
closed. There is no battery or camera to install in either wall version.

## 3. Connect USB before fastening the wall adapter

1. With the display supported and the holder still loose, plug the right-angle
   USB-C lead into the intended board port through the open rear corridor.
   The elbow must turn toward the rear cavity. Check full insertion and a
   free strain relief. Use one power source and identify the intended power
   port on the actual board; the two modeled envelopes show mechanical access.
2. For S1, thread the source end through the central window and plug it into
   the already installed USB source. The cable remains outside the electrical
   cover. For W4, feed it through the matching bottom exit or rear opening.
3. Support the connected display beside the plate on a padded stand or have
   a second person hold it. Keep enough service slack for both mounting screws,
   the 4 mm docking slide and later release. Never hang the display from USB.
4. Fasten the holder through its two exposed screw holes while the display is
   still off the holder. S1 uses the actual matching 83.34 or 96.83 mm pattern;
   W4 uses 100 mm wall spacing. Verify the screw length, head and engagement
   with the real cover/insert or wall anchors. Keep the lower USB pocket down.
5. Lay the low-voltage slack in the cavity. The 31 x 34 mm case rear opening
   allows visual inspection, but keep wire behind the case's rear plane and
   away from the exposed PCB. Optional narrow ties can pass through the paired
   slots in the holder's side rail; choose ties that fit their 1.4 mm width.
   Do not cinch the service loop so tightly that it prevents undocking.

The installed reference routes have no CAD collision, but they do not include
extra service slack, a measured source plug, or a simulated flexible-cable
installation. Check those directly before closing the mount.

## 4. Dock the already connected display

1. Keep the cable and any slack inside the rear cavity, clear of all three
   T-heads, screw heads, support pads, speaker vents and the side latch.
2. Hold the case 4 mm above its final position. Align its three enlarged
   keyhole entries with the holder heads and bring it toward the holder.
3. Lower the case 4 mm. The heads slide into the narrow tracks and the ramped
   side catch clicks into its pocket. The mounting components stay within
   the case outline, with no external mounting ears.
4. Support the display and gently check that it cannot pull forward or lift
   without releasing the catch. Confirm the cable is not pinched, the plug
   remains seated, and both speaker paths are open. Check touch, audio and
   sustained operation with the final USB supply.

To remove: support the display. Through the small holder opening on the right
side when viewed from the screen, use a blunt 2 mm wide, 0.6 mm thick blade to
press the recessed paddle 2 mm toward the wall. Lift the case 4 mm, then bring
it forward while preserving cable slack. This opening is in the holder and
does not expose a board-control button. Do not pry on the glass or case rim.

## Verification and limits

The final STEP is one valid solid. The common G case has zero modeled
interference against all 1,201 solids in the aligned official Waveshare board
reference. The 4 mm speaker's nearest modeled board clearance is 2.73 mm.
Both holders and both provisional USB elbows clear the fixed docking motion.
The latch tip and tool path clear the release motion; its beam estimate is
analytical, not a fatigue or load rating. All manufacturing meshes are closed,
consistently wound single components. The configuration-specific 3MF files
preserve two objects each; the combined file has three. Millimeter scale and
geometry are checked through round-trip import and Bambu Studio.

Physical screw fit, snap strength, repeated removal, speaker acoustics, cable
bends, source fit and operating temperature remain to be checked. Test on the
bench and a temporary fixture before permanent installation.

## Sources and editable files

- [Waveshare board documentation](https://docs.waveshare.com/ESP32-P4-WIFI6-Touch-LCD-5)
  and locally retained `../reference/board.stp`, `../reference/mechanical-extraction.md`.
- [Leviton Decora drawing](https://leviton.com/content/dam/leviton/commercial-industrial/product_documents/none/ORB6321-D01_1G_Decora_Catalog_Views.PDF):
  96.83 mm mounting centers; 33.4 x 66.93 mm opening. The drawing's outer plate
  size is not the outside dimension of this adapter.
- [Hubbell device drawing](https://hciapps.hubbell.com/ProductInformation/SpecSheets/3A/Live/PDF/HBL2620M6_cart.pdf):
  83.34 mm box/device centers and #6-32 mounting thread.

`build.py` generates the G case and both holders; `export_3mf.py` packs the
paired print files. Editable STEP files are in `exports/switch/` and
`exports/surface/`. `exports/assembly-checks.json` records cable and docking
checks; `exports/common/independent-clearance-checks.json` records the board checks.
