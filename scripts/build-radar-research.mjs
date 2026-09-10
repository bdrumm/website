import {writeFile} from 'node:fs/promises';
import {HARDWARE_PRESETS,formatError} from '../src/radar-hardware.js';
import {makeRig} from '../src/radar-fusion.js';
import {surveyHardware} from '../src/radar-survey.js';
const results=HARDWARE_PRESETS.map(p=>surveyHardware(p.id));
const offset=surveyHardware('optical','multi','drift');
const link=p=>p.sources.map(([label,url])=>`[${label}](${url.startsWith('docs/')?url.slice(5):url})`).join(', ');
let text=`# CSI Presence — hardware versions and XYZ accuracy research

Research and implementation: 2026-09-10. All demonstrations are synthetic. These are proposed extensions to the audited ESP32 project, not connected devices, purchased equipment or validated installations. Vendor claims are distinguished from our configuration proposals and chosen noise models.

## Recommended direction

For the highest-precision cooperative reference among the room-tracking systems reviewed, commission a synchronized IR marker system. The premium example here uses sixteen OptiTrack PrimeX 120W cameras, eight per room across three mounting tiers. A reflective marker or rigid cluster defines the tracked point. The camera count and positions are our proposal; have the supplier validate coverage, lens choice, network power, software and the intended volume. A PrimeX 13-class system may already meet a 1 cm acceptance target; the 120W is not claimed necessary. Vicon and Qualisys are alternative professional suppliers, and their differently defined performance figures do not establish a cross-brand winner. [PrimeX 120](https://optitrack.com/cameras/primex-120), [PrimeX 13](https://www.optitrack.com/cameras/primex-13), [Vicon Valkyrie](https://www.vicon.com/hardware/cameras/valkyrie/), [Qualisys Arqus](https://www.qualisys.com/cameras/arqus/).

For an unmarked person, prototype calibrated multi-view depth in a bounded region of interest, supported by 3D radar for wider occupancy evidence. Define a repeatably identifiable keypoint before claiming accuracy. Whole-body centroid, anatomical joints, a tag and a rigid marker reference are different measurement targets. No reviewed compact radar or room-depth specification proves blanket 1 cm XYZ person tracking throughout this two-room space.

## Implemented hardware versions

${HARDWARE_PRESETS.map(p=>`### ${p.version} — ${p.name}

**Tracked reference:** ${p.target}. **Planning class:** ${p.classLabel}.

${p.summary}

**Proposed bill of materials:** ${p.bill}

**Published evidence:** ${p.spec} ${link(p)}.

**Model assumptions:** ${p.model}

**Integration:** ${p.integration}

**Limits:** ${p.limits}

