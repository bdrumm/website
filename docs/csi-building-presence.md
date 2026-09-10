# CSI Presence — multiple building levels

Implemented 2026-09-10 as a simulated extension of the Parametric Space showcase. No physical sensor, firmware configuration or live host service is changed. The source project and vendor hardware research remain available in [the technical review](csi-presence-review.md) and [hardware research](csi-hardware-research.md).

## Building setup

The demo opens with three independently instrumented floors and one synthetic reference per floor. Choose two, three or four floors. Each floor uses the same 10 × 6 m plan, with a 3.3 m floor-to-floor pitch, 3 m clear height and 0.3 m slab. These are fictional demonstration dimensions, not a survey of the user's building.

| Floor | Floor elevation | Clear-space global Z |
|---|---:|---:|
| Ground | 0.0 m | 0.0–3.0 m |
| Level 1 | 3.3 m | 3.3–6.3 m |
| Level 2 | 6.6 m | 6.6–9.6 m |
| Level 3, optional | 9.9 m | 9.9–12.9 m |

The main floor plan displays X/Y on the active floor, which defaults to ground. White rings show optional synthetic ground truth and pink markers show fitted positions. The Live readings tab reports local height and global building Z. The separate building-section visualization and headline metrics panel have been removed.

`global Z = surveyed floor elevation + height above that floor`

The main view starts on the ground floor. Height controls refer to the active floor; the building-Z readout includes its base elevation. The underlying simulation still maintains independent references, presence timers and failed nodes across floors.

## Controls and scenarios

The main visualization has four display choices in its right sidebar: Hybrid evidence, Wi-Fi / RTI, Camera evidence and RF × camera agreement. They replace the floor-selection menu and move above the visualization on narrow screens. The “A shared picture” component summary follows the main view. Hardware versions, live readings, signal pipeline, system/recovery, accuracy research and evidence remain in tabs below the summary. Switching display modes or tabs preserves simulation and walkthrough state. Detailed mounting, height and measurement controls are under “Measurement & sensor settings.”

- **Across all floors:** one synthetic reference on each floor, with offset paths and a shared clock.
- **Stairwell handoff:** one reference approaches the shaft, climbs to the top floor, visits the landing and returns along a continuous loop.
- **Empty building:** removes all references; each room's hold expires independently.
- **Within-floor walk / height sweep:** runs on the active floor when the scenario starts.
- **Stillness:** freezes current references and drains the illustrative motion signal over two seconds. Precision modalities may retain observations according to their existing model.
- **Place target here / map / XYZ controls:** places one persistent synthetic reference on the selected floor and preserves references already on other floors.
- **Clear target:** removes only the selected floor's manual reference.
- **Floor sensors offline:** removes that floor's CSI links and precision sensors. Restoring the floor preserves any nodes that were individually offline before the floor outage.
- **Node offline:** affects that node on the selected floor only. Ground-A and Level-1-A are distinct devices.

This is not a people-counting system. One synthetic reference per floor is supported in the distributed/manual scenarios; the stairwell scenario contains one moving reference across the building. Target association is assumed. The model does not solve automatic identity matching, multiple people in one room, body shape or anonymous track correspondence.

## Sensor placement and hardware quantities

Each selected hardware version is repeated on every floor. Sensor X/Y and local mount height follow the per-floor hardware preset. The model translates each mounting position to the building frame by adding that floor's surveyed base Z. Floor-qualified display IDs and globally unique measurement IDs keep observations distinct.

With the default eight CSI nodes per floor, three floors use 24 CSI nodes. Precision quantities are:

| Version | Precision hardware per floor | Three-floor total |
|---|---|---|
| V0 CSI | No precision sensor | 0; 24 CSI nodes |
| V1 ESP32 hybrid | 4 camera nodes + 8 LD2410 range sensors | 12 camera nodes + 24 LD2410 sensors |
| V2 3D mmWave | 4 TI-style radar units | 12 radar units |
| V3 Tagged UWB | 8 UWB anchors | 24 anchors, plus tags for tracked references |
| V4 Depth + mmWave | 8 depth cameras + 4 radar units | 24 depth cameras + 12 radar units |
| V5 Optical reference | 16 synchronized marker cameras | 48 marker cameras |

These are modeled planning quantities, not a recommended purchase order or proof that every point has adequate coverage. Hardware specifications, power requirements, host software, tags/markers and integration work remain described in the [hardware research](csi-hardware-research.md). The hardware cards state per-floor quantities; the building dashboard reports the actual total for its selected size.

For a real installation, survey each floor datum and every sensor pose into one common coordinate system. Place sensors in each floor's occupied zones and at landings with useful overlap. Plan data transport, synchronization, power and failure reporting across the whole building. Multiplying sensor count does not automatically establish centimeter accuracy.

