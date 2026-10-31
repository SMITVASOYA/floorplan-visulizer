/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { ProceduralTextureGenerator } from './proceduralTextures.ts';

// Shared materials cache to minimize GPU allocations and state changes
class MaterialLibrary {
  private static materials: Map<string, THREE.Material> = new Map();

  public static get(name: string, factory: () => THREE.Material): THREE.Material {
    if (!this.materials.has(name)) {
      this.materials.set(name, factory());
    }
    return this.materials.get(name)!;
  }

  public static woodOak(): THREE.MeshStandardMaterial {
    return this.get('woodOak', () => new THREE.MeshStandardMaterial({
      color: 0x9e7a4a,
      roughness: 0.55,
      metalness: 0.05,
    })) as THREE.MeshStandardMaterial;
  }

  public static woodWalnut(): THREE.MeshStandardMaterial {
    return this.get('woodWalnut', () => new THREE.MeshStandardMaterial({
      color: 0x422d1e,
      roughness: 0.45,
      metalness: 0.05,
    })) as THREE.MeshStandardMaterial;
  }

  public static brass(): THREE.MeshStandardMaterial {
    return this.get('brass', () => new THREE.MeshStandardMaterial({
      color: 0xdfb15b,
      roughness: 0.22,
      metalness: 0.85,
    })) as THREE.MeshStandardMaterial;
  }

  public static darkSteel(): THREE.MeshStandardMaterial {
    return this.get('darkSteel', () => new THREE.MeshStandardMaterial({
      color: 0x1f242c,
      roughness: 0.35,
      metalness: 0.8,
    })) as THREE.MeshStandardMaterial;
  }

  public static fabricWarmBeige(): THREE.MeshStandardMaterial {
    return this.get('fabricWarmBeige', () => new THREE.MeshStandardMaterial({
      color: 0xe3dbd0,
      roughness: 0.88,
      metalness: 0.0,
    })) as THREE.MeshStandardMaterial;
  }

  public static fabricCharcoal(): THREE.MeshStandardMaterial {
    return this.get('fabricCharcoal', () => new THREE.MeshStandardMaterial({
      color: 0x2b303c,
      roughness: 0.82,
      metalness: 0.0,
    })) as THREE.MeshStandardMaterial;
  }

  public static fabricAccentRust(): THREE.MeshStandardMaterial {
    return this.get('fabricAccentRust', () => new THREE.MeshStandardMaterial({
      color: 0xb45309,
      roughness: 0.8,
      metalness: 0.0,
    })) as THREE.MeshStandardMaterial;
  }

  public static marbleWhite(): THREE.MeshStandardMaterial {
    return this.get('marbleWhite', () => new THREE.MeshStandardMaterial({
      color: 0xf5f3ee,
      roughness: 0.18,
      metalness: 0.1,
    })) as THREE.MeshStandardMaterial;
  }

  public static ceramicWhite(): THREE.MeshStandardMaterial {
    return this.get('ceramicWhite', () => new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.12,
      metalness: 0.05,
    })) as THREE.MeshStandardMaterial;
  }

  public static architecturalGlass(): THREE.MeshPhysicalMaterial {
    return this.get('architecturalGlass', () => new THREE.MeshPhysicalMaterial({
      color: 0xc8e2ee,
      transparent: true,
      opacity: 0.45,
      roughness: 0.05,
      metalness: 0.1,
      transmission: 0.7,
      ior: 1.5,
      depthWrite: false,
    })) as THREE.MeshPhysicalMaterial;
  }

  public static contactShadow(): THREE.MeshBasicMaterial {
    return this.get('contactShadow', () => {
      const texture = ProceduralTextureGenerator.getContactShadowTexture();
      return new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.6,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      });
    }) as THREE.MeshBasicMaterial;
  }
}

/**
 * Creates a soft radial contact shadow plane centered at origin flush with floor (Y = 0.01)
 */
