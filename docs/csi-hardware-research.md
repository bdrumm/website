# CSI Presence — hardware versions and XYZ accuracy research

Research and implementation: 2026-09-10. All demonstrations are synthetic. These are proposed extensions to the audited ESP32 project, not connected devices, purchased equipment or validated installations. Vendor claims are distinguished from our configuration proposals and chosen noise models.

## Recommended direction

For the highest-precision cooperative reference among the room-tracking systems reviewed, commission a synchronized IR marker system. The premium example here uses sixteen OptiTrack PrimeX 120W cameras, eight per room across three mounting tiers. A reflective marker or rigid cluster defines the tracked point. The camera count and positions are our proposal; have the supplier validate coverage, lens choice, network power, software and the intended volume. A PrimeX 13-class system may already meet a 1 cm acceptance target; the 120W is not claimed necessary. Vicon and Qualisys are alternative professional suppliers, and their differently defined performance figures do not establish a cross-brand winner. [PrimeX 120](https://optitrack.com/cameras/primex-120), [PrimeX 13](https://www.optitrack.com/cameras/primex-13), [Vicon Valkyrie](https://www.vicon.com/hardware/cameras/valkyrie/), [Qualisys Arqus](https://www.qualisys.com/cameras/arqus/).

For an unmarked person, prototype calibrated multi-view depth in a bounded region of interest, supported by 3D radar for wider occupancy evidence. Define a repeatably identifiable keypoint before claiming accuracy. Whole-body centroid, anatomical joints, a tag and a rigid marker reference are different measurement targets. No reviewed compact radar or room-depth specification proves blanket 1 cm XYZ person tracking throughout this two-room space.

## Implemented hardware versions

### V0 — ESP32 / CSI

**Tracked reference:** Unlabeled radio disturbance. **Planning class:** Room presence.

Eight ESP32 radios reconstruct an X/Y disturbance field. This configuration has no direct height observation.

**Proposed bill of materials:** 8 × ESP32 CSI nodes + Wi-Fi host running the existing Python pipeline.

**Published evidence:** The project documents two-node presence tests. Its multi-node localization results are synthetic. No measured centimeter-level or Z accuracy. [Project review](csi-presence-review.md).

**Model assumptions:** Source-derived 2D RTI on a ~15 cm grid. No camera, range, or depth observations.

**Integration:** Existing source architecture; more nodes and actual room localization still need installation testing.

**Limits:** A quiet or stationary body may stop disturbing the motion window. Finer display pixels do not add spatial information.

**Relative complexity:** Lowest hardware complexity. This is not a supplier quote.

### V1 — ESP32 / hybrid

**Tracked reference:** One associated synthetic centroid. **Planning class:** Coarse sensor fusion.

Four ESP32 camera views and eight LD2410 range constraints show how staggered mounts can help recover Z.

**Proposed bill of materials:** 8 × ESP32 + LD2410 modules; 4 × ESP32-CAM or P4 camera nodes; surveyed mounts; host.

**Published evidence:** LD2410 reports range in centimeters; this is not centimeter accuracy. Its protocol offers 0.75 m / 0.2 m gate settings, subject to firmware support. [Hi-Link LD2410 protocol](https://r0.hlktech.com/download/HLK-LD2410-24G/1/LD2410%20%E4%B8%B2%E5%8F%A3%E9%80%9A%E4%BF%A1%E5%8D%8F%E8%AE%AE%20V1.07.pdf).

**Model assumptions:** Assumed range noise scale 25 cm; azimuth 0.7°; elevation 0.9°. Ideal single-target association and known sensor poses.

**Integration:** Existing UART/camera ingest can be reused; cross-sensor association and this 3D solver are new host work.

**Limits:** Real modules may select different reflections or people. Combining their ranges as one point is an unvalidated extension, especially at different heights.

**Relative complexity:** Low hardware cost · substantial calibration work. This is not a supplier quote.

### V2 — 3D mmWave

**Tracked reference:** Associated radar track centroid. **Planning class:** Decimeter reference.

Four TI IWR6843-class radars provide XYZ tracks with range, azimuth and elevation. No worn tag is required.

**Proposed bill of materials:** 4 × IWR6843ISK / ODS evaluation boards, two per room; USB or UART gateways; host track fusion.

**Published evidence:** TI’s TIDEP-01000 reference design reports ±10 cm people-location accuracy in its demonstration. Its 8.4 cm range resolution is a different metric. [TI people-tracking design guide](https://www.ti.com/lit/ug/tidue71d/tidue71d.pdf).

**Model assumptions:** Each visible radar supplies an associated XYZ point with 12 cm noise scale per axis. Demonstration cones: 120° × 40°; capped at 8 m.

**Integration:** Decode TI point-cloud/target TLVs, transform poses and synchronize tracks. The current LD2410 parser cannot ingest this data.

**Limits:** A moving radar centroid is not a fixed anatomical point. Reflections, sparse elevation data, interference and track association can dominate error.

**Relative complexity:** Development-kit hardware · custom host integration. This is not a supplier quote.

### V3 — UWB / tagged

**Tracked reference:** A worn or attached UWB tag. **Planning class:** 10–30 cm product class.

Eight Qorvo UWB anchors at staggered heights range to one tag. This supplies a track identity and independent distance measurements.

**Proposed bill of materials:** 8 × DWM3001C anchor nodes + 1 tag, mounting survey, anchor firmware and host bridge. Four anchors per room; one lost anchor may invalidate range-only height.

**Published evidence:** Qorvo lists <15 cm 2D and <30 cm 3D location accuracy for DWM3001C. That is not a room-wide 1 cm XYZ specification. [Qorvo DWM3001C specifications](https://www.qorvo.com/products/p/DWM3001C), [Qorvo DWM3000 module](https://www.qorvo.com/products/p/DWM3000).

**Model assumptions:** Assumed 10 cm line-of-sight range noise; 1 mm numeric quantization. Four noncoplanar visible anchors are needed for range-only Z.

**Integration:** New UWB firmware and timestamped ranging adapter. DWM3001C includes an nRF52833; DWM3000 instead needs an external MCU.

**Limits:** The tag position differs from body centroid. Wall-crossing ranges are discarded here; the model does not reproduce NLOS bias or body shadowing.

**Relative complexity:** Moderate RF hardware · a tag for each tracked subject. This is not a supplier quote.

### V4 — Depth + mmWave

**Tracked reference:** One matched visible keypoint. **Planning class:** Centimeter-class test ROI.

Eight calibrated RealSense D455 views, supported by four 3D radars, prioritize optical geometry while radar retains broader coverage.

**Proposed bill of materials:** 8 × D455 (four per room), 4 × IWR6843 radars, powered USB3 distribution, synchronization, surveyed mounts and host.

**Published evidence:** D455 specifies <2% depth error at 4 m—roughly 8 cm axial error at that distance. It does not specify 1 cm person tracking throughout a room. [RealSense D455](https://www.realsenseai.com/products/real-sense-depth-camera-d455f/).

**Model assumptions:** Optical point noise scale = 10 mm + 4 mm × distance² (meters); optical range 0.6–4 m. Point noise is isotropic in this simplified model. Radar XYZ noise scale 12 cm.

**Integration:** New depth SDK adapter, extrinsic calibration, synchronized timestamps and keypoint association. Radar and optical targets must refer to the same point.

**Limits:** This model assumes a correctly matched keypoint. Texture, occlusion, depth holes, calibration drift and body-pose inference are not reproduced.

**Relative complexity:** Higher sensor count · USB bandwidth and host compute. This is not a supplier quote.

### V5 — Optical / reference

**Tracked reference:** A reflective marker or rigid marker cluster. **Planning class:** Sub-centimeter reference.

Sixteen synchronized OptiTrack PrimeX 120W cameras triangulate cooperative IR markers. This is the strongest precision option researched here.

**Proposed bill of materials:** 16 × PrimeX 120W, eight views per room at three heights; vendor-approved PoE++ Type 4 power/network, licensed Windows Motive host, calibration wand, floor reference and marker cluster.

**Published evidence:** OptiTrack lists typical ±0.10 mm 3D accuracy for a 9 × 9 m tracking area. That vendor example is not a guarantee for this two-room rig or an unmarked person. [OptiTrack PrimeX 120](https://optitrack.com/cameras/primex-120/).

**Model assumptions:** Assumed 0.02° azimuth/elevation noise; 2 mm camera residual floor; 8 m demo optical cutoff; 65° × 51° wide lenses.

**Integration:** Stream marker/rigid-body data via Motive/NatNet into the host. CSI remains a separate presence layer; it should not dilute a valid optical reference.

**Limits:** Requires markers, calibrated overlapping sightlines and synchronization. Marker loss, correspondence, rig movement and global registration error can outweigh sensor noise.

**Relative complexity:** Specialist motion-capture system · vendor-designed coverage. This is not a supplier quote.


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
| V0 ESP32 / CSI | 0/144 | Unresolved | Unresolved | Unresolved | 0.0% |
| V1 ESP32 / hybrid | 136/144 | 4.4 cm | 13.3 cm | 19.5 cm | 0.7% |
| V2 3D mmWave | 144/144 | 8.9 cm | 16.2 cm | 17.0 cm | 0.0% |
| V3 UWB / tagged | 144/144 | 10.7 cm | 21.2 cm | 37.5 cm | 0.0% |
| V4 Depth + mmWave | 144/144 | 3.5 cm | 16.1 cm | 17.0 cm | 7.6% |
| V5 Optical / reference | 144/144 | 1.0 mm | 3.8 mm | 4.5 mm | 100.0% |

These figures measure the assumptions coded into this model, not the named products. In the optical reference model, adding the common survey offset changes p95 to **4.5 cm** and leaves **0/144** samples within 1 cm, despite a small internal spread. This experiment illustrates absolute bias versus repeatability.

The survey can be rerun for the active layout and stress condition, then downloaded as JSON with assumptions, per-axis mean bias, coverage and error summaries. Regenerate this document and its baseline JSON with `node scripts/build-radar-research.mjs`.

## Proposed sensor coordinates

All values are meters in the common room frame. These are illustrative mounts, not installation drawings. UI sensor tables additionally expose headings, tilts, simplified ranges and fields of view. Optical devices on both sides of the partition require common calibration and doorway coverage.

### V1 — ESP32 / hybrid

| ID | Modality | X | Y | Z |
|---|---|---:|---:|---:|
| C1 | camera | 0.35 | 0.35 | 2.55 |
| C2 | camera | 5.10 | 5.60 | 1.85 |
| C3 | camera | 6.00 | 0.35 | 2.45 |
| C4 | camera | 9.65 | 5.60 | 1.75 |
| R1 | range | 0.60 | 0.60 | 0.45 |
| R2 | range | 5.00 | 0.60 | 2.55 |
| R3 | range | 5.00 | 5.40 | 0.95 |
| R4 | range | 0.60 | 5.40 | 1.40 |
| R5 | range | 6.00 | 0.60 | 0.50 |
| R6 | range | 9.40 | 0.60 | 2.60 |
| R7 | range | 9.40 | 5.40 | 1.05 |
| R8 | range | 6.00 | 5.40 | 1.55 |

### V2 — 3D mmWave

| ID | Modality | X | Y | Z |
|---|---|---:|---:|---:|
| M1 | radar | 0.35 | 0.35 | 2.10 |
| M2 | radar | 5.10 | 5.60 | 2.50 |
| M3 | radar | 6.00 | 0.35 | 2.10 |
| M4 | radar | 9.65 | 5.60 | 2.50 |

### V3 — UWB / tagged

| ID | Modality | X | Y | Z |
|---|---|---:|---:|---:|
| U1 | range | 0.60 | 0.60 | 0.45 |
| U2 | range | 5.00 | 0.60 | 2.55 |
| U3 | range | 5.00 | 5.40 | 0.95 |
| U4 | range | 0.60 | 5.40 | 1.40 |
| U5 | range | 6.00 | 0.60 | 0.50 |
| U6 | range | 9.40 | 0.60 | 2.60 |
| U7 | range | 9.40 | 5.40 | 1.05 |
| U8 | range | 6.00 | 5.40 | 1.55 |

### V4 — Depth + mmWave

| ID | Modality | X | Y | Z |
|---|---|---:|---:|---:|
| D1 | optical | 0.60 | 0.60 | 1.60 |
| D2 | optical | 5.00 | 0.60 | 2.60 |
| D3 | optical | 5.00 | 5.40 | 1.90 |
| D4 | optical | 0.60 | 5.40 | 2.40 |
| D5 | optical | 6.00 | 0.60 | 1.60 |
| D6 | optical | 9.40 | 0.60 | 2.60 |
| D7 | optical | 9.40 | 5.40 | 1.90 |
| D8 | optical | 6.00 | 5.40 | 2.40 |
| M1 | radar | 0.35 | 0.35 | 2.10 |
| M2 | radar | 5.10 | 5.60 | 2.50 |
| M3 | radar | 6.00 | 0.35 | 2.10 |
| M4 | radar | 9.65 | 5.60 | 2.50 |

### V5 — Optical / reference

| ID | Modality | X | Y | Z |
|---|---|---:|---:|---:|
| C1 | camera | 0.30 | 0.30 | 2.70 |
| C2 | camera | 5.25 | 0.30 | 2.70 |
| C3 | camera | 0.30 | 5.70 | 2.70 |
| C4 | camera | 5.25 | 5.70 | 2.70 |
| C5 | camera | 0.30 | 2.10 | 1.70 |
| C6 | camera | 5.25 | 4.10 | 1.70 |
| C7 | camera | 2.00 | 0.30 | 0.90 |
| C8 | camera | 3.70 | 5.70 | 0.90 |
| C9 | camera | 5.95 | 0.30 | 2.70 |
| C10 | camera | 9.70 | 0.30 | 2.70 |
| C11 | camera | 5.95 | 5.70 | 2.70 |
| C12 | camera | 9.70 | 5.70 | 2.70 |
| C13 | camera | 5.95 | 4.10 | 1.70 |
| C14 | camera | 9.70 | 2.10 | 1.70 |
| C15 | camera | 7.00 | 5.70 | 0.90 |
| C16 | camera | 8.70 | 0.30 | 0.90 |

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
