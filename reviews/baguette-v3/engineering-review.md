# Baguette holder V3.6 — engineering review

V3.6 replaces the three loose bonding connectors with an **integrated, one-way snap joint** and reduces the internal ribs. There are now **two main print objects**, each containing a captured base and moving lid. The smooth direct rim hinge and two short exterior latches remain. Physical fit, retention force, carrying loads and durability have not been tested.

## Integrated center joint

Section A carries a 12 mm aligning collar that is part of its base and lid. It slides into the sockets in section B. Eight flexible fingers, four on each shell, snap behind internal retaining shoulders. The outer shells meet at the retained 0.20 mm butt seam. No separate connector or adhesive is required.

| Feature | Nominal dimension |
|---|---:|
| Collar insertion length | 12 mm |
| Collar / finger wall | 1.8 mm |
| Sliding clearance | 0.30 mm |
| Rear anchoring length | 12 mm |
| Flexible finger length | 22 mm |
| Outward barb height | 1.00 mm |
| Retaining overlap beyond the socket land | 0.70 mm |
| Clearance behind each retaining shoulder | 0.25 mm |
| Checked material behind each socket | At least 1.8 mm |

The barbs have ramped entry faces and square withdrawal shoulders. Wider slots allow the fingers to bend independently of the alignment lands. The receiver pockets include clearance beside the fingers so they can return after insertion. Both base and lid joints resist a modeled 0.5 mm withdrawal, with positive engagement at every finger.

The joint has no release feature and is **intended for permanent assembly**. Removing an engaged joint may damage the fingers or socket. This intent is not a tested strength rating. Test the joint coupons before joining the full-size case. Check alignment up to the leading lip before pushing the locking shoulders into their pockets.

The insertion review holds the fingers at a modeled 1.5 mm tip deflection. A straight-beam screening estimate for the 22 × 1.8 mm fingers is about 0.84% strain. Their actual curved sections and layer orientation differ from that idealization, so this does not predict insertion force, fatigue life or printed elasticity.

## Reduced ribs

All six rib stations remain at Y = −220, −140, −60, +60, +140 and +220 mm.

| Feature | Previous | V3.6 |
|---|---:|---:|
| Nominal inward depth | 4.0 mm | 1.8 mm |
| Rib width along the case | 3.2 mm | 2.4 mm |
| Support ramp length | 6.0 mm | 3.0 mm |

The nominal depth is reduced by 55%. The ribs retain smooth elliptical inner edges and connections into the shell. A comparison against the previous rib solids confirms material removal at every station, totaling approximately **23.2 cm³**. These are nominal dimensions around the original organic cavity, rather than a claim of uniform projection from every point on the wall.

## Retained hinge and latches

The two direct hinges remain at X = −41, Z = 0 mm, with 6.6 mm knuckles, captured 2 mm pins, 0.4 mm radial clearance and 0.45 mm axial gaps. Two-millimetre radius tangent blends join the hinge to the inside and outside of the rear wall. The fixed hinge ends continue into the same rim profile. The nominal rear wall is 3 mm thick. All hinge geometry remains inside the original exterior envelope; there are no support arms.

The reviewed opening range remains **0–100°**, without a mechanical hard stop. Do not force the lid farther. The print poses have the pin axes vertical and the lids open at 100°.

The two exterior latches retain 18 mm tongues, 20 mm width, 1.8 mm nominal skin, thicker roots, 1.6 mm inward hooks and small thumb lips. Measured retaining overlap is about 1.12 mm, with approximately 3.67 mm behind the catch recesses. The internal exit bevel clears the hooks during opening. Latch release is modeled at 2.1 mm; its nominal straight-beam strain screen remains about 1.75%. These tests establish geometric engagement, not release force or durability.

## Geometry review before committing

All **68 geometry checks pass**. The main checks cover:

