/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  BuildingBrochure,
  BuildingWing,
  CameraPreset,
  FloorPlan,
  LightingPreset,
  MaterialFinish,
  RoomDefinition,
} from '../types/architectural.ts';
import {
  createArchitecturalDoor,
  createArchitecturalWindow,
  createBalconyRailing,
  createCompositeBathroomVanity,
  createCompositeDiningSet,
  createCompositeKingBed,
  createCompositeKitchenIsland,
  createCompositeSectionalSofa,
  createPottedPlant,
} from './proceduralModels.ts';
import { ProceduralTextureGenerator } from './proceduralTextures.ts';

// Pre-allocated scratch objects to prevent garbage collection inside requestAnimationFrame
const _vec3 = new THREE.Vector3();
const _targetVec = new THREE.Vector3();
const _raycaster = new THREE.Raycaster();
const _pointer = new THREE.Vector2();

export class SpatialSceneManager {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;

  // Lighting
  private keyLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;
  private sunSphere: THREE.Mesh;

  // Scene root groups
  private floorPlanGroup: THREE.Group;
  private buildingGroup: THREE.Group;
  private furnitureGroup: THREE.Group;
  private wallsGroup: THREE.Group;
  private floorsGroup: THREE.Group;
  private labelsGroup: THREE.Group;

  // Active state
  private mode: 'floorplan' | 'building' = 'floorplan';
  private currentFloorPlan: FloorPlan | null = null;
  private currentBrochure: BuildingBrochure | null = null;
  private currentFinish: MaterialFinish = 'hardwood_oak';
  private currentLighting: LightingPreset = 'noon';
  private wallHeightFactor: number = 1.0; // 0.2 to 1.0
  private explodedFloorFactor: number = 0.0; // 0 to 1
  private selectedRoomId: string | null = null;
  private selectedWingId: string | null = null;
  private selectedFloorLevel: number = 4;

  // Camera animation
  private targetCameraPos: THREE.Vector3 = new THREE.Vector3(12, 14, 15);
  private targetLookAt: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private isAnimatingCamera: boolean = false;

  private frameId: number = 0;
  private isDisposed: boolean = false;
  private isSoftwareGl: boolean = false;

  // Callbacks
  public onRoomSelected?: (room: RoomDefinition | null) => void;
  public onWingSelected?: (wing: BuildingWing | null) => void;