function createContactShadow(width: number, depth: number): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(width, depth);
  geo.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geo, MaterialLibrary.contactShadow());
  mesh.position.y = 0.005;
  mesh.renderOrder = 1;
  return mesh;
}

/**
 * Procedural Composite King Bed (8 parts)
 */
export function createCompositeKingBed(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'KingBed';

  const woodMat = MaterialLibrary.woodOak();
  const fabricMat = MaterialLibrary.fabricWarmBeige();
  const accentMat = MaterialLibrary.fabricAccentRust();
  const brassMat = MaterialLibrary.brass();

  // 1. Bed base frame plinth (Primary silhouette)
  const baseGeo = new THREE.BoxGeometry(2.0, 0.22, 2.2);
  const baseMesh = new THREE.Mesh(baseGeo, woodMat);
  baseMesh.position.set(0, 0.11, 0);
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;
  group.add(baseMesh);

  // 2. Thick plush mattress
  const mattressGeo = new THREE.BoxGeometry(1.86, 0.28, 2.06);
  const mattressMesh = new THREE.Mesh(mattressGeo, fabricMat);
  mattressMesh.position.set(0, 0.36, 0.04);
  mattressMesh.castShadow = true;
  group.add(mattressMesh);

  // 3. Tall upholstered headboard with beveled border
  const headboardGeo = new THREE.BoxGeometry(2.2, 0.95, 0.12);
  const headboardMesh = new THREE.Mesh(headboardGeo, woodMat);
  headboardMesh.position.set(0, 0.58, -1.02);
  headboardMesh.castShadow = true;
  group.add(headboardMesh);

  // Headboard fabric insert
  const insertGeo = new THREE.BoxGeometry(2.0, 0.8, 0.04);
  const insertMesh = new THREE.Mesh(insertGeo, fabricMat);
  insertMesh.position.set(0, 0.58, -0.95);
  group.add(insertMesh);

  // 4. Pillows (2 back pillows, 2 front accent pillows)
  const pillowGeo = new THREE.BoxGeometry(0.55, 0.14, 0.35);
  const p1 = new THREE.Mesh(pillowGeo, fabricMat);
  p1.position.set(-0.46, 0.55, -0.72);
  p1.rotation.x = 0.18;
  const p2 = new THREE.Mesh(pillowGeo, fabricMat);
  p2.position.set(0.46, 0.55, -0.72);
  p2.rotation.x = 0.18;
  group.add(p1, p2);

  const accPillowGeo = new THREE.BoxGeometry(0.42, 0.12, 0.28);
  const ap1 = new THREE.Mesh(accPillowGeo, accentMat);
  ap1.position.set(-0.35, 0.58, -0.52);
  ap1.rotation.x = 0.22;
  const ap2 = new THREE.Mesh(accPillowGeo, accentMat);
  ap2.position.set(0.35, 0.58, -0.52);
  ap2.rotation.x = 0.22;
  group.add(ap1, ap2);

  // 5. Folded duvet runner at foot
  const runnerGeo = new THREE.BoxGeometry(1.88, 0.05, 0.7);
  const runnerMesh = new THREE.Mesh(runnerGeo, accentMat);
  runnerMesh.position.set(0, 0.52, 0.65);
  group.add(runnerMesh);

  // 6. Dual Nightstands with brass handles
  const standGeo = new THREE.BoxGeometry(0.45, 0.38, 0.4);
  const sLeft = new THREE.Mesh(standGeo, woodMat);
  sLeft.position.set(-1.3, 0.19, -0.85);
  sLeft.castShadow = true;

  const sRight = new THREE.Mesh(standGeo, woodMat);
  sRight.position.set(1.3, 0.19, -0.85);
  sRight.castShadow = true;
  group.add(sLeft, sRight);

  // 7. Minimalist brass bedside lamps with frosted glow shades
  const stemGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.32, 12);
  const shadeGeo = new THREE.ConeGeometry(0.12, 0.16, 16, 1, true);

  const lampLeft = new THREE.Group();
  lampLeft.position.set(-1.3, 0.38, -0.85);
  const stemL = new THREE.Mesh(stemGeo, brassMat);
  stemL.position.y = 0.16;
  const shadeL = new THREE.Mesh(shadeGeo, MaterialLibrary.ceramicWhite());
  shadeL.position.y = 0.34;
  lampLeft.add(stemL, shadeL);

  const lampRight = new THREE.Group();
  lampRight.position.set(1.3, 0.38, -0.85);
  const stemR = new THREE.Mesh(stemGeo, brassMat);
  stemR.position.y = 0.16;
  const shadeR = new THREE.Mesh(shadeGeo, MaterialLibrary.ceramicWhite());
  shadeR.position.y = 0.34;
  lampRight.add(stemR, shadeR);
  group.add(lampLeft, lampRight);

  // 8. Soft contact shadow grounding
  group.add(createContactShadow(3.2, 2.7));

  return group;
}

