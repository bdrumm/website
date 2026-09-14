# Battery wall device J / holder W5

This variant fits the confirmed **52 x 36 x 10 mm cased battery**, retains the
4 mm speaker, and exposes **both native USB-C ports underneath**. The closed
battery pod occupies the space behind the thin main case, inside the holder.
The mount remains concealed and uses the reinforced hook/receiver and spring
design. There is no camera and no external opening for the battery connector,
RESET, BOOT or POWER buttons.

**This is the bottom-fed charging variant.** It uses the former rear USB-plug
space for the battery and does not retain the earlier 10 mm rear cable bay.
The separate batteryless I/S3 files remain available unchanged.

## Dimensions and changes

| Dimension | Batteryless I / S3 | Battery J / W5 |
|---|---:|---:|
| Width x height | 75 x 145.2 mm | 75 x 131.2 mm |
| Main rim depth | 16.7 mm | 16.7 mm |
| Maximum case depth | 16.7 mm | 23.7 mm at battery pod |
| Local speaker area depth | 16.7 mm | 17.9 mm |
| Mounted depth from rear mounting face | 27.2 mm | **28.2 mm** |

Removing the lower elbow pocket shortens the case by 14 mm and puts the
original USB ports directly at its bottom edge. The battery adds a local
7 mm rear projection rather than increasing the whole rim depth. The holder
is 73 x 129.2 mm and stays within the case outline.

The main rear plane is z16.3, the battery pod ends at z23.3, and the inner
mounting plate is at z24.8, leaving 1.5 mm between pod and plate. The 3 mm
plate ends at z27.8; with the front rim at z-0.4, the mounted depth is 28.2 mm.
Existing electrical-cover projection adds to the actual distance from the wall.

The extra 1 mm versus I/S3 reserves room for wall fastener heads. The checked
head envelope is **at most 7 mm diameter x 2.2 mm high**, with a shank no larger
than 3.6 mm and a 1.2 mm-deep recess. It leaves at least 0.5 mm between the
head and battery pod. Select compatible screws and verify head dimensions;
the screw spacing alone does not establish fit.

The two lower hooks move down and inward, away from the battery and factory
display posts. The release moves to the right side, and its anchor extends
to the relocated lower mounting support. The 4.4 x 3.2 mm necks, thicker
receiver ledges, rounded spring root and 2.3 mm local overtravel-stop gap
are retained. Bearing pads move to clear the raised speaker area. The
factory four-hole 112 x 57 mm screen mounting pattern remains unchanged.

**Print J and W5 together.** The moved hooks and release mean this variant
does not fit the I/S3, H/S2 or earlier holders.

## Battery connection and wire routing

The enclosure accepts the stated cased pack dimensions without compressing
the pack. The nominal lateral clearance is 0.4 mm per side. The stack reserves
0.25 mm for the rear mounting pad/adhesive and 0.25 mm total for board-facing
insulating film plus any adhesive. The minimum modeled film-to-board gap is
1.067 mm. Do not add thick foam or strap layers on the board-facing surface
without increasing that space.

Use suitable removable, thin adhesive for retention against the pod roof;
the surrounding cradle locates the pack but is not a snap clamp. Leave a
pull tab for service. The roof and cradle are integral with the device case.
A closed recess on the battery's left edge gives its leads a route into the
PCB compartment without an opening through the exterior. The assumed lead
exit is near the center of that edge; its actual location and lead length
still need confirmation. Mating battery-plug geometry is not yet measured.