  constructor(container: HTMLElement) {
    this.container = container;

    // Software WebGL detection per Three.js guidelines
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0b0e14);
    this.scene.fog = new THREE.FogExp2(0x0b0e14, 0.015);

    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 500);
    this.camera.position.set(12, 14, 15);

    // OrbitControls with exponential damping
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = !this.isSoftwareGl;
    this.controls.dampingFactor = 0.06;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.02; // prevent going below ground
    this.controls.minDistance = 3;
    this.controls.maxDistance = 120;
    this.controls.target.set(0, 0, 0);

    // Studio Environment map using PMREMGenerator & RoomEnvironment
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = envTexture;
    pmremGenerator.dispose();

    // Lighting Rig
    this.hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 0.85);
    this.scene.add(this.hemiLight);

    this.keyLight = new THREE.DirectionalLight(0xfff7ed, 1.8);
    this.keyLight.position.set(20, 32, 18);
    this.keyLight.castShadow = !this.isSoftwareGl;
    this.keyLight.shadow.mapSize.width = 2048;
    this.keyLight.shadow.mapSize.height = 2048;
    this.keyLight.shadow.camera.near = 1;
    this.keyLight.shadow.camera.far = 100;
    const shadowD = 24;
    this.keyLight.shadow.camera.left = -shadowD;
    this.keyLight.shadow.camera.right = shadowD;
    this.keyLight.shadow.camera.top = shadowD;
    this.keyLight.shadow.camera.bottom = -shadowD;
    this.keyLight.shadow.bias = -0.0004;
    this.keyLight.shadow.normalBias = 0.02;
    this.scene.add(this.keyLight);

    // Sun sphere visual indicator in the sky
    const sunGeo = new THREE.SphereGeometry(1.2, 16, 16);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffedd5 });
    this.sunSphere = new THREE.Mesh(sunGeo, sunMat);
    this.sunSphere.position.copy(this.keyLight.position);
    this.scene.add(this.sunSphere);

    // Ground grid and shadow catcher
    const groundGeo = new THREE.PlaneGeometry(160, 160);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0f141d,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.02;
    ground.receiveShadow = !this.isSoftwareGl;
    this.scene.add(ground);

    // Architectural drafting grid overlay
    const gridHelper = new THREE.GridHelper(80, 80, 0x334155, 0x1e293b);
    gridHelper.position.y = -0.01;
    this.scene.add(gridHelper);

    // Initialize root scene groups
    this.floorPlanGroup = new THREE.Group();
    this.buildingGroup = new THREE.Group();
    this.furnitureGroup = new THREE.Group();
    this.wallsGroup = new THREE.Group();
    this.floorsGroup = new THREE.Group();
    this.labelsGroup = new THREE.Group();

    this.floorPlanGroup.add(this.floorsGroup, this.wallsGroup, this.furnitureGroup, this.labelsGroup);
    this.scene.add(this.floorPlanGroup, this.buildingGroup);

    // Event listeners
    window.addEventListener('resize', this.onResize);
    this.renderer.domElement.addEventListener('pointerup', this.onPointerUp);

    // Start render loop
    this.animate();
  }

  private onResize = () => {
    if (!this.container || this.isDisposed) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private onPointerUp = (event: MouseEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    _pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    _pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    _raycaster.setFromCamera(_pointer, this.camera);

    if (this.mode === 'floorplan') {
      const intersects = _raycaster.intersectObjects(this.floorsGroup.children, true);
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const roomId = hit.userData?.roomId;
        if (roomId && this.currentFloorPlan) {
          const room = this.currentFloorPlan.rooms.find((r) => r.id === roomId) || null;
          this.selectRoom(room);
          return;
        }
      }
      this.selectRoom(null);
    } else {
      // Building mode raycasting
      const intersects = _raycaster.intersectObjects(this.buildingGroup.children, true);
      if (intersects.length > 0) {
        let curr: THREE.Object3D | null = intersects[0].object;
        while (curr && curr !== this.buildingGroup) {
          if (curr.userData?.wingId && this.currentBrochure) {
            const wingId = curr.userData.wingId;
            const wing = this.currentBrochure.wings.find((w) => w.id === wingId) || null;
            this.selectWing(wing);
            return;
          }
          curr = curr.parent;
        }
      }
      this.selectWing(null);
    }
  };

  public selectRoom(room: RoomDefinition | null) {
    this.selectedRoomId = room ? room.id : null;
    this.onRoomSelected?.(room);

    // Update highlight visual
    this.floorsGroup.children.forEach((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.userData?.roomId === this.selectedRoomId) {
        (mesh.material as THREE.MeshStandardMaterial).emissive = new THREE.Color(0xd97706);
        (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.35;
      } else {
        (mesh.material as THREE.MeshStandardMaterial).emissive = new THREE.Color(0x000000);
        (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
      }
    });

    if (room) {
      // Smoothly zoom camera to room center
      const center = this.calculatePolygonCenter(room.polygon);
      this.smoothFlyTo(new THREE.Vector3(center.x + 3.5, 6, center.z + 4.5), new THREE.Vector3(center.x, 0.8, center.z));
    }
  }

  public selectWing(wing: BuildingWing | null) {
    this.selectedWingId = wing ? wing.id : null;
    this.onWingSelected?.(wing);

    this.buildingGroup.children.forEach((child) => {
      const isSelected = child.userData?.wingId === this.selectedWingId;
      child.traverse((node) => {
        if ((node as THREE.Mesh).isMesh) {
          const m = node as THREE.Mesh;
          if (m.material && (m.material as THREE.MeshStandardMaterial).emissive) {
            (m.material as THREE.MeshStandardMaterial).emissive = isSelected ? new THREE.Color(0xd97706) : new THREE.Color(0x000000);
            (m.material as THREE.MeshStandardMaterial).emissiveIntensity = isSelected ? 0.3 : 0;
          }
        }
      });
    });

    if (wing) {
      this.smoothFlyTo(
        new THREE.Vector3(wing.footprintOffset.x * 1.5, 24, wing.footprintOffset.z * 1.5 + 20),
        new THREE.Vector3(wing.footprintOffset.x, wing.elevationMeters / 2, wing.footprintOffset.z)
      );
    }
  }

  /**
   * Sets active visualization mode
   */
  public setMode(mode: 'floorplan' | 'building') {
    this.mode = mode;
    this.floorPlanGroup.visible = mode === 'floorplan';
    this.buildingGroup.visible = mode === 'building';

    if (mode === 'floorplan') {
      this.setCameraPreset('isometric');
    } else {
      this.smoothFlyTo(new THREE.Vector3(26, 32, 34), new THREE.Vector3(0, 15, 0));
    }
  }

  /**
   * Loads and generates a 3D floor plan layout
   */
  public loadFloorPlan(plan: FloorPlan, finish: MaterialFinish = this.currentFinish) {
    this.currentFloorPlan = plan;
    this.currentFinish = finish;

    // Clear previous geometries
    this.clearGroup(this.floorsGroup);
    this.clearGroup(this.wallsGroup);
    this.clearGroup(this.furnitureGroup);
    this.clearGroup(this.labelsGroup);

    // 1. Generate Floor Slabs with chosen PBR texture
    plan.rooms.forEach((room) => {
      const shape = new THREE.Shape();
      room.polygon.forEach((pt, idx) => {
        if (idx === 0) shape.moveTo(pt.x, -pt.z);
        else shape.lineTo(pt.x, -pt.z);
      });

      const extrudeSettings: THREE.ExtrudeGeometryOptions = {
        depth: 0.1,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 1,
        bevelSize: 0.02,
        bevelThickness: 0.02,
      };

      const floorGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      floorGeo.rotateX(Math.PI / 2);

      let texture: THREE.CanvasTexture;
      switch (finish) {
        case 'marble_tile':
          texture = ProceduralTextureGenerator.getMarbleTileTexture();
          break;
        case 'polished_concrete':
          texture = ProceduralTextureGenerator.getPolishedConcreteTexture();
          break;
        case 'nordic_birch':
          texture = ProceduralTextureGenerator.getNordicBirchTexture();
          break;
        case 'hardwood_oak':
        default:
          texture = ProceduralTextureGenerator.getHardwoodOakTexture();
          break;
      }

      const floorMat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: finish === 'marble_tile' ? 0.2 : 0.6,
        metalness: 0.05,
      });

      const floorMesh = new THREE.Mesh(floorGeo, floorMat);
      floorMesh.position.y = 0.05;
      floorMesh.receiveShadow = !this.isSoftwareGl;
      floorMesh.userData = { roomId: room.id, roomName: room.name };
      this.floorsGroup.add(floorMesh);

      // Spawn composite procedural furniture
      room.furniture.forEach((slot) => {
        const item = this.createFurnitureItem(slot.type);
        if (item) {
          item.position.set(slot.position.x, 0.05, slot.position.z);
          item.rotation.y = slot.rotationY;
          if (slot.scale) item.scale.setScalar(slot.scale);
          this.furnitureGroup.add(item);
        }
      });
    });

    // 2. Generate Walls with Cutaways and Openings
    this.rebuildWalls();

    // Reset camera to center of plan
    const bounds = this.calculatePlanBounds(plan);
    this.controls.target.set(bounds.centerX, 0, bounds.centerZ);
    this.setCameraPreset('isometric');
  }

  /**
   * Rebuilds wall geometries dynamically based on wallHeightFactor
   */
  public rebuildWalls() {
    if (!this.currentFloorPlan) return;
    this.clearGroup(this.wallsGroup);

    const baseWallMat = new THREE.MeshStandardMaterial({
      color: 0xded8cc, // Warm architectural sandstone
      roughness: 0.85,
      metalness: 0.02,
    });

    const exteriorWallMat = new THREE.MeshStandardMaterial({
      color: 0x1f2733, // High-contrast architectural graphite exterior
      roughness: 0.75,
      metalness: 0.1,
    });

    const currentHeight = Math.max(0.4, 2.8 * this.wallHeightFactor);

    this.currentFloorPlan.walls.forEach((wall) => {
      const dx = wall.end.x - wall.start.x;
      const dz = wall.end.z - wall.start.z;
      const length = Math.sqrt(dx * dx + dz * dz);
      const angle = Math.atan2(dz, dx);
      const thickness = wall.thickness || (wall.isExterior ? 0.22 : 0.14);

      if (!wall.openings || wall.openings.length === 0) {
        // Solid wall segment
        const wallGeo = new THREE.BoxGeometry(length, currentHeight, thickness);
        const wallMesh = new THREE.Mesh(wallGeo, wall.isExterior ? exteriorWallMat : baseWallMat);
        wallMesh.position.set(
          (wall.start.x + wall.end.x) / 2,
          currentHeight / 2 + 0.05,
          (wall.start.z + wall.end.z) / 2
        );
        wallMesh.rotation.y = -angle;
        wallMesh.castShadow = !this.isSoftwareGl;
        wallMesh.receiveShadow = !this.isSoftwareGl;
        this.wallsGroup.add(wallMesh);
      } else {
        // Wall with door or window openings
        const wallGroup = new THREE.Group();
        wallGroup.position.set(wall.start.x, 0.05, wall.start.z);
        wallGroup.rotation.y = -angle;

        let currentOffset = 0;
        wall.openings.forEach((opening) => {
          // Left solid section before opening
          const segLen = opening.offset - currentOffset;
          if (segLen > 0.05) {
            const segGeo = new THREE.BoxGeometry(segLen, currentHeight, thickness);
            const segMesh = new THREE.Mesh(segGeo, wall.isExterior ? exteriorWallMat : baseWallMat);
            segMesh.position.set(currentOffset + segLen / 2, currentHeight / 2, 0);
            segMesh.castShadow = true;
            wallGroup.add(segMesh);
          }

          // Header lintel above opening (if wall height exceeds opening)
          const lintelHeight = currentHeight - opening.height;
          if (lintelHeight > 0.1) {
            const lintelGeo = new THREE.BoxGeometry(opening.width, lintelHeight, thickness);
            const lintelMesh = new THREE.Mesh(lintelGeo, wall.isExterior ? exteriorWallMat : baseWallMat);
            lintelMesh.position.set(opening.offset + opening.width / 2, opening.height + lintelHeight / 2, 0);
            wallGroup.add(lintelMesh);
          }

          // Sub-wall beneath window
          if (opening.type === 'window' && opening.elevation && opening.elevation > 0) {
            const sillHeight = Math.min(opening.elevation, currentHeight);
            const sillGeo = new THREE.BoxGeometry(opening.width, sillHeight, thickness);
            const sillMesh = new THREE.Mesh(sillGeo, wall.isExterior ? exteriorWallMat : baseWallMat);
            sillMesh.position.set(opening.offset + opening.width / 2, sillHeight / 2, 0);
            wallGroup.add(sillMesh);

            // Add architectural window assembly if wall height allows
            if (this.wallHeightFactor > 0.6) {
              const win = createArchitecturalWindow(opening.width, Math.min(opening.height, currentHeight - sillHeight));
              win.position.set(opening.offset + opening.width / 2, sillHeight, 0);
              wallGroup.add(win);
            }
          } else if (opening.type === 'door' && this.wallHeightFactor > 0.6) {
            // Add architectural door assembly
            const door = createArchitecturalDoor(opening.width, Math.min(opening.height, currentHeight));
            door.position.set(opening.offset + opening.width / 2, 0, 0);
            wallGroup.add(door);
          }

          currentOffset = opening.offset + opening.width;
        });

        // Remaining wall section after last opening
        const lastSegLen = length - currentOffset;
        if (lastSegLen > 0.05) {
          const lastGeo = new THREE.BoxGeometry(lastSegLen, currentHeight, thickness);
          const lastMesh = new THREE.Mesh(lastGeo, wall.isExterior ? exteriorWallMat : baseWallMat);
          lastMesh.position.set(currentOffset + lastSegLen / 2, currentHeight / 2, 0);
          lastMesh.castShadow = true;
          wallGroup.add(lastMesh);
        }

        this.wallsGroup.add(wallGroup);
      }
    });

    // Add balcony glass railing if plan has balcony
    this.currentFloorPlan.rooms
      .filter((r) => r.type === 'balcony')
      .forEach((b) => {
        const center = this.calculatePolygonCenter(b.polygon);
        const railing = createBalconyRailing(5.2, 1.05);
        railing.position.set(center.x, 0.05, center.z - 0.7);
        this.wallsGroup.add(railing);
      });
  }

  /**
   * Loads and builds the 3D multi-wing building brochure model
   */
  public loadBuildingBrochure(brochure: BuildingBrochure) {
    this.currentBrochure = brochure;
    this.clearGroup(this.buildingGroup);

    const facadeTexture = ProceduralTextureGenerator.getBuildingFacadeTexture();
    const concreteMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.6,
      metalness: 0.1,
    });

    const towerMat = new THREE.MeshStandardMaterial({
      map: facadeTexture,
      roughness: 0.35,
      metalness: 0.25,
    });

    const brassAccentMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.25,
      metalness: 0.8,
    });

    brochure.wings.forEach((wing) => {
      const wingGroup = new THREE.Group();
      wingGroup.userData = { wingId: wing.id, wingName: wing.name };

      const floorHeight = 3.3;
      const totalH = wing.floorsCount * floorHeight;

      // Base entrance podium / lobby
      const lobbyGeo = new THREE.BoxGeometry(wing.width + 0.8, 4.2, wing.depth + 0.8);
      const lobby = new THREE.Mesh(lobbyGeo, concreteMat);
      lobby.position.set(0, 2.1, 0);
      lobby.castShadow = true;
      lobby.receiveShadow = true;
      wingGroup.add(lobby);

      // Multi-story floor stacks
      for (let f = 1; f < wing.floorsCount; f++) {
        const floorY = f * floorHeight;
        const isTargetFloor = f === this.selectedFloorLevel;

        const floorGroup = new THREE.Group();
        // If exploded view is active, push upper floors up
        const explodedOffset = f >= this.selectedFloorLevel ? this.explodedFloorFactor * 6.0 : 0;
        floorGroup.position.y = floorY + explodedOffset;

        // Floor slab
        const slabGeo = new THREE.BoxGeometry(wing.width + 0.2, 0.4, wing.depth + 0.2);
        const slab = new THREE.Mesh(slabGeo, isTargetFloor ? brassAccentMat : concreteMat);
        slab.position.y = 0.2;
        slab.castShadow = true;
        floorGroup.add(slab);

        // Tower facade section
        const sectionGeo = new THREE.BoxGeometry(wing.width, floorHeight - 0.4, wing.depth);
        const section = new THREE.Mesh(sectionGeo, towerMat);
        section.position.y = (floorHeight - 0.4) / 2 + 0.4;
        section.castShadow = true;
        floorGroup.add(section);

        wingGroup.add(floorGroup);
      }

      // Rooftop terrace / parapet
      const parapetGeo = new THREE.BoxGeometry(wing.width + 0.4, 1.2, wing.depth + 0.4);
      const parapet = new THREE.Mesh(parapetGeo, concreteMat);
      const topExplode = this.explodedFloorFactor * 6.0;
      parapet.position.set(0, totalH + 0.6 + topExplode, 0);
      wingGroup.add(parapet);

      // Position wing on site
      wingGroup.position.set(wing.footprintOffset.x, 0, wing.footprintOffset.z);
      this.buildingGroup.add(wingGroup);
    });

    // Connecting podium plaza between towers
    const plazaGeo = new THREE.BoxGeometry(22, 0.6, 22);
    const plaza = new THREE.Mesh(plazaGeo, concreteMat);
    plaza.position.set(0, 0.3, 0);
    plaza.receiveShadow = true;
    this.buildingGroup.add(plaza);
  }

  /**
   * Spawns a procedural composite furniture item
   */
  private createFurnitureItem(type: string): THREE.Group | null {
    switch (type) {
      case 'king_bed':
        return createCompositeKingBed();
      case 'sofa_sectional':
        return createCompositeSectionalSofa();
      case 'dining_table':
        return createCompositeDiningSet();
      case 'kitchen_island':
        return createCompositeKitchenIsland();
      case 'bathroom_vanity':
        return createCompositeBathroomVanity();
      case 'potted_plant':
        return createPottedPlant();
      default:
        return null;
    }
  }

  /**
   * Updates wall height / roof cutaway factor (0.2 to 1.0)
   */
  public setWallHeightFactor(factor: number) {
    this.wallHeightFactor = Math.min(1.0, Math.max(0.2, factor));
    this.rebuildWalls();
  }

  /**
   * Updates building exploded floor factor (0 to 1)
   */
  public setExplodedFloorFactor(factor: number) {
    this.explodedFloorFactor = Math.min(1.0, Math.max(0.0, factor));
    if (this.currentBrochure) {
      this.loadBuildingBrochure(this.currentBrochure);
    }
  }

  /**
   * Sets target selected floor level for building exploration
   */
  public setSelectedFloorLevel(floor: number) {
    this.selectedFloorLevel = floor;
    if (this.currentBrochure) {
      this.loadBuildingBrochure(this.currentBrochure);
    }
  }

  /**
   * Updates material finish for flooring
   */
  public setMaterialFinish(finish: MaterialFinish) {
    this.currentFinish = finish;
    if (this.currentFloorPlan) {
      this.loadFloorPlan(this.currentFloorPlan, finish);
    }
  }

  /**
   * Sets lighting preset (morning, noon, sunset, night)
   */
  public setLightingPreset(preset: LightingPreset) {
    this.currentLighting = preset;

    switch (preset) {
      case 'morning':
        this.keyLight.position.set(24, 18, 12);
        this.keyLight.color.setHex(0xffedd5);
        this.keyLight.intensity = 1.9;
        this.hemiLight.color.setHex(0xfef3c7);
        this.hemiLight.groundColor.setHex(0x1e293b);
        this.scene.background = new THREE.Color(0x0e131d);
        this.scene.fog = new THREE.FogExp2(0x0e131d, 0.015);
        break;
      case 'noon':
        this.keyLight.position.set(16, 36, 14);
        this.keyLight.color.setHex(0xffffff);
        this.keyLight.intensity = 2.0;
        this.hemiLight.color.setHex(0xdbeafe);
        this.hemiLight.groundColor.setHex(0x1e293b);
        this.scene.background = new THREE.Color(0x0b0e14);
        this.scene.fog = new THREE.FogExp2(0x0b0e14, 0.014);
        break;
      case 'sunset':
        this.keyLight.position.set(-28, 12, -18);
        this.keyLight.color.setHex(0xf97316);
        this.keyLight.intensity = 2.4;
        this.hemiLight.color.setHex(0xfdba74);
        this.hemiLight.groundColor.setHex(0x0f172a);
        this.scene.background = new THREE.Color(0x181016);
        this.scene.fog = new THREE.FogExp2(0x181016, 0.016);
        break;
      case 'night':
        this.keyLight.position.set(12, 28, 10);
        this.keyLight.color.setHex(0x38bdf8);
        this.keyLight.intensity = 0.5;
        this.hemiLight.color.setHex(0x1e293b);
        this.hemiLight.groundColor.setHex(0x05070a);
        this.scene.background = new THREE.Color(0x05070a);
        this.scene.fog = new THREE.FogExp2(0x05070a, 0.02);
        break;
    }

    this.sunSphere.position.copy(this.keyLight.position);
    (this.sunSphere.material as THREE.MeshBasicMaterial).color.copy(this.keyLight.color);
  }

  /**
   * Sets camera preset views
   */
  public setCameraPreset(preset: CameraPreset) {
    const center = this.controls.target;
    switch (preset) {
      case 'isometric':
        this.smoothFlyTo(new THREE.Vector3(center.x + 10, center.y + 12, center.z + 12), center);
        break;
      case 'topdown':
        this.smoothFlyTo(new THREE.Vector3(center.x + 0.01, center.y + 18, center.z), center);
        break;
      case 'firstperson':
        this.smoothFlyTo(new THREE.Vector3(center.x - 2, 1.6, center.z + 2.5), new THREE.Vector3(center.x + 1, 1.5, center.z - 1));
        break;
      case 'balcony':
        this.smoothFlyTo(new THREE.Vector3(center.x - 4, 2.2, center.z - 4.5), new THREE.Vector3(center.x, 1.8, center.z));
        break;
    }
  }

  /**
   * Smoothly interpolates camera position and lookAt target using exponential damping
   */
  public smoothFlyTo(pos: THREE.Vector3, target: THREE.Vector3) {
    this.targetCameraPos.copy(pos);
    this.targetLookAt.copy(target);
    this.isAnimatingCamera = true;
  }

  private animate = () => {
    if (this.isDisposed) return;

    this.frameId = requestAnimationFrame(this.animate);

    // Smooth camera damping if flying
    if (this.isAnimatingCamera) {
      this.camera.position.lerp(this.targetCameraPos, 0.08);
      this.controls.target.lerp(this.targetLookAt, 0.08);
      if (
        this.camera.position.distanceTo(this.targetCameraPos) < 0.05 &&
        this.controls.target.distanceTo(this.targetLookAt) < 0.05
      ) {
        this.isAnimatingCamera = false;
      }
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  private clearGroup(group: THREE.Group) {
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
      obj.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.geometry?.dispose();
        }
      });
    }
  }

  private calculatePolygonCenter(polygon: { x: number; z: number }[]): { x: number; z: number } {
    let sx = 0;
    let sz = 0;
    polygon.forEach((p) => {
      sx += p.x;
      sz += p.z;
    });
    return { x: sx / polygon.length, z: sz / polygon.length };
  }

  private calculatePlanBounds(plan: FloorPlan): { centerX: number; centerZ: number } {
    let minX = Infinity;
    let maxX = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;

    plan.rooms.forEach((r) => {
      r.polygon.forEach((p) => {
        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);
        minZ = Math.min(minZ, p.z);
        maxZ = Math.max(maxZ, p.z);
      });
    });

    return {
      centerX: (minX + maxX) / 2,
      centerZ: (minZ + maxZ) / 2,
    };
  }

  public dispose() {
    this.isDisposed = true;
    cancelAnimationFrame(this.frameId);
    window.removeEventListener('resize', this.onResize);
    this.renderer.domElement.removeEventListener('pointerup', this.onPointerUp);
    this.controls.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