/**
 * Procedural Composite Sectional Sofa (7 parts)
 */
export function createCompositeSectionalSofa(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'SectionalSofa';

  const charcoalMat = MaterialLibrary.fabricCharcoal();
  const accentMat = MaterialLibrary.fabricAccentRust();
  const steelMat = MaterialLibrary.darkSteel();

  // 1. Main 3-seater base
  const mainBaseGeo = new THREE.BoxGeometry(2.4, 0.24, 0.95);
  const mainBase = new THREE.Mesh(mainBaseGeo, charcoalMat);
  mainBase.position.set(0, 0.2, 0);
  mainBase.castShadow = true;
  group.add(mainBase);

  // 2. Chaise lounge extension
  const chaiseGeo = new THREE.BoxGeometry(0.9, 0.24, 1.1);
  const chaise = new THREE.Mesh(chaiseGeo, charcoalMat);
  chaise.position.set(0.75, 0.2, 0.95);
  chaise.castShadow = true;
  group.add(chaise);

  // 3. Backrest cushions
  const backGeo = new THREE.BoxGeometry(2.4, 0.5, 0.22);
  const backrest = new THREE.Mesh(backGeo, charcoalMat);
  backrest.position.set(0, 0.52, -0.37);
  backrest.castShadow = true;
  group.add(backrest);

  // 4. Chaise side backrest
  const chaiseBackGeo = new THREE.BoxGeometry(0.22, 0.5, 1.1);
  const chaiseBack = new THREE.Mesh(chaiseBackGeo, charcoalMat);
  chaiseBack.position.set(1.09, 0.52, 0.95);
  chaiseBack.castShadow = true;
  group.add(chaiseBack);

  // 5. Left Armrest
  const armGeo = new THREE.BoxGeometry(0.24, 0.36, 0.95);
  const arm = new THREE.Mesh(armGeo, charcoalMat);
  arm.position.set(-1.18, 0.42, 0);
  arm.castShadow = true;
  group.add(arm);

  // 6. Accent throw pillows
  const pGeo = new THREE.BoxGeometry(0.36, 0.36, 0.12);
  const p1 = new THREE.Mesh(pGeo, accentMat);
  p1.position.set(-0.85, 0.46, -0.22);
  p1.rotation.y = 0.25;
  const p2 = new THREE.Mesh(pGeo, accentMat);
  p2.position.set(0.65, 0.46, 0.6);
  p2.rotation.y = -0.35;
  group.add(p1, p2);

  // 7. Metal tubular feet
  const legGeo = new THREE.CylinderGeometry(0.025, 0.02, 0.1, 8);
  const legCoords = [
    [-1.1, 0.05, -0.4],
    [-1.1, 0.05, 0.4],
    [0.2, 0.05, -0.4],
    [0.2, 0.05, 1.4],
    [1.1, 0.05, 1.4],
    [1.1, 0.05, -0.4],
  ];
  legCoords.forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(legGeo, steelMat);
    leg.position.set(x, y, z);
    group.add(leg);
  });

  // Contact shadow
  group.add(createContactShadow(2.8, 2.4));

  return group;
}