**Relative complexity:** ${p.cost}. This is not a supplier quote.
`).join('\n')}

## What the browser actually computes

The original CSI layer reconstructs X/Y from synthetic calibrated link scores using the source-derived RTI inverse. It does not extract physical range from Wi-Fi CSI. The grid is approximately 15 cm; subdividing its pixels would not create more measurement information.

Each advanced version generates observations in a separate stage. The estimator receives camera origins and unit bearing directions, range origins and measured distances, or already-associated 3D points from a simplified depth/radar SDK-output model. It never receives ground truth. The displayed error is calculated afterward against the synthetic target.

The 3D solver uses robust weighted nonlinear least squares, multiple initial heights, and a weak 1.8 m Wi-Fi X/Y prior in the live demonstration. It rejects singular or poorly conditioned solutions, conflicting observations, behind-camera geometry, nearly opposite camera intersections and ambiguous solutions. Camera pairs require a useful horizontal crossing angle and small closest-ray miss. Range-only height requires at least four noncoplanar anchors. A registered depth/3D-radar point already supplies all three axes. The source host's camera solver is documented separately in the project audit; this multi-modality solver is a new proposed extension.

Range-only sensors mounted in one plane can produce mirror solutions. This demo deliberately rejects those unconstrained fixes, even where an added floor-side constraint might disambiguate a real installation. Cameras at equal mounting heights can still resolve Z because they measure elevation as well as azimuth. Merely spreading sensors vertically on one pole does not provide adequate horizontal geometry.

Noise is deterministic and temporally correlated: a mix of two sinusoids with different sensor-family phases, scaled by each preset's noise assumptions. Those scales are not measured Gaussian standard deviations or conversions of vendor specification bounds. Depth/radar points use an isotropic XYZ model, while real depth uncertainty is direction dependent. Observations share one synthetic clock. Missing pixels, multiple people, body-point disagreement, lens distortion, raw radar point clouds, NLOS bias, timing jitter and automatic identity association are not simulated.

Model spread comes from local linearized measurement geometry, excluding the weak RF prior. The two-times-Z spread is not a calibrated probability interval or bound. Fixed shared errors can remain invisible to it. The heatmap uses a minimum display width so tiny optical errors remain visible; its footprint is not the actual precision radius.

## Height, coverage and stress controls

The room is 10 × 6 × 3 m with a partition at X=5.6 and a doorway at Y=2.4–3.6. The multi-level sweep visits varying Z; controls support X/Y placement and Z=0.2–2.7 m. Z means one tracked point above a common floor datum. It is not a person's full standing height, body center of mass, posture, fall detection, floor identity or stair navigation.

Each sensor checks its 3D range, horizontal/vertical view and partition line of sight. D455-like views are restricted to 0.6–4 m in the model. UWB wall-crossing readings are discarded rather than unrealistically treated as accurate. Real UWB may communicate through an obstacle while its range becomes biased. Four UWB anchors per room is minimum geometry with limited dropout tolerance.

- **Surveyed geometry:** no common registration offset; synthetic measurement noise remains.
- **Survey offset:** every precision observation uses the same +30 / −20 / +25 mm frame offset, magnitude 43.9 mm. This is a fixed bias, not random noise that more sensors average away.
- **Half obscured:** odd-numbered precision sensors lose observations; the remaining sensors still need valid geometry and visibility.
- **Flat mounts:** all precision sensors move to Z=1.3 m; their headings/tilts remain derived from the intended room view.
- **Sensor toggles and node loss:** optical and range/radar observations can be removed independently. CSI outages do not erase a still-valid optical or radar position.

A qualified 3D fix contributes separate room evidence and can retain an occupied state when CSI motion drains. Room heat is not a calibrated occupancy probability. In tagged/marker modes it describes the instrumented target; it does not prove that every person in the room is detected.

## Repeatable synthetic comparison

The website's comparison runs 144 samples per version: X = 1, 2.2, 3.5, 4.7, 6.3, 7.3, 8.4, 9.2 m; Y = 1, 3, 5 m; Z = 0.4, 1.4, 2.4 m; time phases 0 and 7 s. It uses precision observations alone and no RF position prior. The target positions and times match across versions. Results below use distributed heights and surveyed geometry.

Median, p95 and maximum are calculated only for resolved samples; the 1 cm fraction uses all 144 samples. Reporting availability prevents missing data from making a configuration appear artificially accurate. The samples are deterministic and sparse: they do not establish a probabilistic real-world success rate or complete-volume coverage. V0 is intentionally unresolved in this XYZ comparison because it measures only X/Y.

| Version | Resolved | Median XYZ | p95 XYZ | Maximum XYZ | All samples ≤1 cm |
|---|---:|---:|---:|---:|---:|
${results.map(r=>`| ${r.version} ${r.name} | ${r.resolved}/${r.total} | ${formatError(r.median)} | ${formatError(r.p95)} | ${formatError(r.max)} | ${(100*r.within1cm/r.total).toFixed(1)}% |`).join('\n')}

These figures measure the assumptions coded into this model, not the named products. In the optical reference model, adding the common survey offset changes p95 to **${formatError(offset.p95)}** and leaves **${offset.within1cm}/${offset.total}** samples within 1 cm, despite a small internal spread. This experiment illustrates absolute bias versus repeatability.

The survey can be rerun for the active layout and stress condition, then downloaded as JSON with assumptions, per-axis mean bias, coverage and error summaries. Regenerate this document and its baseline JSON with \`node scripts/build-radar-research.mjs\`.

## Proposed sensor coordinates

All values are meters in the common room frame. These are illustrative mounts, not installation drawings. UI sensor tables additionally expose headings, tilts, simplified ranges and fields of view. Optical devices on both sides of the partition require common calibration and doorway coverage.

${HARDWARE_PRESETS.filter(p=>p.id!=='csi').map(p=>{const rig=makeRig('multi',p);return `### ${p.version} — ${p.name}\n\n| ID | Modality | X | Y | Z |\n|---|---|---:|---:|---:|\n`+[...rig.cameras,...rig.ranges,...rig.points].map(s=>`| ${s.id} | ${s.family||s.kind} | ${s.x.toFixed(2)} | ${s.y.toFixed(2)} | ${s.z.toFixed(2)} |`).join('\n');}).join('\n\n')}

