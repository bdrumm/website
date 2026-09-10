# Baguette holder V3 — engineering review

V3 is a printable engineering prototype for review and fit testing. It has not been physically printed or fatigue-tested. The preview uses the same manufacturing meshes as the print exports; the display-only center repair from the previous website update is not used.

## Review outcome

The closed assembly, both printable segments, and all three internal joiners pass the current geometry checks. Each shell and joiner is one watertight, consistently wound solid. Each print-in-place segment contains exactly two solids: its base and captured moving lid.

The closed lid has no detected overlap. The released opening sweep is checked at 2° increments from 0° through 180°, with the internal joiners installed. These are sampled geometric checks, not a continuous-motion proof or a physical test. The original 62 mm diameter, 600 mm capsule clearance remains open.

Both main segments slice successfully offline in Bambu Studio 02.08.02.61 using the installed H2C/PLA presets, a 0.4 mm nozzle, 0.20 mm layer height, four walls, 15% infill, an 8 mm outer brim, and supports. No job was sent to a printer. The downloadable 3MF files contain geometry and orientation, not a ready-to-run printer job.

## Changes and tradeoffs

| Area | V2 finding | V3 change |
|---|---|---|
| Hinge exterior | 10.4 mm radial relief cuts made the hinge look separated from the shell. | A 9.2 mm diameter integrated spine fills the outer hinge line; opposing bearing clearance is 5.0 mm radius. The outer limit is unchanged. |
| Hinge pin | 3.2 mm captive pin, 0.4 mm radial clearance. | 4.0 mm captive pin, 0.4 mm radial clearance, 2.2 mm nominal knuckle wall and 0.45 mm axial clearance. |
| Latches | Short, relatively thick tabs; closure force depended on the uneven outer crust. | Four longer 26 mm tapered tongues, nominal 1.6 mm thickness, 0.65 mm hook, a defined recess and retaining shoulder, a broader root transition, and a finger release lip. |
| Closed latch state | Engagement geometry was difficult to assess from the display model. | No geometric preload when closed. Opening checks use 1.05 mm commanded tip release; actual release force remains untested. |
| Center join | Backward exterior chamfer created a deep visible reveal and complicated the support geometry. | Flat faces with a 0.20 mm butt seam. Internal bonding sleeves align the halves while allowing the main parts to print directly on the joint face. |
| Internal ribs | Near-coincident surfaces remained buried at rib-to-shell intersections. | Ribs now extend through the shell before union, removing those internal thin surfaces while retaining the outer crust. |
| Mesh cleanup | Boolean output included disconnected near-zero-volume fragments. | Only connected functional geometry remains in each explicitly named shell and joiner. |

**The important assembly tradeoff:** this revision replaces the integrated snap-together center connection with **three hidden bonding parts**: one U-shaped base sleeve and two lid keys. They require an adhesive compatible with the chosen filament, after dry fitting. They are not intended to be forced in as friction locks. This is the main architecture decision to review before printing the complete holder.

The small butt seam and hinge bearing seams are intentional working clearances. A physically moving, segmented print cannot have the zero-clearance fused surfaces used in a cosmetic display repair.

## Parts and orientation

Print each main segment separately in the supplied upright, open pose. The integrated hinge pins point vertically. Both parts fit within a conservative 300 × 320 × 325 mm envelope, including an 8 mm brim around the footprint. Bambu's published H2C single-nozzle volume is 305 × 320 × 325 mm; nozzle configurations can differ, so the smaller width is used for the check. [Bambu H2C specifications](https://blog.bambulab.com/bambu-lab-h2c-where-multi-material-vortek-system-meets-engineering-precision/)

| Part | Supplied print envelope, X × Y × Z (mm) | Role |
|---|---:|---|
| Segment A | 198.42 × 61.47 × 306.78 | First base/lid pair, hinge printed in place |
| Segment B | 198.31 × 61.47 × 314.78 | Second base/lid pair, hinge printed in place |
| Base sleeve | 73.43 × 35.99 × 32.00 | Internal base alignment and bonding surface |
| Lid key 1 | 25.70 × 32.03 × 32.00 | First lid alignment and bonding surface |
| Lid key 2 | 25.05 × 30.42 × 32.00 | Second lid alignment and bonding surface |

The keys are different shapes and must not be interchanged. Their measured minimum socket clearance is approximately 0.25 mm. The preview's “Separate segments” and “Cutaway” controls show their installed positions. Bond base joiners only to base parts, and lid joiners only to lid parts. Keep adhesive away from the parting seam and hinge bearings.

The latch tongues introduce undercuts. Use local supports and inspect their placement; exclude support from the narrow hinge bearings and working gaps. The supplied upright orientation is deliberate. The full model is not claimed to be support-free.

The offline slices estimate **15 h 02 m / 476 g for A** and **15 h 26 m / 487 g for B**, including supports and brim. Allow additional material for the joiners and coupons. These estimates depend on the selected slicer settings and are not measured print results.

## Fit-test sequence

1. Print `hinge_gap_0p4` first. It reproduces the proposed 0.4 mm radial hinge clearance. The 0.3 and 0.5 mm versions bracket it for your machine and filament.
2. Print `latch_base` and `latch_lid`. Check that the hook seats, retains without preload, and releases by lifting the finger lip. Do not scale these coupons independently.
3. Print `joint_A`, `joint_B`, and the three final joiners. Dry-fit the alignment and open the lid through its travel before committing to a bond.
4. Only after those checks, print the complete main segments. Inspect and remove supports, free the hinges gently, dry-fit the whole assembly, and then bond the matching internal joiners.

Longer cantilevers and tapered sections generally reduce snap-fit stress, but there is no universally correct clearance or engagement dimension. This prototype follows that design direction; the selected dimensions still need coupon testing. [Formlabs snap-fit design guidance](https://formlabs.com/uk/blog/designing-3d-printed-snap-fit-enclosures/)

A simple straight-beam estimate gives roughly 0.37% nominal strain for the proposed 26 mm length, 1.6 mm thickness, and 1.05 mm release travel, versus roughly 1.35% for the previous 16 mm / 2.0 mm / 1.15 mm reference. These are screening estimates, not FEA or predictions for the actual tapered, printed latch. Layer adhesion, root geometry, filament formulation and temperature affect the result.

## What still needs physical validation

- Hinge freedom, pin wear and captive retention after support removal.
- Closing and release force, repeated latch cycling, and accidental release during carrying.
- The adhesive choice, joint strength, alignment and curing procedure.
- Strap-lug loads and the complete assembled holder under real carrying conditions.
- Cleaning and material suitability for the intended use. No food-contact validation has been performed.

The sculpted shell retains the original wall strategy. After the rib cleanup, 4,562 normal-ray samples across the four main shell parts give sampled crust minima of 1.53 mm for the base and 1.58 mm for the lid. The tapered latch tips measure 1.30 mm in the same sampling. Median sampled distances are 2.79–3.13 mm. The sampling excludes ends, the center joint, hinge, parting seam and small faces; it is not a global minimum-wall or structural-strength proof. Full samples and their locations are supplied in `wall-samples.json`.

## Source and reproducibility

The local source pack contains the V3 parametric generator, the unchanged V2 reference source, reference geometry, coupon generation, validation, preview export and slicer setup scripts. `review.json` records the current geometry checks and offline slicing results. Dimensions in the source and STL/3MF exports are millimetres. The reference crust is derived from “Baguette” by Isa Lousberg, identified as CC0/Public Domain in the original source.

The rendered PLA color is a visualization choice. It does not select a physical filament or change the printable shape.