/**
 * Procedural Dining Set with 4 Chairs & Table (9 parts)
 */
export function createCompositeDiningSet(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'DiningSet';

  const woodMat = MaterialLibrary.woodWalnut();
  const steelMat = MaterialLibrary.darkSteel();
  const fabricMat = MaterialLibrary.fabricWarmBeige();
  const brassMat = MaterialLibrary.brass();

  // 1. Table Top with beveled chamfer
  const topGeo = new THREE.BoxGeometry(1.6, 0.05, 0.9);
  const tableTop = new THREE.Mesh(topGeo, woodMat);
  tableTop.position.set(0, 0.74, 0);
  tableTop.castShadow = true;
  group.add(tableTop);

  // 2. Table Legs (4 tapered steel legs)
  const legGeo = new THREE.CylinderGeometry(0.025, 0.015, 0.72, 8);
  const tableLegPositions = [
    [-0.7, 0.36, -0.35],
    [0.7, 0.36, -0.35],
    [-0.7, 0.36, 0.35],
    [0.7, 0.36, 0.35],
  ];
  tableLegPositions.forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(legGeo, steelMat);
    leg.position.set(x, y, z);
    leg.rotation.z = x > 0 ? -0.06 : 0.06;
    leg.castShadow = true;
    group.add(leg);
  });

  // 3. Centerpiece modern brass tray
  const bowlGeo = new THREE.CylinderGeometry(0.12, 0.06, 0.04, 16);
  const bowl = new THREE.Mesh(bowlGeo, brassMat);
  bowl.position.set(0, 0.78, 0);
  group.add(bowl);

  // 4. 4 Modern Chairs
  const chairPositions: { pos: [number, number, number]; rotY: number }[] = [
    { pos: [0, 0, -0.65], rotY: 0 },
    { pos: [0, 0, 0.65], rotY: Math.PI },
    { pos: [-0.95, 0, 0], rotY: Math.PI / 2 },
    { pos: [0.95, 0, 0], rotY: -Math.PI / 2 },
  ];

  const seatGeo = new THREE.BoxGeometry(0.44, 0.04, 0.42);
  const chairBackGeo = new THREE.BoxGeometry(0.44, 0.38, 0.03);
  const chairLegGeo = new THREE.CylinderGeometry(0.015, 0.01, 0.44, 8);

  chairPositions.forEach(({ pos, rotY }) => {
    const chair = new THREE.Group();
    chair.position.set(...pos);
    chair.rotation.y = rotY;

    // Cushion
    const seat = new THREE.Mesh(seatGeo, fabricMat);
    seat.position.set(0, 0.45, 0);
    seat.castShadow = true;

    // Back
    const back = new THREE.Mesh(chairBackGeo, fabricMat);
    back.position.set(0, 0.65, -0.19);
    back.castShadow = true;

    // 4 legs
    [
      [-0.18, 0.22, -0.16],
      [0.18, 0.22, -0.16],
      [-0.18, 0.22, 0.16],
      [0.18, 0.22, 0.16],
    ].forEach(([cx, cy, cz]) => {
      const cl = new THREE.Mesh(chairLegGeo, steelMat);
      cl.position.set(cx, cy, cz);
      chair.add(cl);
    });

    chair.add(seat, back);
    group.add(chair);
  });

  group.add(createContactShadow(2.4, 2.0));
  return group;
}

/**
 * Procedural Gourmet Kitchen Island Counter (7 parts)
 */