## Installation details that matter at 1 cm

For optical marker tracking, two synchronized views are the geometric minimum; plan three to four or more useful views for occlusion resilience. Our premium layout uses upper mounts at 2.7 m, middle mounts at 1.7 m and lower mounts at 0.9 m, with horizontal baseline and both rooms independently covered. A rigid body needs at least three suitably arranged markers; four or more with an asymmetric pattern improves resilience. [OptiTrack camera placement](https://docs.optitrack.com/hardware/camera-placement), [rigid-body tracking](https://docs.optitrack.com/v3.0/motive/rigid-body-tracking).

PrimeX 120/120W requires vendor-approved **PoE++ Type 4**, with appropriate per-port and total power allocation. Generic PoE or a Type 3 60 W port is insufficient. Include capture software licenses, calibration tools, mounts, markers and a supported Windows capture workstation in the proposal. The Mac and website can be clients of the capture host. [PrimeX 120 specifications](https://www.optitrack.com/cameras/primex-120/specs), [switch configuration](https://docs.optitrack.com/v3.2/hardware/cabling-and-wiring/switch-configuration-for-primex-120), [Motive installation](https://docs.optitrack.com/motive/installation-and-activation).

At 5 m, a 0.1° orientation error produces approximately 8.7 mm of transverse error. At 1 m/s, a 10 ms time mismatch produces 10 mm of displacement. These are geometry/time calculations, not device specifications. Survey independently, preserve acquisition timestamps, synchronize where supported and check end-to-end latency rather than inferring it from camera FPS. [RealSense multi-camera setup](https://www.realsenseai.com/stereo-depth/multiple-depth-cameras-setup-guide/).

A proposed adapter boundary is vendor capture/ranging software → local timestamped Python/Node adapter → normalized observations and tracked objects → website floor/elevation views. Preserve meters, coordinate transformations, sensor IDs, tracked-point definition, quality, timestamps and observed/predicted/stale states. OptiTrack uses Motive/NatNet; Vicon provides DataStream; Qualisys provides the QTM real-time protocol. Those SDKs consume processing-host output and do not replace licensed capture software. [NatNet](https://docs.optitrack.com/v3.3/developer-tools/natnet-sdk/natnet-4.0), [Vicon DataStream](https://www.vicon.com/software/datastream-sdk/?section=downloads), [QTM protocol](https://docs.qualisys.com/qtm-rt-protocol/).

## Other configurations worth evaluating

D555 adds PoE and IP65 packaging around the D450 depth module, with a 95 mm baseline. Its deployment convenience is not evidence of a precision jump. D405 is a 7–50 cm close-up option: its ±2% at 50 cm corresponds to about 1 cm axial error, and its submillimeter feature-detection language refers to 7 cm. It belongs in a small inspection volume. [D555 datasheet](https://dev.realsenseai.com/download/42013/), [D405](https://www.realsenseai.com/products/stereo-depth-camera-d405/).

A custom calibrated, rigid stereo pair can trade a longer baseline for depth sensitivity. In the ideal relation σZ≈Z²σd/(fB), a 0.5 m baseline, 1000 px focal length and 0.2 px disparity uncertainty give 3.6 mm at 3 m and 10 mm at 5 m. Those are hypothetical random-error calculations, not a product result; calibration, synchronization, occlusion and correspondence can dominate. [Stereo depth geometry](https://www.realsenseai.com/stereo-depth/the-basics-of-stereo-depth-vision/).

Qualisys Arqus advertises resolution as the smallest detectable motion at 10 m. Do not relabel those values as absolute room-position accuracy. Vicon likewise distinguishes accuracy, precision and bias. Request a supplier proposal and experimental method for this actual volume. [Qualisys metric definition](https://www.qualisys.com/cameras/arqus/), [Vicon definitions](https://www.vicon.com/support/faqs/how-accurate-precise-are-your-systems/).

## Precision references outside the active presets

For cooperative industrial metrology, the Leica AT960 specification is ±(15 µm + 6 µm/m), equivalent to ±0.075 mm at 10 m. FARO VantageS/E separately specifies distance MPE of 16 µm + 0.8 µm/m and an angular metric of 20 µm + 5 µm/m. At 10 m these are 24 µm and 70 µm respectively; the smaller distance figure is not XYZ accuracy. These metrics are subject to the manufacturers' stated tests and are not comparable to every-frame human tracking. [Hexagon AT960](https://nexus.hexagon.com/home/product/laser-trackers-at960/), [FARO VantageS/E sheet](https://www.faro.com/-/media/Project/FARO/FARO/FARO/Resources/2_TECH-SHEET/FARO-Vantage-Laser-Trackers/TechSheet_Vantage_ENG.pdf?rev=-1).

A laser tracker needs a visible cooperative reflector or compatible rigid target. Reacquiring an interrupted beam does not measure through an obstacle. It is appropriate to investigate rental/access as a ground-truth survey instrument for a rigid object, not as an ambient person detector or simultaneous crowd tracker. Specialist software, tooling and commissioning dominate this industrial metrology class; no current price was verified. [Hexagon line-of-sight behavior](https://docs.hexagonmi.com/pcdmis/2023.2/en/helpcenter/mergedProjects/portable/Leica_Laser_Tracker_Introduction.htm).

Marvelmind advertises typical ±2 cm positioning with a mobile ultrasonic beacon and acoustic line of sight to suitably placed stationary beacons. Height needs useful 3D geometry. Its manual gives approximately 0.17% range error per °C of temperature-setting error, about 1.7 cm over 10 m for a 1°C mismatch. Smoothing can improve stability while increasing delay. This is a separate tagged technology, not an accuracy setting for UWB. [Marvelmind FAQ](https://marvelmind.com/faq/), [operating manual §11.9](https://marvelmind.com/pics/marvelmind_navigation_system_manual.pdf), [accuracy and latency](https://marvelmind.com/how_to_increase_accuracy_of_precise_indoor_positioning_system/).

## Acceptance plan

Define the tracked reference and useful volume, then define whether 10 mm refers to p95 or maximum Euclidean XYZ error. Keep validation targets independent of calibration targets. Measure a low/middle/high survey grid plus doorway transitions, static repeatability, moving trajectories, occlusion, multiple people, furniture changes and recalibration. Report per-axis bias, median/p95/max XYZ error, valid-fix percentage and measurement-to-display latency. Separate random repeatability from systematic bias and predicted output from fresh measurements.

No real installation has passed this acceptance test in this work. Device firmware, physical sensor calibration and the source operator console remain unchanged; the review identifies their follow-up work separately.
`;
await writeFile(new URL('../docs/csi-hardware-research.md',import.meta.url),text);
await writeFile(new URL('../docs/csi-hardware-survey.json',import.meta.url),JSON.stringify({simulation:true,units:'meters',conditions:'distributed heights, surveyed geometry, precision observations only',results},null,2)+'\n');
console.log('Wrote sourced hardware research and deterministic reference survey.');