- Exactly four integral shells and two print objects, with no separate sleeves. Each shell is a single watertight, consistently wound solid; each print object has the expected two captured moving solids.
- No rigid interference in the assembled center joints or closed base/lid assembly.
- All eight snap shoulders resist withdrawal. All receiver pockets retain at least 1.8 mm of outer wall under a solid-offset check.
- Continuously clear insertion paths with the fingers compressed, followed by continuously clear spring-return paths into the pockets. The review also checks finger clearance beside the alignment lands.
- Continuous released lid rotation through 0–100°, including the integrated collars and snaps.
- The retained 62 mm diameter × 600 mm capsule clearance.
- Smaller ribs at every station, with only numerical residue in the comparison of added material.
- Tangent hinge transitions, continuous fixed-ear roots, retained latch engagement and printable envelopes.

The rotation certificate uses 501 poses at 0.2° spacing. It subtracts the maximum possible movement to the nearest sampled angle and a 0.002 mm numerical allowance from the minimum measured gap. The insertion and spring-return checks use the same displacement-bound principle at 0.1 mm spacing. The complete measurements and clearance bounds are in `review.json`.

The enclosure check temporarily caps the four designed bottom vents and bridges submillimetre working seams for analysis. It finds one enclosed bread cavity. The vents and working seams remain in the manufacturing geometry.

Closed, open and intermediate hinge views, hinge and latch sections, the separated center joint and its snap cross-section are inspected before publishing. `AGENTS.md` preserves this review requirement. `source/prepublish-review.py` checks that the CAD, reviewed images, preview, offline slices and download archives match.

## Print files and assembly

| Main object | Supplied X × Y × Z envelope (mm) |
|---|---:|
| Section A, with integral collar | 155.08 × 131.14 × 318.88 |
| Section B, with integral sockets | 154.94 × 131.14 × 314.78 |

Both fit the checked 300 × 320 × 325 mm envelope, including an 8 mm brim around the footprint. Keep the supplied upright orientation. The collar makes A taller than in the previous revision.

The checked setup is Bambu Studio 02.08.02.61, Bambu H2C, Generic PLA, a 0.4 mm nozzle, 0.20 mm layers, four walls, 15% infill, an 8 mm brim and automatic supports. Fresh offline slicing results and input/output hashes are recorded in `review.json`. No job is sent to a printer. The STL units are millimetres; the 3MF files contain oriented geometry, not prepared printer jobs or G-code.

The final offline slices estimate **15 h 37 min / 479.66 g** for section A and **14 h 47 min / 467.29 g** for section B, approximately **30.4 hours and 947 g** total before fit coupons. These include the recorded support and brim settings.

1. Print the matching `joint_A` and `joint_B` coupons first. They include the actual snap fingers, roots and sockets. Confirm insertion, full seating and resistance to withdrawal. Treat them as one-way test parts.
2. Print the hinge and exterior latch coupons. The 0.4 mm hinge coupon reproduces the current bearing; the 0.3 and 0.5 mm variants bracket its fit.
3. Inspect supports at the collar, finger slots, hidden retaining pockets and latch undercuts. Remove all support and brim material from mating and moving surfaces before assembly.
4. Print the full segments after the coupons pass. Align both base and lid connections with the hinges at the same angle. Support both sections evenly and press straight along the case length until seated. Avoid twisting the fingers. Check lid movement after assembly.

Physical tests must establish printed fit, snap insertion and retention force, hinge freedom, latch cycling, carrying loads and long-term joint strength. Wall-sample coverage and regional measurements are in `wall-samples.json`; they do not establish a global minimum wall or structural load rating.

## Preview and reproducibility

The preview comes from the manufacturing CAD with 0.02 mm display simplification and 0.001 mm coordinate rounding. The print files retain the manufacturing meshes. Section views are capped cuts from those solids and are excluded from the print objects. Center joint reveals the integrated collar with the two case sections separated; Joint section shows a locking tongue seated behind its receiving shell.

The source archive contains the generator, geometry checks, coupons, render and preview scripts, slicer setup and review requirements. The unchanged reference source identifies the crust as “Baguette” by Isa Lousberg, CC0/Public Domain. Display color does not specify filament.