export function createCompositeKitchenIsland(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'KitchenIsland';

  const woodMat = MaterialLibrary.woodWalnut();
  const marbleMat = MaterialLibrary.marbleWhite();
  const brassMat = MaterialLibrary.brass();
  const steelMat = MaterialLibrary.darkSteel();

  // 1. Base cabinetry
  const baseGeo = new THREE.BoxGeometry(2.4, 0.85, 0.9);
  const base = new THREE.Mesh(baseGeo, woodMat);
  base.position.set(0, 0.425, 0);
  base.castShadow = true;
  group.add(base);

  // 2. Waterfall marble countertop
  const topGeo = new THREE.BoxGeometry(2.5, 0.06, 0.95);
  const top = new THREE.Mesh(topGeo, marbleMat);
  top.position.set(0, 0.88, 0);
  top.castShadow = true;
  group.add(top);

  // 3. Recessed undermount stainless sink
  const sinkGeo = new THREE.BoxGeometry(0.55, 0.01, 0.4);
  const sink = new THREE.Mesh(sinkGeo, steelMat);
  sink.position.set(-0.55, 0.912, 0);
  group.add(sink);

  // 4. Gooseneck brass faucet
  const faucetTubeGeo = new THREE.TorusGeometry(0.08, 0.015, 8, 16, Math.PI);
  const faucet = new THREE.Mesh(faucetTubeGeo, brassMat);
  faucet.position.set(-0.55, 1.05, -0.15);
  faucet.rotation.z = Math.PI / 2;
  const faucetStemGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.14, 8);
  const faucetStem = new THREE.Mesh(faucetStemGeo, brassMat);
  faucetStem.position.set(-0.55, 0.98, -0.15);
  group.add(faucet, faucetStem);

  // 5. Dual modern barstools at overhang
  const stoolPositions = [0.4, -0.4];
  const stoolSeatGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.05, 16);
  const stoolLegGeo = new THREE.CylinderGeometry(0.015, 0.01, 0.62, 8);

  stoolPositions.forEach((x) => {
    const stool = new THREE.Group();
    stool.position.set(x, 0, 0.65);

    const seat = new THREE.Mesh(stoolSeatGeo, MaterialLibrary.fabricCharcoal());
    seat.position.y = 0.62;
    seat.castShadow = true;

    [
      [-0.12, 0.31, -0.12],
      [0.12, 0.31, -0.12],
      [-0.12, 0.31, 0.12],
      [0.12, 0.31, 0.12],
    ].forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(stoolLegGeo, steelMat);
      leg.position.set(lx, ly, lz);
      stool.add(leg);
    });

    stool.add(seat);
    group.add(stool);
  });

  group.add(createContactShadow(2.9, 1.8));
  return group;
}

/**
 * Procedural Bathroom Vanity with Mirror (6 parts)
 */
export function createCompositeBathroomVanity(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'BathroomVanity';

  const woodMat = MaterialLibrary.woodOak();
  const ceramicMat = MaterialLibrary.ceramicWhite();
  const brassMat = MaterialLibrary.brass();

  // 1. Floating vanity base
  const vanityGeo = new THREE.BoxGeometry(1.2, 0.45, 0.55);
  const vanity = new THREE.Mesh(vanityGeo, woodMat);
  vanity.position.set(0, 0.55, 0);
  vanity.castShadow = true;
  group.add(vanity);

  // 2. Ceramic vessel basin
  const basinGeo = new THREE.CylinderGeometry(0.24, 0.18, 0.14, 20);
  const basin = new THREE.Mesh(basinGeo, ceramicMat);
  basin.position.set(0, 0.84, 0.04);
  basin.castShadow = true;
  group.add(basin);

  // 3. Tall brass faucet
  const tapGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.22, 12);
  const tap = new THREE.Mesh(tapGeo, brassMat);
  tap.position.set(0, 0.95, -0.15);
  group.add(tap);

  // 4. Backlit arched/pill mirror
  const mirrorGeo = new THREE.BoxGeometry(0.75, 1.1, 0.03);
  const mirrorMat = new THREE.MeshStandardMaterial({
    color: 0xe0e6ed,
    roughness: 0.08,
    metalness: 0.9,
  });
  const mirror = new THREE.Mesh(mirrorGeo, mirrorMat);
  mirror.position.set(0, 1.6, -0.22);
  group.add(mirror);

  group.add(createContactShadow(1.5, 0.8));
  return group;
}

