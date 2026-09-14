# Reinforced slim switch case I / holder S3

The H/S2 mount had small T-head necks and a sharp, stepped spring root.
This revision enlarges the matching rigid hooks and case receivers, spreads
their supports into the wall plate and skirt, and replaces the latch root
with a broad rounded attachment. **Print I and S3 together; do not mix them
with H/S2 or earlier versions.** There are still two installed printed parts.

The overall case remains **75 x 145.2 x 16.7 mm**, and the mounted assembly
remains **27.2 mm** from the rear mounting face. The inset holder is
73 x 143.2 mm. The 10 mm shared clearance, USB-down orientation, rear USB
access, 4 mm speaker capture, switch screw patterns and smooth outer case
chamfers are retained. There is no battery or camera.

## Mechanical changes

| Feature | H / S2 | I / S3 |
|---|---:|---:|
| Rigid hook neck section | 2.8 x 2.6 mm | 4.4 x 3.2 mm |
| Hook head | 6 x 2.6 x 1.6 mm | 8.4 x 3.2 x 2.0 mm |
| Case retaining ledge thickness | 1.3 mm | 1.8 mm |
| Neck-to-support root radius | sharp | 0.75 mm |
| Spring root radius | sharp | 1.2 mm |
| Spring width | 4 mm | approximately 8 to 6 mm taper |
| Spring thickness | 1.4 mm | 1.6 mm |
| Spring geometric span | 25.85 mm | 29.85 mm |
| Local stop clearance behind paddle | no dedicated stop | 2.3 mm |

The neck cross-sectional area increases by **93.4%**. This is a geometry
comparison, **not a measured strength increase**. Hook supports flare from
10.4 x 9.2 mm near the neck to 14 x 12.8 mm at the plate; the upper support
is trimmed into the existing perimeter. Sloped side ribs join the lower
supports to the skirt. The first support and the wider latch anchor form a
continuous attachment rather than two isolated little towers.

The spring stays long enough to flex; its width tapers toward the free end.
The tooth doubles in width to 4 mm, with a matching wider case recess.
The release access moves 6 mm up the same side. A plate-supported stop
behind the paddle limits overtravel. Normal release remains approximately
2 mm wallward, followed by a 4 mm upward slide. The 2.3 mm dimension is the
local undeformed gap at the stop, not an exact user stroke: beam rotation
means first contact occurs between 2.1 and 2.3 mm at the modeled press point.

The hooks and receiving ledges carry weight and resist pull-off. The relaxed
spring prevents upward disengagement. Touch loads return through the case
and perimeter supports into the holder. It is not intended to keep the
spring continuously bent after installation.

