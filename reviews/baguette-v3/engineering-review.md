# Baguette holder V3.4 — engineering review

V3.4 removes the raised hinge pivot and bent support arms. The hinge now joins directly to a rounded rear rim, entirely within the original case outline. The two short shell-contoured latches from V3.3 remain, with a hidden exit bevel added to clear the new opening path. This is a printable prototype; it has not been physically printed or fatigue-tested.

## Revised latch design

| Feature | V3.2 | V3.3 / V3.4 |
|---|---:|---:|
| Latches | 4 | 2, at Y = −150 and +150 mm |
| Nominal flexible length | 26 mm | 18 mm |
| Tongue width | 16 mm | 20 mm |
| Nominal tongue skin | 1.6 mm | 1.8 mm |
| Inward hook projection | 0.65 mm | 1.60 mm |
| Commanded release travel | 1.05 mm | 2.10 mm |

The tongues follow the actual outer crust and belt contour. Their thicker roots join directly into the lid. A 0.8 mm thumb lip is the only intentional outward addition in each latch region. The surrounding shell no longer has the four long rectangular latch recesses.

Each fixed catch has a nominal 5.2 mm reinforcement depth behind the running clearance, a 1.55 mm projecting ledge relative to its pocket, and a nominal 3.65 mm back wall. The actual sampled sections measure **1.12 mm of hook-to-ledge overlap** and **3.67 mm behind the recess**. The hook includes a sloped entry face and a positive retaining shoulder, with a nominal 0.35 mm vertical gap in the unloaded closed state.

The geometry tests confirm that both latches block a 0.5° attempted opening without release, that the 0–2.1 mm modeled outward release path is clear, and that the released lid opens through its reviewed range. These tests establish geometric engagement, not retention force or durability. The preview's **Catch section** view and the static section render expose the actual hook and ledge.

Shorter, deeper hooks require more release flex. A straight-beam screening calculation gives about **1.75% nominal strain**, versus 0.37% for the prior dimensions. The actual tongue is curved and varies in section, so this is not a stress analysis or a strength prediction. Print and cycle the new latch coupons before the complete case; check comfortable release, retention and cracking at the root.

## Hinge design

Each printed half contains one 28.9 mm long hinge: two fixed 6 mm ears, one 16 mm moving knuckle, and a captive 2 mm pin. The knuckle outside diameter is 6.6 mm, with a 0.4 mm nominal radial gap, 0.45 mm axial gaps and a 1.9 mm nominal bearing wall. The knuckles meet the shell directly; there are no raised arms or mounting frames.

The axis moves from X = −36, Z = 7 mm to **X = −41, Z = 0 mm**, at the rear rim in source coordinates. The back wall is reprofiled inward to X = −43 mm outside and X = −40 mm inside, providing a nominal 3 mm wall. A rounded edge follows the bearing radius. The moving rim clears this edge radially. The barrel and all hinge-side geometry remain inside the original exterior envelope.

The reviewed opening range is **0–100°**. It is an operating limit, without a mechanical hard stop. Do not force the lid farther. The supplied print pose is 100° open with the pin axes vertical.

The changed pivot revealed a small hook-to-catch conflict early in opening. A **0.9 mm hidden exit relief** now tapers the upper catch pocket; the holding shoulder and reinforced back wall below it remain intact. The measured retaining overlap remains approximately 1.12 mm. Both released latches clear throughout the reviewed motion.

## Review before committing

The review covers the actual manufacturing solids with installed joiners, not just the rendered display. Closed rear/exterior views, 0°/50°/100° hinge views, and transverse hinge and latch sections are inspected before publishing. `AGENTS.md` preserves this requirement for subsequent work. `source/prepublish-review.py` rejects missing motion clearance, stale geometry or preview evidence, stale slices and mismatched print-pack files.

## Geometry review

All **42 checks pass**:

- Each of the four shells and three internal joiners is one watertight, consistently wound solid.
- Each main print segment contains exactly two separate solids: the base and captured moving lid.
- The closed assembly has zero detected overlap.
- There are exactly two latches, one per printed half; both block unreleased opening.
- Each tested catch section has over 1 mm of retaining overlap and over 3.5 mm of back-wall thickness.
- The latch surfaces follow the original exterior except for the thumb lips.
- The modeled release path is clear at 0.1 mm increments from 0 to 2.1 mm.
- Released motion has zero detected overlap at every 1° increment from 0° to 100°, including the installed joiners.
- Each open print segment retains approximately 0.397 mm minimum base-to-lid clearance.
- The original 62 mm diameter × 600 mm capsule clearance is retained within the Boolean tolerance.
- Both compact barrels lie inside the original exterior. The full hinge-side exterior test leaves only 0.00093 mm³ of numerical boundary residue, below its 0.05 mm³ tolerance.
- The joiners have approximately 0.250 mm socket clearance.
- All parts fit the checked 300 × 320 × 325 mm envelope, allowing an 8 mm brim around the main footprints.

