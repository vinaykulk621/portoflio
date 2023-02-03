"use client";
import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { ShaderMaterial } from "three";
// import { GUI } from "dat.gui";

const ThreeD = () => {

  const vertexShader = `
    varying vec2 vertexUV;
    varying vec3 vertexNormal;
    void main() {
      vertexUV=uv;
      vertexNormal=normalize(normalMatrix*normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `;
  const atmosphereVertexShader = `
    varying vec3 vertexNormal;
    void main() {
      vertexNormal=normalize(normalMatrix*normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 0.9);
    }
    `;
  const fragmentShader = `
    uniform sampler2D globeTexture;
    varying vec2 vertexUV;
    varying vec3 vertexNormal;
    void main(){
      float intensity=1.05-dot(vertexNormal,vec3(0.0,0.0,1.0));
      vec3 atmosphere=vec3(0.3,0.6,1.0)*pow(intensity,1.5);
      gl_FragColor = vec4(atmosphere+texture2D(globeTexture,vertexUV).xyz,1.0);
    }
  `;
  const atmosphereFragmentShader = `
    varying vec3 vertexNormal;
    void main(){
      float intensity=pow(0.4-dot(vertexNormal,vec3(0,0,1.0)),2.0);
      gl_FragColor = vec4(0.3,0.6,1.0,1.0)*intensity;
    }
  `;


  const sceneRef = useRef(new THREE.Scene());
  const cameraRef = useRef(
    new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
  );
  const rendererRef = useRef(new THREE.WebGLRenderer({ antialias: true }));
  // const guiRef = useRef();




  useEffect(() => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;

    // guiRef.current = new GUI();
    // const cameraFolder = guiRef.current.addFolder("Camera");
    // cameraFolder.add(camera.position, "x", -10, 10).step(0.1);
    // cameraFolder.add(camera.position, "y", -10, 10).step(0.1);
    // cameraFolder.add(camera.position, "z", -10, 10).step(0.1);
    // cameraFolder.open();

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    document.body.before(renderer.domElement);

    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(2, 250, 250),
      new ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
          globeTexture: {
            value: new THREE.TextureLoader().load(
              "https://unpkg.com/three-globe@2.24.13/example/img/earth-night.jpg"
            )
          },
        },
      })
    );
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(2, 250, 250),
      new ShaderMaterial({
        vertexShader: atmosphereVertexShader,
        fragmentShader: atmosphereFragmentShader,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
      })
    );

    atmosphere.scale.set(1.1, 1.1, 1.1)


    scene.add(sphere);
    scene.add(atmosphere);
    camera.position.x = 10;
    camera.position.z = 9;
    sphere.position.set(0, 0, 0);

    renderer.setClearColor(0x000000, 1);

    function addStars() {
      const star = new THREE.Mesh(
        new THREE.SphereGeometry(0.3),
        new THREE.MeshBasicMaterial({
          color: 0xffffff
        }))
      const [x, y, z] = Array(3)
        .fill()
        .map(() => THREE.MathUtils.randFloatSpread(700));
      star.position.set(x, y, z);
      scene.add(star);
    }
    Array(800).fill().forEach(addStars);



    const animate = () => {
      requestAnimationFrame(animate);

      // SPHERE Rotation
      sphere.rotation.x += 0.001;
      sphere.rotation.z += 0.001;

      // Changing the position of the sphere as we scroll
      sphere.position.y = - window.pageYOffset / 100;
      sphere.position.z = window.pageYOffset / 100;
      atmosphere.position.y = - window.pageYOffset / 100;
      atmosphere.position.z = window.pageYOffset / 100;

      //  Rotating the camera around the sphere
      camera.lookAt(sphere.position);
      camera.position.x = 5 * Math.sin(Date.now() * 0.0001);
      camera.position.z = 5 * Math.cos(Date.now() * 0.0001);

      renderer.render(scene, camera);
    };

    animate();

  }, []);

  return <></>;
};

export default ThreeD;

// Diferent textures For the Sphere
// const texture = new THREE.TextureLoader().load(
//   "https://unpkg.com/three-globe@2.24.13/example/img/earth-topology.png"
// );
// const texture = new THREE.TextureLoader().load(
//   "https://unpkg.com/three-globe@2.24.13/example/img/earth-dark.jpg"
// );
// const texture = new THREE.TextureLoader().load(
//   "https://unpkg.com/three-globe@2.24.13/example/img/earth-water.png"
// );
// const texture = new THREE.TextureLoader().load(
//   "https://unpkg.com/three-globe@2.24.13/example/img/earth-blue-marble.jpg"
// );