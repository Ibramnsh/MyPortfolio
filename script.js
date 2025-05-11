// DOM Elements
const navLinks = document.querySelectorAll(".nav-links a");
const sections = document.querySelectorAll("section");
const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
const navLinksContainer = document.querySelector(".nav-links");
const projectCards = document.querySelectorAll(".project-card");
const viewWorkBtn = document.querySelector('.btn[data-section="projects"]');

// THREE.JS SETUP
let scene, camera, renderer, particles, wave;
let mouseX = 0,
  mouseY = 0;
let targetX = 0,
  targetY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

function init() {
  // Scene setup
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 30;

  // Renderer setup
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  // Create particle system for home section
  createParticles();

  // Create wave mesh for about section
  createWaveMesh();

  // Add window event listeners
  window.addEventListener("resize", onWindowResize);
  document.addEventListener("mousemove", onDocumentMouseMove);

  // Start animation loop
  animate();
}

function createParticles() {
  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  const particleCount = 1500;

  for (let i = 0; i < particleCount; i++) {
    const x = Math.random() * 2000 - 1000;
    const y = Math.random() * 2000 - 1000;
    const z = Math.random() * 2000 - 1000;
    vertices.push(x, y, z);
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );

  const particleMaterial = new THREE.PointsMaterial({
    size: 2,
    color: 0x00ffe7,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
  });

  particles = new THREE.Points(geometry, particleMaterial);
  scene.add(particles);
}

function createWaveMesh() {
  const geometry = new THREE.PlaneGeometry(60, 60, 50, 50);
  const material = new THREE.MeshBasicMaterial({
    color: 0xff00cc,
    wireframe: true,
    transparent: true,
    opacity: 0.3,
  });

  wave = new THREE.Mesh(geometry, material);
  wave.rotation.x = -Math.PI / 2;
  wave.position.y = -10;
  wave.visible = false;
  scene.add(wave);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
  mouseX = (event.clientX - windowHalfX) / 100;
  mouseY = (event.clientY - windowHalfY) / 100;
}

function animate() {
  requestAnimationFrame(animate);

  targetX = mouseX * 0.5;
  targetY = mouseY * 0.5;

  // Animate particles
  if (particles) {
    particles.rotation.x += 0.0005;
    particles.rotation.y += 0.0005;
  }

  // Animate wave
  if (wave && wave.visible) {
    const positions = wave.geometry.attributes.position;
    const time = Date.now() * 0.0005;

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const vertex = new THREE.Vector3(x, y, 0);

      // Calculate wave pattern
      const distance = new THREE.Vector2(x, y).length();
      vertex.z = Math.sin(distance * 0.3 + time) * 2;

      // Update vertex position
      positions.setZ(i, vertex.z);
    }

    positions.needsUpdate = true;
  }

  // Camera smooth movement
  camera.position.x += (targetX - camera.position.x) * 0.05;
  camera.position.y += (-targetY - camera.position.y) * 0.05;
  camera.lookAt(scene.position);

  renderer.render(scene, camera);
}

// NAVIGATION AND SECTION TRANSITIONS
function navigateToSection(sectionId) {
  const currentSection = document.querySelector("section.active");
  const targetSection = document.getElementById(sectionId);

  if (currentSection === targetSection) return;

  // Hide current section
  gsap.to(currentSection, {
    opacity: 0,
    duration: 0.5,
    onComplete: () => {
      currentSection.classList.remove("active");
      currentSection.style.visibility = "hidden";

      // Show target section with animation
      targetSection.style.visibility = "visible";
      targetSection.classList.add("active");

      gsap.fromTo(
        targetSection,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8 }
      );

      // Update 3D background based on section
      updateBackground(sectionId);

      // Update navigation active state
      updateActiveNav(sectionId);
    },
  });

  // Close mobile menu if open
  if (navLinksContainer.classList.contains("active")) {
    navLinksContainer.classList.remove("active");
  }
}

function updateBackground(sectionId) {
  // Reset all backgrounds
  if (particles) particles.visible = false;
  if (wave) wave.visible = false;

  // Apply specific background for each section
  switch (sectionId) {
    case "home":
      if (particles) particles.visible = true;
      gsap.to(camera.position, { z: 30, duration: 1.5, ease: "power2.inOut" });
      break;
    case "about":
      if (wave) wave.visible = true;
      gsap.to(camera.position, { z: 40, duration: 1.5, ease: "power2.inOut" });
      break;
    case "projects":
      if (particles) particles.visible = true;
      gsap.to(camera.position, { z: 25, duration: 1.5, ease: "power2.inOut" });
      // Change particle color for projects section
      if (particles && particles.material) {
        gsap.to(particles.material.color, {
          r: 1,
          g: 0,
          b: 0.8, // RGB for #ff00cc
          duration: 1.5,
        });
      }
      break;
    case "contact":
      if (particles) particles.visible = true;
      gsap.to(camera.position, { z: 35, duration: 1.5, ease: "power2.inOut" });
      // Change particle color for contact section
      if (particles && particles.material) {
        gsap.to(particles.material.color, {
          r: 0,
          g: 1,
          b: 0.9, // RGB for #00ffe7
          duration: 1.5,
        });
      }
      break;
  }
}

function updateActiveNav(sectionId) {
  navLinks.forEach((link) => {
    if (link.dataset.section === sectionId) {
      link.style.color = getComputedStyle(
        document.documentElement
      ).getPropertyValue("--accent-cyan");
    } else {
      link.style.color = getComputedStyle(
        document.documentElement
      ).getPropertyValue("--text-color");
    }
  });
}

// Initialize 3D scene
init();

// Set up event listeners
navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const sectionId = link.dataset.section;
    navigateToSection(sectionId);
  });
});

// Mobile menu toggle
mobileMenuBtn.addEventListener("click", () => {
  navLinksContainer.classList.toggle("active");
});

// View Work button
viewWorkBtn.addEventListener("click", (e) => {
  e.preventDefault();
  navigateToSection("projects");
});

// Initialize 3D effects for project cards
function initProjectCards() {
  projectCards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      gsap.to(card, {
        rotationY: x * 10,
        rotationX: -y * 10,
        scale: 1.05,
        ease: "power2.out",
        duration: 0.5,
      });
    });

    card.addEventListener("mouseleave", () => {
      gsap.to(card, {
        rotationY: 0,
        rotationX: 0,
        scale: 1,
        ease: "power2.out",
        duration: 0.5,
      });
    });
  });
}

// Init project cards
initProjectCards();