[Waveshare documents](https://docs.waveshare.com/ESP32-P4-WIFI6-Touch-LCD-5#hardware-description)
a **3.7 V lithium battery connection, MX1.25 two-pin**, with charge/discharge
support, and identifies USB-to-UART as the power/programming port. Use the
main **BAT** header, not the separate RTC-battery header. Confirm the pack
voltage, charging compatibility, connector fit and actual pin polarity before
connecting it. Those electrical properties were not established by the case
dimensions. Both USB openings remain exposed; identify the power/UART port
from the actual PCB label before choosing the charging connection.

The speaker moves to x70/y37 and its seat is raised locally by 1.2 mm. Its
confirmed thickness is 4 mm, its lead is 50 mm, and its assumed footprint
remains 40 x 30 mm. Point the wire exit toward SPK and route it through the
space above the battery footprint. Check the real lead reaches with slack;
do not route it around the outside of the holder or clamp it behind the pack.

## Print files and settings

- [Single two-object 3MF](exports/p4-battery-wall-j-w5.3mf): case J and holder
  W5, correctly oriented, 10 mm apart, millimeters, no printer settings.
- [Device-case STL](exports/case-measurement-prototype.stl) and
  [holder STL](exports/holder.stl). Matching STEP files are beside them.
- [Mount receiver test](exports/mount-case-coupon.stl) and
  [mount hook/latch test](exports/mount-holder-coupon.stl).
- [Speaker clip test](exports/speaker-clip-coupon.stl) and
  [USB opening test](exports/usb-clearance-coupon.stl).

Start with PETG, a 0.4 mm nozzle, 0.2 mm nominal layers, five perimeters and
25% gyroid infill. The case is exported with its battery-pod rear face on the
bed; the holder is wall-face down. The spring lies along the layer planes.
Keep these orientations for the mechanism test pieces as well.

**The local rear pods require supports underneath the recessed main back.**
Also support the raised holder spring/paddle and hook ledges. Use normal
supports with support on the model permitted; a build-plate-only restriction
can miss small ledges. As a starting point, the reference slice uses 0.2 mm
top/bottom support gaps, 0.35 mm XY separation and three interface layers.
Use settings proven for the actual printer and material.

The battery pod saves mounted depth at the cost of more support material
than a flat-backed case. The supports under the main back remain accessible
from outside after printing. Remove them without levering against the
speaker leaves, hook caps or spring. Clear the 2.3 mm stop gap, receiver
chambers, screw wells and USB openings. If the coupon cannot be cleaned
without damage or does not move freely, adjust the print before using a
full holder. Do not force a tight fit or bend past the stop.

## Assembly

1. Print and clean the small mount test pair. Confirm entry, 4 mm slide,
   latching, right-side release and stop engagement. Test the actual speaker
   and USB plug with their coupons.
2. Print the full case and holder. Remove supports, confirm all four display
   screw/driver wells are open, and dry-fit the unpowered screen/board.
3. Remove the screen. Install the insulating film and the thin rear mounting
   pad on the cased battery within the stated thickness budgets. Seat the
   battery in its pod, retaining it with the removable adhesive and leaving
   the pull tab accessible. Route its leads through the internal left recess.
   Leave BAT disconnected.
4. Clip in the speaker, aim its lead toward SPK, and connect it while lowering
   the intact display/PCB into the front. Verify the lead runs above the
   battery and the main battery lead does not cross a screen post, screw well
   or docking receiver.
5. Confirm battery polarity and connector compatibility, then connect BAT
   last. If the physical POWER key is needed, operate it while accessible;
   the button walls remain closed. Seat the screen on its four factory
   mounting posts and fasten through the rear wells with M2.5 screws selected
   from the actual available thread depth. Do not bottom the screws.
6. Secure W5 to the appropriate wall hardware using the matching 83.34 or
   96.83 mm screw spacing. Check the fastener-head envelope above. For an
   electrical-box installation, keep the printed adapter outside the proper
   electrical enclosure and cover; it is not a substitute for either.
7. Hold the case 4 mm high, engage all three hooks, and slide down until the
   right-side latch engages. Check it is seated and the spring has returned.
8. Plug the charging lead into the exposed bottom power/UART USB-C port.
   The openings are nominally 14 x 8 mm and the checked unmeasured boot
   envelope is 12 x 7 mm. A larger real boot needs a corresponding revision.
   The cable can also be connected before docking if enough slack is retained.

For removal, support the device, reach the recessed right-side paddle with
a small flat tool, press about 2 mm toward the wall, lift 4 mm and pull away.
Unplug the bottom USB cable first or provide enough slack. The local stop
limits travel; do not force it. Open the case for battery service, disconnect
BAT when accessible, and use the pull tab rather than prying against the PCB.

## Verification and remaining physical checks

`exports/independent-clearance-checks.json` accounts for all 1,201 solids in
the official board model. It checks the case, battery, insulation and speaker
with exact intersections and minimum distances. The assembly checks include
both native USB envelopes, rigid docking motion and retained screw access.
The mount checks include the complete mirrored spring deformation envelope,
17 released lift positions, the stop, holder/board clearances and both wall
fastener patterns. These checks pass for the stated reference dimensions.

The final 3MF passes the official Core schema and a completed offline Bambu
Studio slice with the reference PETG settings above. Both meshes were accepted
without repairs. The [case toolpaths](exports/print-check/case-toolpaths.png)
show support beneath the recessed back, and the
[holder toolpaths](exports/print-check/holder-toolpaths.png) show the reinforced
mount sections. Orange paths show the closest support layer, labeled separately
because support and model layer heights can differ. This is a reference slice,
not an identification of the owner's printer or a physical print test.

The spring calculation is a geometry screen, not a printed load rating.
Use the coupons for at least 50 latch/release cycles, checking for cracks,
permanent set and incomplete return. Before installing electronics, test a
full assembly with a dummy matching the actual assembled mass and record
holding, pull-off and touch loads. Check behavior at the intended operating
temperature. Physical strength, battery adhesion, cable slack and speaker
fit remain to be established on the real print.

Still confirm the battery voltage/connector/polarity, lead length and exit,
speaker footprint and wire exit, actual USB boot, wall screw head dimensions
and usable M2.5 thread depth. No battery charging or hardware operation was
performed while creating these files.

## Reproduce

Run `build.py`, `../validate_clearances.py` with this directory's absolute
`exports` path, and `verify_mount.py` using the existing CadQuery environment.
Then run `export_3mf.py` and `preview-support/build_preview.py` with the normal
Python runtime. The common generator's local-pod parameters default off, and
the mount options retain the earlier I/S3 defaults.