Root radii, taper and a relaxed installed spring follow the principles in
[Covestro's snap-fit design guide](https://solutions.covestro.com/-/media/covestro/solution-center/brands/downloads/imported/1557218421.pdf?hash=22F446F128CE207636C795C45D855208&rev=9d9865c6a3f548359154e63ab8494a57).
Those molded-plastic guidelines do not provide FDM PETG material allowables.
[OpenAT's snap-fit guide](https://makersmakingchange.github.io/OpenAT_Design_Guide/Design_Elements_For_3D_Printed_Parts/Snap_Fits.html)
also calls out print direction and the need to test snap behavior.

## Print files and orientation

- [Single 3MF: case I and holder S3](exports/p4-robust-switch-i-s3.3mf).
  Two independent objects, millimeters, 10 mm apart, no printer settings.
- [Case STL](exports/case-measurement-prototype.stl) and
  [holder STL](exports/holder.stl); editable STEP files are beside them.
- First-print mechanism coupons: [case side](exports/mount-case-coupon.stl)
  and [holder side](exports/mount-holder-coupon.stl). They reproduce the
  actual lower hook, receiver, root, spring, tooth, release opening and stop.
  The pair uses about 6.6 cm3 of model plastic before infill/supports.
- [Speaker clip coupon](exports/speaker-clip-coupon.stl) for the real speaker.

Use the exported orientations: case rear face on the bed; holder wall face
on the bed. Print at 100% in PETG, beginning with a 0.4 mm nozzle, 0.2 mm
layers, five perimeters and 25% gyroid infill. The 1.6 mm leaf is eight
nominal layers thick; the 1.8 mm ledge is nine. These are starting settings,
not confirmation that an arbitrary printer/material combination will work.

The spring lies along the layer planes in this pose, so its long bending
fibers can be continuous extrusion paths. The upright hook necks still
depend on layer adhesion, despite their larger sections and root radii.
Use dry material and a tested PETG profile. Keep seams away from the spring
root where the slicer permits. Do not rotate the holder without reviewing
both spring and hook layer directions.

**Supports are required under the raised spring/paddle and T-head ledges.**
Allow supports on the model, not only from the build plate. The stop creates
a 2.3 mm local cleanup gap: remove support from the open side with a thin
tool, supporting the leaf rather than pulling it. Clear both hook undercuts,
the case receiver chambers and the speaker relief slots. Print the coupons
with the same orientation and support settings before committing to the
full holder. If support cannot be removed without damage, revise the
support strategy or geometry before using the part.

## Assembly and service

1. Clean the print and verify the coupon hook enters, slides 4 mm, latches,
   releases and returns fully. Check the stop is clear at rest.
2. Clip the 4 mm speaker into the case. Route its confirmed 50 mm lead to
   SPK, and lower the intact screen/PCB through the open front, USB downward.
   The nominal 40 x 30 mm speaker footprint still needs measurement.
3. Fasten the case to the four factory M2.5 posts through the rear wells.
   Use the actual available thread depth to select screws; do not bottom out.
4. Plug in the **side-exit right-angle USB-C cable** with the rear accessible.
   The 10 mm bay includes 7.5 mm inside the holder and 2.5 mm through the
   case opening. The cable envelope is provisional; verify its body,
   strain relief and bends with the actual cable.
5. Connect the supply and screw the holder over the appropriate enclosed
   wall USB installation while the device is supported beside it. This
   printed adapter remains outside the proper electrical enclosure/cover.
   Keep slack and the thin lead clear of the hook tracks and spring.
6. Hold the device 4 mm above its final position, place its receiver entries
   over the three hooks, and lower it until the catch engages. Do not force
   a tight printed fit. The spring should return to its relaxed position.
7. For removal, support the device and reach the recessed side paddle through
   the holder slot with a small flat tool. Press about 2 mm toward the wall,
   lift 4 mm, then pull forward. Stop when the mechanical limit is felt.
   Retain enough cable slack to complete this sequence without pulling USB.

## Checks and practical validation

The exported pair passes exact rigid fit/motion checks, including both USB
envelopes and the shared bay. All 1,201 vendor board solids are accounted for
in the independent case/board checks; the holder is also checked against
the board. `exports/mount-verification.json` checks the full flexible leaf,
paddle and tooth with 0.4 mm strips, nominal release, a 17-position lift
sweep, and overtravel contact. The strip approximation allows at most
0.0001 mm3 of numerical overlap; rigid checks retain their 0.000001 mm3 limit.

A variable-width elastic beam screen estimates **0.59% nominal peak strain**
at 2 mm release and approximately **0.46 mm** leading-tooth withdrawal
margin. It omits local stress concentration, layer anisotropy, material
variability, creep and fatigue. It is neither FEA nor a load rating.

The final two-part 3MF also passes the official 3MF Core schema and an offline
Bambu Studio 02.08.02.61 slice using a reference 0.4 mm P1S/PETG profile,
0.2 mm nominal layers, five walls and normal supports. Both meshes were
accepted without repairs. Actual extrusion paths were visually inspected at
the plate, spring, neck and head layers; see
[the toolpath review](exports/print-check/holder-toolpaths.png).
This reference profile is not an identification of the owner's printer.
The delivered 3MF contains geometry only, and no print was sent to a machine.

Before installing a screen, use the printed coupons to check support cleanup,
fit, stop engagement and at least 50 latch/release cycles. Record any cracking,
whitening, permanent set, looseness or incomplete spring return. Next use a
dummy matching the assembled device's measured mass in the full enclosure.
Check sustained vertical holding, pull-off resistance, touch pressure and
repeated removal over a padded surface. Record forces with a spring scale
and compare against the intended use. Establish an acceptable load margin
and operating-temperature behavior from those measurements; CAD alone has
not established them. Re-check the cable stays clear after every operation.

## Reproduce

From this directory, using the existing CadQuery environment:

```sh
/private/tmp/p4case-cad-venv/bin/python build.py
/private/tmp/p4case-cad-venv/bin/python ../validate_clearances.py "$PWD/exports"
/private/tmp/p4case-cad-venv/bin/python verify_mount.py
python3 export_3mf.py
python3 preview-support/build_preview.py
```

`mount.py` owns the changed mating features. H/S2 and earlier exports remain
as historical prototypes. The standing physical-design requirements are in
[`3dprint/AGENTS.md`](../../AGENTS.md).
