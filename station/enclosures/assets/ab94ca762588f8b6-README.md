# Slim switch assembly H / S2

This version combines a thinner case with an open rear cable bay that shares
space with the switch holder. There is no battery or camera.

| Dimension | Previous G / S1 | H / S2 |
|---|---:|---:|
| Device case depth | 18.7 mm | 16.7 mm |
| Gap inside holder | 22.0 mm | 7.5 mm |
| Mounting plate thickness | 3.0 mm | 3.0 mm |
| Total from mounting face | 43.7 mm | 27.2 mm |
| Case width x height | 75 x 145.2 mm | 75 x 145.2 mm |

Overall depth drops by 16.5 mm, or 37.8%. Existing cover projection adds to
the distance from the actual wall.

## The shared 10 mm space

The device rear opening is enlarged to 35 x 43 mm. A 33 x 32.2 mm clearance
volume extends 10 mm forward from the inner face of the mounting plate:
7.5 mm inside the holder and 2.5 mm through the open device case. There is no
printed partition between these spaces. This volume clears the case, holder,
speaker and board. It is a clearance reference, not a printed part.

The coordinate planes, measured rearward from the glass, are:

- Glass front: 0 mm; front case rim: -0.4 mm.
- Start of the shared clearance volume: 13.8 mm.
- Device case rear: 16.3 mm.
- Inner mounting-plate face: 23.8 mm.
- Outer mounting face: 26.8 mm.

Thus the selected central bay also has 13 mm from its forward limit to the
outer mounting face, including the open plate aperture. The mount keeps the
83.34 / 96.83 mm switch screw patterns, rear access, concealed T-heads, 4 mm
docking slide and 2 mm side-release motion.

## What made the case thinner

The 4 mm speaker moves 4.5 mm toward the empty side of the case. One fixed
retaining lip moves 5 mm along the speaker edge. The minimum modeled gaps are
0.73 mm from speaker to board, 0.50 mm at the left retaining structure and
0.79 mm for the conservatively displaced right clip. Speaker thickness and
50 mm lead length are confirmed; its 40 x 30 mm footprint remains provisional.

Simply reducing the original case to 16.7 mm made the original clips intersect
the ESP and Wi-Fi modules. The new placement clears those parts while retaining
the 4 mm speaker capture, 1.2 mm grille and soft outside chamfers.

## USB cable requirement

Use a **side-exit (left/right) right-angle USB-C cable** in the lower pocket.
The male USB-C tongue keeps its normal socket orientation. This layout does
not mean rotating an existing plug a quarter turn in its socket.

The reference body envelope is adapted from the previous unmeasured elbow:
11.7 mm along insertion, 15 mm across the lower pocket and 13 mm in depth.
The reference flexible lead is 3.5 mm diameter with 6 mm centerline bend radii.
It bends sideways/rearward in the chin, crosses inward below the lower hooks,
then rises through the shared rear bay. Both alternative port routes are
checked, including clearance between the two cable envelopes. Male tongues,
source-plug geometry and service-loop slack are not modeled.

The lower rear USB corridor is opened to 43.7 mm wide so both elbow housings
clear. The front lip and both lower display-post seats remain. A rear-exit
cable following the older route needs a deeper holder; the old reference lead
would reach 28.75 mm behind the glass, beyond this holder's 23.8 mm inner face.
Confirm the actual cable style, full body and strain relief before printing.

## Print and assemble

`exports/p4-slim-switch-h-s2.3mf` contains only the case and switch holder as
two separate print objects. The colored cable and clearance volume in the
preview are references. Use the paired H / S2 export for this installation.

Start with PETG, 0.2 mm layers and four perimeters. The exported case sits
rear-face down, open front upward; the holder sits mounting-face down. Inspect
supports under the elevated latch and T-heads. Keep supports out of clip slots
and fully clear the lower USB corridor. Print the speaker coupon with your
actual speaker before approving fit. The previous generic USB coupon is
obsolete for this wide opening; check the real cable in the full lower pocket.

1. Clip the speaker into the case, route its 50 mm lead to SPK, and lower the
   intact display/PCB through the front with USB downward.
2. Fasten the case to the four factory M2.5 posts through the rear wells.
   The 112 x 57 mm board pattern and 2 mm screw-seat web are unchanged. Select
   screw length from the actual usable thread depth; do not bottom the screws.
3. Insert the side-exit USB cable while the rear is accessible. Connect its
   source end and support the display beside the holder.
4. Screw the holder over the appropriate enclosed USB wall installation while
   the display remains off the mount. Keep the printed adapter outside the
   proper electrical enclosure and cover.
5. Lay slack through the common rear bay, clear of the clips, screws, speaker
   vents and exposed board. Keep enough slack for removal.
6. Align the three rear entries 4 mm high, bring the case onto the holder and
   lower it 4 mm until the catch engages. To remove, support the device, press
   the side paddle 2 mm wallward, lift 4 mm and pull forward.

The initial guide's sequencing remains useful, but the dimensions and USB
orientation in this H / S2 document supersede G / S1 for this prototype.
Physical snap strength, cable and source fit, speaker lead slack, acoustics
and sustained operating temperature still need a bench test.

## Reproduce and inspect

Run `build.py` with the project's CadQuery environment, then use
`../validate_clearances.py slim-switch-h/exports` from the case project root.
The main STEP is `exports/case-measurement-prototype.step`; the holder STEP is
`exports/holder.step`. The depth experiment is retained in `../depth-study/`.
`exports/assembly-checks.json` contains the shared-bay and docking checks.
