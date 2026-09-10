# Baguette holder V3.2 — engineering review

V3.2 replaces the large interleaved shell hinge with two compact internal print-in-place hinges. It is a printable prototype for fit testing; it has not been physically printed or fatigue-tested.

## Hinge design

Each printed half contains one 28.9 mm long hinge: two fixed 6 mm ears, one 16 mm moving barrel, and a captive 2 mm pin. The barrel outside diameter is 5.6 mm, down from 9.2 mm in V3.1. The nominal radial gap is 0.4 mm, the axial gaps are 0.45 mm, and local inside relief clears the mounting ears. The minimum nominal barrel wall is approximately 1.3 mm after that relief.

The pin axis is at X = −36 mm and Z = 7 mm in source coordinates. Both hinges sit entirely within the original case envelope. The external interlocking shell panels, 26 mm motion-clearance housing, and legacy long solid reinforcement tube are removed. Small internal mounting leaves attach each hinge to the shells. A 3 mm inward taper over the lower 8 mm of the hinge-side lid rim, together with internal corner relief, provides opening clearance while retaining an exterior wall.

The reviewed opening range is **0–100°**. This compact arrangement is not designed to lie flat. The range is a validated operating limit, not a mechanical hard stop; do not force the lid farther. The supplied print pose is 100° open with the pin axes vertical.

## Geometry review

All **27 checks pass**:

- Each of the four shells and three internal joiners is one watertight, consistently wound solid.
- Each main print segment contains exactly two separate solids: the base and captured moving lid.
- The closed assembly has zero detected overlap.
- Released motion has zero detected overlap at every 1° increment from 0° to 100°, including the installed joiners.
- Each open print segment retains approximately 0.400 mm minimum base-to-lid clearance.
- The original 62 mm diameter × 600 mm capsule clearance is retained within the Boolean tolerance.
- Both compact barrels lie inside the original exterior. The full hinge-side exterior test leaves only 0.00025 mm³ of numerical boundary residue, below its 0.05 mm³ tolerance.
- The joiners have approximately 0.250 mm socket clearance.
- All parts fit the checked 300 × 320 × 325 mm envelope, allowing an 8 mm brim around the main footprints.

These are sampled CAD and mesh checks, not a continuous-motion proof, structural simulation, or physical print test. Full measurements and test names are in `review.json`.

## Other retained improvements

Four tapered 26 mm latch tongues use a nominal 1.6 mm thickness, 0.65 mm retaining hook, lead-in ramp, defined retaining shoulder, reinforced root and finger lip. They are unloaded in the closed CAD state. Motion checks model 1.05 mm outward tip release; actual force and fatigue life remain untested. A simple straight-beam screening estimate is about 0.37% nominal strain, not a prediction for the actual tapered printed arm.

The two main segments meet across flat center faces with a 0.20 mm working seam. One base sleeve and two distinct lid keys align the halves internally. The hinge-side joiners are trimmed to clear the revised rim and motion. **Use the V3.2 joiners with this model.** They require a filament-compatible adhesive after dry fitting, and replace the old snap-together center coupling. Keep adhesive away from the base/lid seam and bearings.

The cleaned rib-to-shell unions remain. The sculpted outer crust is preserved apart from the hinge-side rim taper; no display-only center repair is used.

## Print objects and offline slicing

| Object | Supplied X × Y × Z envelope (mm) |
|---|---:|
| Segment A | 142.32 × 137.57 × 306.78 |
| Segment B | 142.18 × 137.51 × 314.78 |
| Base sleeve | 73.51 × 35.99 × 32.00 |
| Lid key 1 | 25.11 × 24.23 × 32.00 |
| Lid key 2 | 25.05 × 30.42 × 32.00 |

Both main segments slice successfully offline in Bambu Studio 02.08.02.61, using the installed Bambu H2C / Generic PLA presets, 0.4 mm nozzle, 0.20 mm layers, four walls, 15% infill, an 8 mm brim and automatic supports. Segment A estimates **15 h 21 m / 468 g**; B estimates **15 h 32 m / 480 g**. These estimates include supports and brim, and exclude joiners and coupons. No job was sent to a printer. Input STL hashes in `review.json` tie the results to these exports.

Keep the supplied upright, open orientation. Inspect supports under the latch undercuts and internal mounts, and keep them out of working bearings. This complete object is not claimed to print without supports. The STL units are millimetres. The 3MF files contain oriented geometry, not prepared printer jobs or G-code.

## Fit-test sequence

1. Print `hinge_gap_0p4`, cropped from the actual final hinge and adjoining shells. Check freedom through the reviewed travel and captive retention. `hinge_gap_0p3` and `hinge_gap_0p5` are circular-bore variants to compare tighter and looser fits; they change only the moving center bearing. Parameter changes require regenerating the full model.
2. Print `latch_base` and `latch_lid`. Check seating, retention and release at the finger lip. Do not scale coupons independently.
3. Print `joint_A`, `joint_B` and all three full-size joiners. Dry-fit alignment and check opening before bonding.
4. Print the main segments only after those checks. Remove supports, free the hinges gently, dry-fit the assembly, then bond the matching base and lid joiners separately.

## Physical checks still needed

Test hinge freedom, the small pin and mount strength, latch cycling, carrying loads, adhesive compatibility and joint strength. The smaller internal hinge trades the previous bulky reinforcement for compactness; coupon handling and load tests are required before carrying use.

Across 3,375 normal-ray wall samples, the retained crust measures at least 1.53 mm on the base and 1.58 mm on the lid; tapered latch-tip samples reach 1.30 mm. The sample set omits end tips, the center joint, central parting seam, small faces and much of the left rim. It does not establish the global minimum wall or strength of the small hinge mounts. Region minima and sample locations are recorded in `wall-samples.json`.

## Preview and reproducibility

The interactive review and renders derive from the manufacturing CAD. The display mesh uses 0.02 mm simplification and 0.001 mm coordinate rounding for remote viewing; the STL/3MF manufacturing exports retain the detailed geometry. The opening control applies the real hinge pivot and a latch-release display deformation.

The source pack includes the generator, unchanged V2 reference, fit coupons, geometry checks, preview export, renders and slicer setup scripts. Dimensions are millimetres. The source identifies the reference crust as “Baguette” by Isa Lousberg, CC0/Public Domain. Display color does not specify filament.