/**
 * Procedural Architectural Door Assembly (Beveled Jamb + Panel + Brass Lever)
 */
export function createArchitecturalDoor(width: number, height: number): THREE.Group {
  const group = new THREE.Group();
  group.name = 'DoorAssembly';

  const woodMat = MaterialLibrary.woodOak();
  const brassMat = MaterialLibrary.brass();
  const jambMat = MaterialLibrary.darkSteel();

  // 1. Door Frame Jamb (Extruded channel feel)
  const jambThick = 0.05;
  const jambLeftGeo = new THREE.BoxGeometry(jambThick, height, 0.18);
  const jambLeft = new THREE.Mesh(jambLeftGeo, jambMat);
  jambLeft.position.set(-width / 2 + jambThick / 2, height / 2, 0);

  const jambRightGeo = new THREE.BoxGeometry(jambThick, height, 0.18);
  const jambRight = new THREE.Mesh(jambRightGeo, jambMat);
  jambRight.position.set(width / 2 - jambThick / 2, height / 2, 0);

  const jambTopGeo = new THREE.BoxGeometry(width, jambThick, 0.18);
  const jambTop = new THREE.Mesh(jambTopGeo, jambMat);
  jambTop.position.set(0, height - jambThick / 2, 0);

  group.add(jambLeft, jambRight, jambTop);

  // 2. Main Door Leaf (slightly ajar at 40 degrees for spatial depth)
  const leafWidth = width - 0.08;
  const leafHeight = height - 0.06;
  const leafGeo = new THREE.BoxGeometry(leafWidth, leafHeight, 0.04);
  const leaf = new THREE.Mesh(leafGeo, woodMat);
  leaf.castShadow = true;

  // Pivot door on left hinge
  const doorHinge = new THREE.Group();
  doorHinge.position.set(-width / 2 + 0.05, 0, 0);
  leaf.position.set(leafWidth / 2, leafHeight / 2, 0);
  doorHinge.rotation.y = 0.55; // 32 degrees open
  doorHinge.add(leaf);

  // Brass handle
  const handleStemGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.06, 8);
  const handleStem = new THREE.Mesh(handleStemGeo, brassMat);
  handleStem.rotation.x = Math.PI / 2;
  handleStem.position.set(leafWidth - 0.08, 0.95, 0.03);

  const handleBarGeo = new THREE.BoxGeometry(0.12, 0.02, 0.02);
  const handleBar = new THREE.Mesh(handleBarGeo, brassMat);
  handleBar.position.set(leafWidth - 0.12, 0.95, 0.06);

  doorHinge.add(handleStem, handleBar);
  group.add(doorHinge);

  return group;
}

/**
 * Procedural Architectural Window Assembly (Frame + Mullions + Architectural Tint Glass)
 */
