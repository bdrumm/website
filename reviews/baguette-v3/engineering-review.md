# Baguette holder V3.7 — engineering review

V3.7 moves the eight center-joint tongues into the shell edge and replaces the exposed internal catches with **covered blind sockets**. **All six internal ribs are removed.** The case still has two main print objects, the smooth internal rim hinges and two short exterior latches. Physical fit, retention force, carrying loads and durability remain untested.

## Covered center joint

The tongues are shifted 4.6 mm outward from their previous profile into the thickness of the shell. Each tongue is an integral extension of section A. Its ramped barb enters a slot in section B, then springs behind a square retaining shoulder. The sockets open only at the joining face; their inward faces, outward faces and ends remain covered. There is no continuous collar projecting into the bread cavity.

| Feature | Nominal dimension |
|---|---:|
| Tongue insertion length | 12 mm |
| Tongue thickness | 1.6 mm |
| Flexible tongue length | 22 mm |
| Sliding clearance | 0.30 mm |
| Outward barb height | 1.00 mm |
| Retaining overlap past the entry land | 0.70 mm |
| Axial clearance behind the retaining shoulder | 0.25 mm |
| Interior socket cover | 1.20 mm nominal; 1.15 mm checked |
| Exterior socket cover | At least 1.20 mm checked |
| Blind end wall | 1.20 mm checked |
| Exterior butt seam | 0.20 mm |

Four tongues sit on the base and four on the lid. Their positions are selected to avoid thin areas in the organic shell. The tongue sectors are 14° wide and the receiving slots are 19° wide. The embedded roots have covered clearance channels so each tongue can bend independently.

The insertion check models 1.2 mm of inward tip deflection. A straight-beam screening estimate for a 22 × 1.6 mm tongue is approximately 0.60% strain. The actual curved cross-section, layer orientation and contact forces differ from that idealization; this is not a prediction of assembly force or durability.

The center connection has no release feature and is intended for permanent assembly. All eight shoulders obstruct a modeled 0.5 mm withdrawal. Separation after locking may damage the tabs or sockets. Test the joint coupons before committing the full-size case to assembly.

## Interior ribs removed

The inherited rib-construction loop is disabled entirely. The six rib hoops and their support ramps at Y = −220, −140, −60, +60, +140 and +220 mm are omitted from the manufacturing geometry. The underlying organic cavity and its original wall remain; these are not flattened or thinned to imitate rib removal. The separate structural rim for the hinges and exterior latches remains.

The validation compares every former rib station with V3.6 and confirms material removal without meaningful added geometry. `review.json` records a rib count of zero and the removed volume at each station, approximately 15.2 cm³ less material than the already reduced V3.6 ribs. Removing ribs changes structural stiffness; the geometry checks and slicer do not establish a carrying-load rating.

## Retained hinge and exterior latches

The direct hinges retain 6.6 mm knuckles, captured 2 mm pins, 0.4 mm radial clearance and 0.45 mm axial gaps. Two-millimetre radius blends join the round hinge to the rear wall, entirely inside the original exterior. There are no support arms. The reviewed opening range is 0–100°, without a mechanical hard stop.

The two exterior latches retain 18 mm tongues, 20 mm width, 1.8 mm nominal skin, thicker roots, 1.6 mm inward hooks and small thumb lips. Their measured retaining overlap remains approximately 1.12 mm, with about 3.67 mm behind the catch recess. The release motion is modeled at 2.1 mm. Printed release force and latch life remain untested.

## Geometry review

All **93 geometry checks pass**. The checks cover:

- Four individual watertight shells and two print objects, each with the expected two captured moving solids.
- No rigid overlap in the seated center joints or closed lid/base assembly.
- Continuous compressed insertion and spring-return clearance for both center joints, plus tongue clearance inside the embedded root channels.
- Positive withdrawal engagement at every snap, covered socket interiors and exteriors, covered roots and closed socket ends.
- Continuous released hinge rotation through 0–100°, including the assembled center joints.
- The 62 mm diameter × 600 mm capsule clearance, removed ribs, direct hinge attachment and retained exterior latch engagement.

The rotation certificate uses 501 poses at 0.2° spacing. It subtracts the maximum possible movement to the nearest sampled pose and a 0.002 mm numerical allowance from the minimum measured gap. Insertion and spring-return checks use the same displacement-bound principle at 0.1 mm spacing. Full results and conservative bounds are in `review.json`.

A separate enclosure diagnostic temporarily caps four designed bottom vents and bridges working seams. It verifies one enclosed bread cavity without changing the printed vents or seams. Interior pocket-cover checks use the real prismatic cavity and bread-bore geometry. The extrusion helper explicitly preserves polygon holes so pocket channels cannot accidentally cut through the inner skin.

Before publishing, inspect closed, open and intermediate hinge views, capped hinge and latch sections, the separated edge joint and its capped covered-socket section. `AGENTS.md` and `source/prepublish-review.py` preserve this requirement and check that reviewed CAD, images, preview, slices and download archives agree.

## Print files and assembly

| Main object | Supplied X × Y × Z envelope (mm) |
|---|---:|
| Section A, integral tongues | 155.08 × 131.14 × 318.88 |
| Section B, covered sockets | 154.94 × 131.14 × 314.78 |

Both fit the checked 300 × 320 × 325 mm envelope, including an 8 mm brim. Keep the supplied upright, 100° open orientation. The recorded offline setup is Bambu Studio 02.08.02.61, Bambu H2C, Generic PLA, a 0.4 mm nozzle, 0.20 mm layers, four walls, 15% infill and automatic supports. The STL units are millimetres. The 3MF files contain oriented geometry rather than prepared printer jobs. Nothing is sent to a printer.

The final offline estimates are **A: 14h 40m 4s / 453.36 g**, **B: 14h 3m 2s / 444.08 g**, about **28.7 hours and 897 g** total before coupons. Input STL, settings and output G-code hashes are recorded in `review.json`.

1. Print `joint_A` and `joint_B` first. Inspect the covered slot openings, remove support from the slots and verify that every tongue fully seats and remains locked.
2. Print the hinge and exterior latch coupons. The 0.4 mm hinge coupon reproduces the default bearing; the 0.3 and 0.5 mm variants bracket its fit.
3. Inspect the slicer around the covered root channels, blind socket roofs, retaining shoulders, latch undercuts and hinge bearings. Support trapped in a slot must be cleared through its joining-face opening before assembly.
4. Print the main objects after the coupons pass. Align the base and lid joints with both hinges at the same angle. Support the parts evenly and press straight along the length until fully seated. Check lid movement after assembly.

Physical testing must establish printed fit, insertion and retention forces, hinge freedom, latch cycling, case stiffness and long-term joint strength. `wall-samples.json` contains regional wall samples; it is not a global minimum-wall or load proof.

## Preview and reproducibility

The preview derives from the manufacturing CAD with 0.02 mm display simplification and 0.001 mm coordinate rounding. Capped sections are actual cuts from those solids and are excluded from the printable objects. Center joint separates the pieces to expose the tongues and socket mouths. Joint section reveals the hidden retaining lip and its surrounding covers.

The source archive includes the generator, checks, coupons, preview, rendering and slicing scripts. The unchanged reference identifies the crust as “Baguette” by Isa Lousberg, CC0/Public Domain. Display color does not select filament.