A separate clearance certificate covers the intervals between the 501 sampled poses at 0.2° spacing. The minimum sampled gap is 0.300 mm. The farthest moving vertex is 89.472 mm from the axis; its maximum displacement to the nearest sample is 0.1562 mm. Subtracting that bound and a 0.002 mm numerical allowance leaves a conservative **0.1418 mm minimum clearance throughout 0–100°**. This applies to rigid rotation of the CAD mesh with both latches held at the modeled 2.1 mm release position.

The closed-shell check temporarily caps the four designed bottom vents and bridges submillimetre working seams for analysis only. It finds one enclosed bread cavity; this catches unintended openings caused by trimming the rear wall. The original vents and working seams remain in the printable geometry. Each moving bearing also overlaps the shell directly by over 116 mm³.

These checks establish geometric compatibility. They do not establish printed tolerances, release force, structural strength or fatigue life. Full measurements and test names are in `review.json`.

## Center joint and retained improvements

The two main segments meet across flat center faces with a 0.20 mm working seam. One base sleeve and two distinct lid keys align the halves internally. The hinge-side joiners are trimmed to clear the revised rim and motion. **Use the joiners supplied with this revision; their geometry is unchanged from V3.2.** They require a filament-compatible adhesive after dry fitting, and replace the old snap-together center coupling. Keep adhesive away from the base/lid seam and bearings.

The cleaned rib-to-shell unions remain. The sculpted outer crust is preserved apart from the reprofiled rear wall and rounded rim; no display-only center repair is used.

## Print objects and offline slicing

| Object | Supplied X × Y × Z envelope (mm) |
|---|---:|
| Segment A | 155.08 × 131.14 × 306.78 |
| Segment B | 154.94 × 131.14 × 314.78 |
| Base sleeve | 73.51 × 35.99 × 32.00 |
| Lid key 1 | 25.11 × 24.23 × 32.00 |
| Lid key 2 | 25.05 × 30.42 × 32.00 |

Both main segments slice successfully offline in Bambu Studio 02.08.02.61, using the installed Bambu H2C / Generic PLA presets, 0.4 mm nozzle, 0.20 mm layers, four walls, 15% infill, an 8 mm brim and automatic supports. Segment A estimates **14 h 22 m / 447 g**; B estimates **14 h 30 m / 460 g**. These estimates include supports and brim, and exclude joiners and coupons. No job was sent to a printer. Input STL hashes in `review.json` tie the results to these exports.

Keep the supplied upright, open orientation. Inspect supports under the latch undercuts and rim features, and keep them out of working bearings. This complete object is not claimed to print without supports. The STL units are millimetres. The 3MF files contain oriented geometry, not prepared printer jobs or G-code.

## Fit-test sequence

1. Print `hinge_gap_0p4`, cropped from the actual final hinge and adjoining shells. Check freedom through the reviewed travel and captive retention. `hinge_gap_0p3` and `hinge_gap_0p5` are circular-bore variants to compare tighter and looser fits; they change only the moving center bearing. Parameter changes require regenerating the full model.
2. Print `latch_base` and `latch_lid`. Check seating, retention and release at the finger lip. Do not scale coupons independently.
3. Print `joint_A`, `joint_B` and all three full-size joiners. Dry-fit alignment and check opening before bonding.
4. Print the main segments only after those checks. Remove supports, free the hinges gently, dry-fit the assembly, then bond the matching base and lid joiners separately.

## Physical checks still needed

Test hinge freedom, the small pin and direct shell attachment strength, latch cycling, carrying loads, adhesive compatibility and joint strength. Coupon handling and load tests are required before carrying use, including the revised latch roots and catch ledges.

Across 4,210 normal-ray wall samples, the retained crust measures at least 1.53 mm on the base and 1.58 mm on the lid. The sample set does not measure the new latch tongues. It also omits end tips, the center joint, central parting seam, small faces and much of the left rim. It does not establish the global minimum wall or strength of the hinge attachments. Region minima and sample locations are recorded in `wall-samples.json`.

## Preview and reproducibility

The interactive review and renders derive from the manufacturing CAD. The display mesh uses 0.02 mm simplification and 0.001 mm coordinate rounding for remote viewing; the STL/3MF manufacturing exports retain the detailed geometry. The opening control applies the real hinge pivot and a latch-release display deformation. Hinge section uses separate capped cross-sections cut from the actual manufacturing solids; its lid section rotates around the same pivot. These inspection sections are excluded from the print objects.

The source pack includes the generator, unchanged V2 reference, fit coupons, geometry checks, preview export, renders and slicer setup scripts. Dimensions are millimetres. The source identifies the reference crust as “Baguette” by Isa Lousberg, CC0/Public Domain. Display color does not specify filament.