export function createArchitecturalWindow(width: number, height: number): THREE.Group {
  const group = new THREE.Group();
  group.name = 'WindowAssembly';

  const frameMat = MaterialLibrary.darkSteel();
  const glassMat = MaterialLibrary.architecturalGlass();

  // Outer frame
  const frameThick = 0.04;
  const frameDepth = 0.16;

  // Left & right frame
  const sideGeo = new THREE.BoxGeometry(frameThick, height, frameDepth);
  const left = new THREE.Mesh(sideGeo, frameMat);
  left.position.set(-width / 2 + frameThick / 2, height / 2, 0);
  const right = new THREE.Mesh(sideGeo, frameMat);
  right.position.set(width / 2 - frameThick / 2, height / 2, 0);

  // Top & bottom frame
  const topGeo = new THREE.BoxGeometry(width, frameThick, frameDepth);
  const top = new THREE.Mesh(topGeo, frameMat);
  top.position.set(0, height - frameThick / 2, 0);
  const bottom = new THREE.Mesh(topGeo, frameMat);
  bottom.position.set(0, frameThick / 2, 0);

  // Center vertical mullion
  const mullionGeo = new THREE.BoxGeometry(frameThick * 0.8, height, frameDepth * 0.7);
  const mullion = new THREE.Mesh(mullionGeo, frameMat);
  mullion.position.set(0, height / 2, 0);

  // Glass pane
  const glassGeo = new THREE.PlaneGeometry(width - frameThick * 2, height - frameThick * 2);
  const glass = new THREE.Mesh(glassGeo, glassMat);
  glass.position.set(0, height / 2, 0);
  glass.renderOrder = 2;

  group.add(left, right, top, bottom, mullion, glass);
  return group;
}

/**
 * Procedural Balcony Glass Railing Assembly
 */
export function createBalconyRailing(length: number, height: number = 1.05): THREE.Group {
  const group = new THREE.Group();
  group.name = 'BalconyRailing';

  const metalMat = MaterialLibrary.darkSteel();
  const glassMat = MaterialLibrary.architecturalGlass();

  // Top handrail
  const railGeo = new THREE.BoxGeometry(length, 0.04, 0.06);
  const handrail = new THREE.Mesh(railGeo, metalMat);
  handrail.position.set(0, height, 0);
  group.add(handrail);

  // Glass balustrade panel
  const panelGeo = new THREE.PlaneGeometry(length - 0.04, height - 0.1);
  const glassPanel = new THREE.Mesh(panelGeo, glassMat);
  glassPanel.position.set(0, height / 2, 0);
  glassPanel.renderOrder = 2;
  group.add(glassPanel);

  // Support posts every 1.2m
  const postsCount = Math.max(2, Math.ceil(length / 1.2));
  const postGeo = new THREE.BoxGeometry(0.03, height, 0.03);
  const step = length / (postsCount - 1);
  for (let i = 0; i < postsCount; i++) {
    const post = new THREE.Mesh(postGeo, metalMat);
    post.position.set(-length / 2 + i * step, height / 2, 0);
    group.add(post);
  }

  return group;
}

/**
 * Procedural Potted Plant (Foliage layers + ceramic pot + wood tripod)
 */
export function createPottedPlant(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'PottedPlant';

  const potMat = MaterialLibrary.ceramicWhite();
  const woodMat = MaterialLibrary.woodOak();
  const leafMat = new THREE.MeshStandardMaterial({
    color: 0x2e6f40,
    roughness: 0.6,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });

  // Cylindrical pot
  const potGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.35, 16);
  const pot = new THREE.Mesh(potGeo, potMat);
  pot.position.y = 0.32;
  pot.castShadow = true;
  group.add(pot);

  // Tripod wooden legs
  const legGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.28, 8);
  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3;
    const leg = new THREE.Mesh(legGeo, woodMat);
    leg.position.set(Math.cos(angle) * 0.16, 0.14, Math.sin(angle) * 0.16);
    leg.rotation.z = Math.cos(angle) * 0.1;
    leg.rotation.x = -Math.sin(angle) * 0.1;
    group.add(leg);
  }

  // Foliage leaves (6 fan leaves)
  const leafGeo = new THREE.PlaneGeometry(0.18, 0.45);
  for (let l = 0; l < 7; l++) {
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    const rotY = (l * Math.PI * 2) / 7;
    leaf.position.set(0, 0.5, 0);
    leaf.rotation.y = rotY;
    leaf.rotation.x = 0.45 + (l % 2) * 0.2;
    leaf.castShadow = true;
    group.add(leaf);
  }

  group.add(createContactShadow(0.6, 0.6));
  return group;
}