## Cross-floor visibility and stairwell

The demonstration has an aligned opening at X=4.3–5.3 m and Y=2.4–3.6 m. A sightline crossing a slab is accepted only when it passes through the opening at both slab faces. A line that enters the opening but cuts through its side during the 0.3 m thickness is blocked. The original XY partition/door, sensor range, field of view and depth near limit also apply.

This intentionally conservative model blocks every modeled precision modality through a solid slab. Per-floor CSI disturbance is also confined to the reference's physical floor band in the observation generator. Real RF transmission, attenuation, multipath and NLOS biases are not derived from slab material here. They require measurement; the website is not claiming that radio waves physically cannot pass between floors.

Adjacent-floor sensors can contribute to the same measured stairwell point when their sightlines pass through the shaft. The precision solver is bounded by the full building volume rather than clipping every point to the first 3 m. No dedicated continuous-height sensor or live staircase integration is implied.

## Presence and inferred level

Every floor keeps its own RTI reconstruction and each room keeps its own six-second hold. All floors share the same simulation clock. Precision measurements are generated separately from estimation. The global estimator receives observed rays, ranges or associated 3D points; it does not receive a true floor label or the viewed-floor selection.

For building XYZ, the solver uses precision observations without an RF position prior. CSI remains independent per-floor presence evidence. The original single-floor model still supports its weak XY prior and is retained for hardware comparison and mathematical regression checks.

A precision floor assignment is made only when the estimated Z, including twice the local modeled Z spread, fits inside one floor's clear-height band. A boundary or slab-gap case remains unresolved or is reported as a stairwell transition. The model does not force a nearest-floor result. This spread is a local geometric approximation, not a calibrated statistical confidence interval, and it excludes shared survey bias.

Raw observations remain available per floor even when height or floor classification fails. The selected floor's heatmap uses its classified track rather than projecting a neighboring floor's observations into its occupancy field. The building section can show a valid global stairwell point even when no floor assignment is justified.

Floor states have distinct meanings:

| State | Meaning |
|---|---|
| PRESENT | Current per-floor evidence crosses the configured threshold, or a qualified measured 3D fix supports the floor. |
| HOLDING | A room was occupied recently and its independent six-second hold has not expired. |
| QUIET | The modeled installation has available coverage but no current or held presence. This is not a guarantee that all people are absent. |
| UNOBSERVED | The floor lacks available observations/coverage in the current model; it must not be presented as confidently empty. |

A single reference leaving one floor may leave HOLDING below while the next floor becomes PRESENT. Two such floor indicators do not establish two people. Removing a floor also removes frozen/manual references outside the resized building.

## Accuracy and validation

Displayed building XYZ error includes the actual global Z difference from the synthetic reference. Correct X/Y on the wrong storey must not look like a small error. Height above a floor, global elevation and full 3D error are labeled separately.

The existing hardware benchmark remains a **single-floor** 144-sample comparison. It does not validate cross-floor handoff, whole-building coverage or physical hardware performance. The new building regression suite checks global translation, visibility and state behavior rather than presenting an installation accuracy claim.

The full site suite passes 111 checks, including 27 building-specific regressions covering:

- Slab and stair-opening visibility in both directions and through slab thickness.
- Global XYZ translation, upper-floor range solving and uncertain floor boundaries.
- View-selection invariance and isolated node/floor outages.
- One shared clock, independent holds and ghost-presence prevention after hardware changes.
- Floor-count changes, raw readings under unresolved geometry and unique IDs.
- All six hardware presets at two, three and four storeys.
- Stair-path continuity, including the full-cycle seam, and global stair fixes.
- Manual target placement/removal and the distinction between CSI floor evidence and measured Z.

Browser interaction/screenshot QA and physical hardware validation were not performed. Builds and local route/module availability are checked separately before publication.

## Source map

- `src/radar-building.js`: building geometry, slab visibility, global measurement assembly, level classification, scenarios and per-floor state.
- `src/radar-fusion.js`: observation generation, optional visibility filtering and bounded XYZ solving.
- `src/radar-simulation.js`: source-derived per-floor RTI and room holds; accepts explicitly supplied building simulation frames.
- `src/radar-project.js`: building controls, floor cards, selected-floor plan, global elevation and optional agent controls.
- `src/radar-building.test.mjs`: multi-floor regression suite.

The existing ESP32 firmware and Python operator console are unchanged. A real multi-floor system still needs floor-qualified device configuration, surveyed transforms, timestamped data, validated association, quality/staleness handling and an independently measured acceptance test.
