# Baguette holder V3.8 — engineering review

V3.8 reinforces the thin shell and internal hinge, enlarges the two latch finger grips, blends the center attachment into the inner shell and removes the recessed channels around Half A’s snap roots. All six interior ribs remain removed. Physical print fit, retention force, carrying loads and durability remain untested.

## Reinforced shell and hinge

The nominal cavity-wall parameter increases from 3.0 to 3.6 mm. A 2.45 mm geometric wall guard replaces the earlier approximate directional offset, including at the flat bottom. A local outer reinforcement preserves the 62 mm bread bore where the original crust was too thin. Regional normal-ray samples of the final shells measure 2.42–2.45 mm at their thinnest sampled crust locations, up from approximately 1.53–1.58 mm. These samples exclude joints, tips and working seams; they are not a global minimum-wall proof.

The captured hinge pin increases from 2 to 3 mm diameter. Its internal bearing radius increases from 3.3 to 4.3 mm, with a thicker rear wall. The new bearing is clipped to the previous exterior rim profile, so the extra material grows inward and the outside remains equally flush. The hinge remains direct and print-in-place, with no support arms. Radial clearance is 0.4 mm and axial gaps are 0.45 mm. The reviewed opening range is 0–100°, without a mechanical hard stop.

The two exterior latches retain their short 18 × 20 mm shell-contoured tongues, 1.8 mm nominal skin, thicker roots and 1.6 mm inward hooks. Each release grip is now 3 mm tall and projects 2 mm, replacing the smaller 1.2 mm tall / 0.8 mm projection. Measured retaining overlap remains about 1.12 mm, with about 3.67 mm behind the catch recess. Release travel is modeled at 2.1 mm.

## Flush snap roots and blended interior

Half A’s eight tongues now grow directly from the uncut shell at the joining face. The old inset flex channels behind the roots are removed entirely. The exposed tongues are longer so they can flex without a recess in the case wall. Their covered sockets in Half B are extended to match.

The internal attachment profile transitions into the organic cavity over 30 mm on each side with a smooth taper. This removes the abrupt transverse ledge shown in the previous sliced model. There is no separate collar or connector. The inner cavity remains rib-free.

| Center-joint feature | Nominal dimension |
|---|---:|
| Tongue insertion length | 16 mm |
| Tongue thickness | 1.6 mm |
| Free flexing length | 16.1 mm |
| Sliding clearance | 0.30 mm |
| Outward barb height | 1.00 mm |
| Retaining overlap past entry land | 0.70 mm |
| Axial clearance behind shoulder | 0.25 mm |
| Interior socket cover | 1.20 mm nominal; 1.15 mm checked |
| Exterior socket cover | At least 1.20 mm checked |
| Blind end wall | 1.20 mm checked |
| Exterior butt seam | 0.20 mm |

Four tongues sit on the base and four on the lid, within the shell edge. Their sectors are 14° wide and receiving slots are 19° wide. Each ramped barb enters a joining-face slot and springs behind a square retaining shoulder. Inner faces, outer faces and ends of the receivers remain covered.

Insertion is modeled with 1.2 mm of inward tip deflection. A straight-beam screening estimate for the 16.1 × 1.6 mm free tongue is approximately 1.11% strain. The actual curved profile, layer orientation and contact forces differ; this estimate does not establish assembly force or durability. All eight shoulders obstruct a modeled 0.5 mm withdrawal. The joint is intended for permanent assembly, has no release feature, and may be damaged by separation. Test the revised joint coupons first.

## Geometry and sliced-path review

All **98 geometry checks pass**, covering four watertight shells, two print objects with two captured moving solids each, the retained 62 mm × 600 mm capsule clearance, zero interior ribs, covered sockets, solid male roots, removal of the old transverse ledges, snap insertion and return, retaining engagement, and released hinge/latch movement.

The continuous rotation certificate uses 501 poses at 0.2° spacing. It subtracts a bound on movement between poses and a 0.002 mm numerical allowance from the measured gaps, certifying at least **0.1408 mm** clearance over 0–100°. The center-joint insertion and spring-return certificates each retain at least **0.1480 mm** clearance. These are CAD motion bounds, not printer-tolerance guarantees.

A separate enclosure diagnostic temporarily caps designed vents and bridges working seams to check one enclosed bread cavity without changing the printed vents or seams. The extrusion helper preserves polygon holes, preventing hidden pocket cuts from removing their inner covers.

The review includes closed, rear, open and intermediate hinge renders, capped hinge and catch sections, a separated center joint, and a capped covered-socket section. Four actual sliced cross-sections at former thin-wall stations were also inspected: A at print Z 55.6 and 180.0 mm; B at 47.6 and 172.0 mm. Their shell extrusion paths are continuous, with the expected two separate base/lid material regions. `slice-walls.jpg` shows the planned paths with supports hidden. This is a regional review, not an all-layer or physical defect proof.

## Print files and assembly

| Main object | Supplied X × Y × Z envelope (mm) |
|---|---:|
| Section A, integral tongues | 154.38 × 131.29 × 322.88 |
| Section B, covered sockets | 154.24 × 131.29 × 314.78 |

Both fit the checked 300 × 320 × 325 mm envelope, including an 8 mm brim. Keep the supplied upright, 100° open orientation. The offline setup is Bambu Studio 02.08.02.61, Bambu H2C, Generic PLA, 0.4 mm nozzle, 0.20 mm layers, four walls, 15% infill and automatic supports. STL units are millimetres. The 3MF files contain oriented geometry, not prepared printer jobs. Nothing is sent to a printer.

Final offline estimates are **A: 14h 56m 55s / 490.59 g**, **B: 14h 58m 56s / 491.66 g**, about **29.9 hours and 982 g** total before coupons. Exact STL, settings and G-code hashes are recorded in `review.json` and `slice-wall-review.json`.

1. Print `joint_A` and `joint_B` first. Clear support from the covered slots through their joining-face openings, then verify full seating and retention.
2. Print hinge and exterior latch coupons. The 0.4 mm hinge coupon reproduces the default bearing; 0.3 and 0.5 mm alternatives bracket fit. Check release force and repeated flexing with the taller grips.
3. Inspect supports around blind socket roofs, retaining shoulders and latch undercuts. Keep support out of working hinge bearings.
4. Print the full objects only after the coupons pass. Align both base and lid joints at the same hinge angle, support the parts evenly and press straight along their length until seated. Check lid movement afterward.

## Preview and reproducibility

The preview derives from the manufacturing CAD with 0.02 mm display simplification and 0.001 mm coordinate rounding. Capped sections are actual cuts from those solids and are excluded from print objects. The source pack includes the fixed joint profile and cavity-blend source, generator, validators, coupons, preview, rendering and offline slicing scripts. `AGENTS.md` and `source/prepublish-review.py` require exact review hashes before publishing.

Legacy references identify the crust as “Baguette” by Isa Lousberg, CC0/Public Domain. Display color does not select printing filament.
