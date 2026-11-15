/* Seed data for Humynex Robotics.
 *
 * IMPORTANT for the client review:
 *  - Product and rental PRICES below are realistic Indian market placeholders.
 *    The old site's prices (e.g. a LiDAR for ₹450) were not usable. Confirm every
 *    price in Admin > Products / Rentals before launch.
 *  - Team members are seeded as placeholders (isPlaceholder = true). Replace them
 *    with real people and photos in Admin > Team.
 *  - Project write-ups are drafted from the old site's project list. Confirm the
 *    details in Admin > Projects.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();
const r = (rupees: number) => Math.round(rupees * 100);
const j = (v: unknown) => JSON.stringify(v);

async function main() {
  // ---------- Admin ----------
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (email && password) {
    await db.user.upsert({
      where: { email },
      update: { role: "ADMIN" },
      create: { email, name: "Humynex Admin", role: "ADMIN", passwordHash: await bcrypt.hash(password, 11) },
    });
    console.log(`Admin ready: ${email}`);
  } else {
    console.warn("SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set, skipping admin user.");
  }

  // ---------- Products ----------
  const products = [
    {
      slug: "neuro-x-core", name: "Neuro X Core", category: "Microcontrollers", brand: "Humynex", sku: "HMX-NXC-01",
      price: r(1899), stock: 40, featured: true,
      summary: "Our in-house dual-core controller board for mobile robots, with motor, IMU and sensor headers on one board.",
      description: "Neuro X Core is the controller we use inside our own robots. It pairs a dual-core 240 MHz MCU with Wi-Fi and Bluetooth, two on-board H-bridge channels, an IMU header and eight servo outputs, so a small rover needs one board instead of four.\n\nIt programs over USB-C with the Arduino IDE, PlatformIO or MicroPython.",
      specs: [{ label: "MCU", value: "Dual-core, 240 MHz" }, { label: "Wireless", value: "Wi-Fi + BLE" }, { label: "Motor channels", value: "2 x 1.5 A" }, { label: "Servo outputs", value: "8" }, { label: "Input", value: "6 to 12 V" }, { label: "USB", value: "USB-C" }],
    },
    {
      slug: "esp32-devkit-v1", name: "ESP32 DevKit V1", category: "Microcontrollers", sku: "MCU-ESP32-30P",
      price: r(449), stock: 120, featured: true,
      summary: "30-pin ESP32 board with Wi-Fi and Bluetooth. The default brain for connected projects.",
      description: "A breadboard-friendly ESP32 development board with Wi-Fi, Bluetooth and plenty of GPIO. Works with the Arduino IDE, ESP-IDF and MicroPython.",
      specs: [{ label: "Chip", value: "ESP32-WROOM-32" }, { label: "Flash", value: "4 MB" }, { label: "GPIO", value: "25 usable" }, { label: "USB", value: "Micro-USB, CP2102" }],
    },
    {
      slug: "uno-r3-compatible", name: "Uno R3 Compatible Board", category: "Microcontrollers", sku: "MCU-UNO-R3",
      price: r(549), stock: 80,
      summary: "ATmega328P board in the classic Uno layout. Works with every Uno shield.",
      description: "The standard starting point for electronics. ATmega328P at 16 MHz, 14 digital I/O pins and 6 analog inputs, in the familiar Uno footprint.",
      specs: [{ label: "MCU", value: "ATmega328P" }, { label: "Clock", value: "16 MHz" }, { label: "Digital I/O", value: "14 (6 PWM)" }, { label: "Analog in", value: "6" }],
    },
    {
      slug: "atlas-servo-mg996r", name: "Atlas MG996R Metal Gear Servo", category: "Motors & Actuators", sku: "ACT-MG996R",
      price: r(349), stock: 150, featured: true,
      summary: "High-torque metal-gear servo for arms, grippers and steering.",
      description: "A full metal gear train servo for jobs that strip plastic gears. We use these in our teaching arms.",
      specs: [{ label: "Torque", value: "Up to 11 kg·cm at 6 V" }, { label: "Speed", value: "0.17 s/60° at 4.8 V" }, { label: "Gears", value: "Metal" }, { label: "Voltage", value: "4.8 to 7.2 V" }],
    },
    {
      slug: "sg90-micro-servo", name: "SG90 Micro Servo", category: "Motors & Actuators", sku: "ACT-SG90",
      price: r(99), stock: 300,
      summary: "Light 9 g servo for pan-tilt heads, small grippers and student builds.",
      description: "The 9 g micro servo found in nearly every first robotics kit.",
      specs: [{ label: "Weight", value: "9 g" }, { label: "Torque", value: "1.8 kg·cm" }, { label: "Voltage", value: "4.8 to 6 V" }],
    },
    {
      slug: "nema17-stepper", name: "NEMA 17 Stepper Motor", category: "Motors & Actuators", sku: "ACT-NEMA17-42",
      price: r(899), stock: 45,
      summary: "1.8° bipolar stepper for 3D printers, CNC axes and camera sliders.",
      description: "A 42 mm bipolar stepper that pairs with A4988 or TMC drivers.",
      specs: [{ label: "Step angle", value: "1.8°" }, { label: "Holding torque", value: "0.42 N·m" }, { label: "Rated current", value: "1.5 A" }, { label: "Shaft", value: "5 mm D-cut" }],
    },
    {
      slug: "tt-gear-motor-pair", name: "TT Gear Motor with Wheel (Pair)", category: "Motors & Actuators", sku: "ACT-TT-PAIR",
      price: r(159), stock: 200,
      summary: "Two 3 to 6 V geared DC motors with 65 mm wheels for small rovers.",
      description: "The quickest way to get a chassis rolling. Sold as a matched pair with wheels.",
      specs: [{ label: "Voltage", value: "3 to 6 V" }, { label: "Ratio", value: "1:48" }, { label: "Wheel", value: "65 mm" }],
    },
    {
      slug: "l298n-motor-driver", name: "L298N Dual Motor Driver", category: "Drivers & Power", sku: "DRV-L298N",
      price: r(189), stock: 160,
      summary: "Drives two DC motors or one stepper, with an on-board 5 V regulator.",
      description: "A sturdy dual H-bridge for DC motors up to 2 A per channel.",
      specs: [{ label: "Channels", value: "2" }, { label: "Current", value: "2 A per channel" }, { label: "Motor supply", value: "5 to 35 V" }],
    },
    {
      slug: "lm2596-buck-converter", name: "LM2596 Buck Converter", category: "Drivers & Power", sku: "PWR-LM2596",
      price: r(99), stock: 220,
      summary: "Adjustable step-down regulator, 3 A. Turns a battery pack into a clean 5 V rail.",
      description: "Adjustable DC-DC step-down module with a trim pot for output voltage.",
      specs: [{ label: "Input", value: "4 to 40 V" }, { label: "Output", value: "1.25 to 37 V" }, { label: "Current", value: "3 A max" }],
    },
    {
      slug: "li-ion-power-pack-3s", name: "Li-Ion Power Pack 3S 2600 mAh", category: "Drivers & Power", brand: "Humynex", sku: "PWR-3S-2600",
      price: r(1299), stock: 30,
      summary: "11.1 V pack with protection board and XT60 lead, assembled and tested in our lab.",
      description: "Three 18650 cells in series with a balancing protection board. Every pack is load-tested before it ships.",
      specs: [{ label: "Voltage", value: "11.1 V nominal" }, { label: "Capacity", value: "2600 mAh" }, { label: "Protection", value: "3S BMS, 10 A" }, { label: "Connector", value: "XT60" }],
    },
    {
      slug: "lidar-360-module", name: "LiDAR 360 Module", category: "Sensors & Vision", sku: "SEN-LIDAR-360",
      price: r(7499), stock: 12, featured: true,
      summary: "360° laser scanner for SLAM and obstacle avoidance on indoor robots.",
      description: "A spinning 2D LiDAR with a 12 m range, ready for ROS and SLAM experiments.",
      specs: [{ label: "Range", value: "0.15 to 12 m" }, { label: "Scan rate", value: "5.5 to 10 Hz" }, { label: "Interface", value: "UART" }, { label: "ROS", value: "ROS 1 and ROS 2 drivers" }],
    },
    {
      slug: "hc-sr04-ultrasonic", name: "HC-SR04 Ultrasonic Sensor", category: "Sensors & Vision", sku: "SEN-HCSR04",
      price: r(79), stock: 400,
      summary: "Measures distance from 2 cm to 4 m. The classic obstacle sensor.",
      description: "Simple trigger and echo distance sensing for obstacle-avoiding robots.",
      specs: [{ label: "Range", value: "2 to 400 cm" }, { label: "Voltage", value: "5 V" }],
    },
    {
      slug: "mpu6050-imu", name: "MPU6050 6-Axis IMU", category: "Sensors & Vision", sku: "SEN-MPU6050",
      price: r(149), stock: 180,
      summary: "Accelerometer and gyroscope on I²C, for balancing bots and motion tracking.",
      description: "3-axis accelerometer plus 3-axis gyroscope with an on-chip motion processor.",
      specs: [{ label: "Axes", value: "6" }, { label: "Interface", value: "I²C" }, { label: "Voltage", value: "3.3 to 5 V" }],
    },
    {
      slug: "esp32-cam", name: "ESP32-CAM Module", category: "Sensors & Vision", sku: "SEN-ESP32CAM",
      price: r(599), stock: 70,
      summary: "Wi-Fi camera board with OV2640 sensor. Stream video from a robot.",
      description: "A tiny ESP32 board with a 2 MP camera and microSD slot.",
      specs: [{ label: "Camera", value: "OV2640, 2 MP" }, { label: "Storage", value: "microSD" }, { label: "Wireless", value: "Wi-Fi + BLE" }],
    },
    {
      slug: "carbon-chassis-kit", name: "Carbon Rover Chassis Kit", category: "Kits", brand: "Humynex", sku: "KIT-CHASSIS-CF",
      price: r(2499), stock: 18,
      summary: "Carbon-fibre plate chassis for 4WD rovers, with motor mounts and standoffs.",
      description: "Two cut carbon plates, four motor clamps and all the hardware for a stiff, light 4WD base. Takes TT or N20 motors.",
      specs: [{ label: "Plates", value: "2 x 3 mm carbon fibre" }, { label: "Drive", value: "4WD" }, { label: "Motors", value: "TT or N20 (not included)" }],
    },
    {
      slug: "henrik-manipulator-arm", name: "Henrik 4-DOF Manipulator Arm Kit", category: "Kits", brand: "Humynex", sku: "KIT-HENRIK-4DOF",
      price: r(5499), stock: 10, featured: true,
      summary: "Desktop robot arm kit for learning kinematics. Four axes and a gripper.",
      description: "An aluminium desktop arm with four MG996R joints and a parallel gripper. We built it for engineering colleges teaching forward and inverse kinematics. Includes example code for Neuro X Core and Uno boards.",
      specs: [{ label: "Axes", value: "4 + gripper" }, { label: "Reach", value: "about 300 mm" }, { label: "Payload", value: "about 150 g" }, { label: "Servos", value: "Included" }],
    },
    {
      slug: "stardust-rover-kit", name: "Stardust Rover Kit", category: "Kits", brand: "Humynex", sku: "KIT-STARDUST",
      price: r(15500), stock: 6,
      summary: "Six-wheel rocker-bogie rover kit with camera mast. Our flagship school and college build.",
      description: "A six-wheel rocker-bogie rover inspired by planetary rovers. It ships with Neuro X Core, six geared motors, an ESP32-CAM mast and a printed body. Students assemble it over a weekend and drive it from a phone.",
      specs: [{ label: "Wheels", value: "6, rocker-bogie" }, { label: "Controller", value: "Neuro X Core included" }, { label: "Camera", value: "ESP32-CAM mast" }, { label: "Control", value: "Phone over Wi-Fi" }],
    },
    {
      slug: "jumper-wire-pack", name: "Jumper Wire Pack (120 pcs)", category: "Accessories", sku: "ACC-JMP-120",
      price: r(129), stock: 500,
      summary: "40 each of M-M, M-F and F-F, 20 cm. You'll always need more.",
      description: "Three ribbons of 40 jumpers each.",
      specs: [{ label: "Count", value: "120" }, { label: "Length", value: "20 cm" }],
    },
    {
      slug: "breadboard-830", name: "Breadboard, 830 Points", category: "Accessories", sku: "ACC-BB-830",
      price: r(99), stock: 300,
      summary: "Full-size solderless breadboard with power rails.",
      description: "Standard 830 tie-point breadboard with adhesive backing.",
      specs: [{ label: "Tie points", value: "830" }],
    },
  ];
  for (const p of products) {
    const { specs, ...rest } = p;
    await db.product.upsert({ where: { slug: p.slug }, update: {}, create: { ...rest, specs: j(specs) } });
  }

  // ---------- Rentals ----------
  const rentals = [
    {
      slug: "robot-dog", name: "Robot Dog", kind: "ROBOT", sortOrder: 1, featured: true,
      tagline: "A quadruped that walks, sits, waves and dances on cue.",
      description: "Our quadruped robot is the most requested act at college fests, product launches and mall activations. It walks through crowds, climbs low steps, sits, shakes hands and runs a short dance routine. A Humynex operator travels with it and runs the show.",
      dailyRate: r(6500), deposit: r(25000), minDays: 1, units: 2,
      includes: ["Trained operator for the event", "Two charged batteries", "Transport within 60 km of Kalady", "Setup and test run"],
      goodFor: ["Tech fests", "Product launches", "Mall activations", "School science days"],
    },
    {
      slug: "serving-robot", name: "Serving Robot", kind: "ROBOT", sortOrder: 2, featured: true,
      tagline: "Carries trays to tables on a mapped route. Guests stop to watch.",
      description: "A three-tray serving robot that maps your venue and delivers food and drinks to set points. It is popular at weddings, restaurant openings and corporate dinners. We map the venue the day before so it is ready when guests arrive.",
      dailyRate: r(4500), deposit: r(20000), minDays: 1, units: 3,
      includes: ["Venue mapping visit", "Operator on call during the event", "Three serving trays", "Transport within 60 km of Kalady"],
      goodFor: ["Weddings", "Restaurant openings", "Corporate dinners", "Hotel events"],
    },
    {
      slug: "bumblebee-costume", name: "Bumblebee Costume", kind: "COSTUME", sortOrder: 3, featured: true,
      tagline: "A full-height wearable robot suit for photo ops and stage entries.",
      description: "A wearable robot costume with lights and sound, sized for performers from 5'8\" to 6'2\". It works well for birthday parties, stage entries and brand promotions. We fit the performer and brief them on the suit before the event. You can add a performer from our team.",
      dailyRate: r(3500), deposit: r(10000), minDays: 1, units: 1,
      includes: ["Fitting and briefing", "LED and sound kit with spare batteries", "Cleaning after return"],
      goodFor: ["Birthday parties", "Stage entries", "Brand promotions", "Cinema premieres"],
    },
    {
      slug: "kuka-robotic-arm", name: "KUKA Robotic Arm Demo Unit", kind: "ROBOT", sortOrder: 4,
      tagline: "An industrial-style arm for expos, demos and lab sessions.",
      description: "Our KUKA arm on a mobile base, programmed for pick-and-place and drawing demos. Teams rent it for expos, engineering open days and short training sessions.",
      dailyRate: r(5500), deposit: r(30000), minDays: 1, units: 1,
      includes: ["Engineer on site", "Pick-and-place and drawing routines", "Safety barrier kit"],
      goodFor: ["Industry expos", "Engineering open days", "Workshops"],
    },
    {
      slug: "ixi-trolley-fleet", name: "iXi Follow-Me Trolley Fleet (5 units)", kind: "FLEET", sortOrder: 5,
      tagline: "Five autonomous trolleys that follow guests around a venue.",
      description: "A fleet of five iXi prototypes that follow their user. They were built for golf courses and also work at large venues and campus tours. iXi is still in development, so we run fleet rentals as supervised pilot events.",
      dailyRate: r(5000), deposit: r(25000), minDays: 1, units: 1,
      includes: ["Five iXi units", "Two Humynex operators", "Pilot feedback report"],
      goodFor: ["Golf events", "Campus tours", "Large venue pilots"],
    },
    {
      slug: "stardust-rover-demo", name: "Stardust Rover Demo Kit", kind: "ROBOT", sortOrder: 6,
      tagline: "A six-wheel rover with a live camera feed for science fairs.",
      description: "A built and tested Stardust rover with a phone-controlled camera mast. Schools rent it for science fairs and robotics clubs try it before buying the kit.",
      dailyRate: r(1500), deposit: r(8000), minDays: 2, units: 2,
      includes: ["Assembled rover", "Spare battery and charger", "Quick-start session over video call"],
      goodFor: ["Science fairs", "Robotics clubs", "Classroom demos"],
    },
  ];
  for (const it of rentals) {
    const { includes, goodFor, ...rest } = it;
    await db.rentalItem.upsert({ where: { slug: it.slug }, update: {}, create: { ...rest, includes: j(includes), goodFor: j(goodFor) } });
  }

  // ---------- 3D print materials ----------
  const materials = [
    { code: "PLA", name: "PLA", density: 1.24, pricePerG: 250, sortOrder: 1, description: "Easy, rigid and crisp. Best for prototypes, models and enclosures that stay indoors.", colors: ["Black", "White", "Grey", "Blue", "Red", "Yellow"] },
    { code: "PETG", name: "PETG", density: 1.27, pricePerG: 350, sortOrder: 2, description: "Tougher than PLA and handles heat and moisture. Good for functional parts and brackets.", colors: ["Black", "White", "Transparent", "Blue"] },
    { code: "ABS", name: "ABS", density: 1.04, pricePerG: 400, sortOrder: 3, description: "Heat-resistant and machinable. For parts near motors or in a car.", colors: ["Black", "White", "Grey"] },
    { code: "TPU", name: "TPU 95A (flexible)", density: 1.21, pricePerG: 700, sortOrder: 4, description: "Rubbery and flexible. For tyres, gaskets, bumpers and phone cases.", colors: ["Black", "Transparent", "Red"] },
    { code: "PLA-CF", name: "PLA-CF (carbon filled)", density: 1.3, pricePerG: 900, sortOrder: 5, description: "Stiff with a matte finish. For robot frames and jigs that must not flex.", colors: ["Matte black"] },
  ];
  for (const m of materials) {
    const { colors, ...rest } = m;
    await db.printMaterial.upsert({ where: { code: m.code }, update: {}, create: { ...rest, colors: j(colors) } });
  }

  // ---------- Coupons / offers ----------
  const coupons = [
    { code: "FIRSTBUILD", title: "10% off your first parts order", description: "For new members. Up to ₹500 off a parts order of ₹999 or more.", type: "PERCENT", value: 10, minOrder: r(999), maxDiscount: r(500), appliesTo: "SHOP", membersOnly: true },
    { code: "PRINT15", title: "15% off 3D printing", description: "Any print job over ₹750. Great for project submissions.", type: "PERCENT", value: 15, minOrder: r(750), maxDiscount: r(1500), appliesTo: "PRINT" },
    { code: "EVENT1000", title: "₹1,000 off a robot rental", description: "On rentals of ₹8,000 or more. Applies to the rent, not the deposit.", type: "FLAT", value: r(1000), minOrder: r(8000), appliesTo: "RENTAL" },
    { code: "KITLAB", title: "₹750 off any kit", description: "Rover, arm and chassis kits over ₹2,000.", type: "FLAT", value: r(750), minOrder: r(2000), appliesTo: "SHOP" },
  ];
  for (const c of coupons) {
    await db.coupon.upsert({ where: { code: c.code }, update: {}, create: c });
  }

  // ---------- Team (placeholders: replace in admin) ----------
  const team = [
    { role: "Founder & CEO", bio: "Sets direction for Humynex and leads partnerships." },
    { role: "Chief Technology Officer", bio: "Owns the autonomy stack, from perception to motion planning." },
    { role: "Head of Hardware", bio: "Designs the mechanical and electrical systems inside our robots." },
    { role: "Embedded Systems Lead", bio: "Writes the firmware that runs on Neuro X Core and our sensors." },
    { role: "Product Designer", bio: "Shapes how people meet, use and trust our machines." },
    { role: "Operations & Events", bio: "Runs the rental fleet and keeps every event on schedule." },
  ];
  if ((await db.teamMember.count()) === 0) {
    for (const [i, t] of team.entries()) {
      await db.teamMember.create({ data: { name: "Team member", ...t, isPlaceholder: true, sortOrder: i } });
    }
  }

  // ---------- Projects ----------
  const projects = [
    {
      slug: "ixi-autonomous-golf-trolley", title: "iXi Autonomous Golf Trolley", tag: "Hardware", status: "In development", year: 2025, featured: true, sortOrder: 1,
      summary: "A golf trolley that follows its player, anticipates their path and reports on their round.",
      body: "We started iXi to solve a simple problem on the golf course: carrying gear shouldn't be work. iXi follows its player at a natural distance, keeps out of the line of play and navigates slopes and paths without a remote.\n\nThe trolley also records the round, so players can review distances and decisions afterwards. iXi is our first showcase of autonomy in an everyday object, and it now runs supervised pilots with five units.",
      outcomes: ["Follow-me tracking without a wearable remote", "Five-unit pilot fleet built", "Round insights recorded on the trolley"],
      stack: ["Sensor fusion", "Path planning", "Neuro X Core", "Custom drivetrain"],
    },
    {
      slug: "perception-engine", title: "Perception Engine", tag: "Software", status: "Active", year: 2025, sortOrder: 2,
      summary: "The vision and sensor-fusion layer that lets our robots understand the space around them.",
      body: "Perception Engine combines camera, LiDAR and IMU data into one picture of the world, which every Humynex robot uses. It detects people and obstacles, estimates free space and tracks the person a robot is assigned to follow.\n\nIt runs on edge hardware, so our robots keep working without a network connection.",
      outcomes: ["Shared across all Humynex robots", "Runs fully on-device", "Person tracking for follow-me behaviour"],
      stack: ["Computer vision", "LiDAR", "Edge inference"],
    },
    {
      slug: "motion-intelligence-platform", title: "Motion Intelligence Platform", tag: "Core tech", status: "Prototype", year: 2025, sortOrder: 3,
      summary: "Motion planning and control that keeps our machines smooth and predictable around people.",
      body: "Robots that work next to people have to move in ways people can read. Motion Intelligence Platform plans paths and accelerations that feel natural and stay safe, and it adapts when someone steps into the way.",
      outcomes: ["Smooth acceleration profiles", "Live re-planning around people"],
      stack: ["Motion planning", "Control systems"],
    },
    {
      slug: "humynex-cloud", title: "Humynex Cloud", tag: "Platform", status: "Early access", year: 2026, sortOrder: 4,
      summary: "Fleet monitoring for rental robots and pilot deployments.",
      body: "Humynex Cloud lets us, and later our customers, watch over a fleet: battery levels, location, errors and usage. It is how we keep rental robots healthy between events.",
      outcomes: ["Battery and health monitoring", "Used to manage our rental fleet"],
      stack: ["IoT telemetry", "Dashboards"],
    },
    {
      slug: "swarm-logic-algorithms", title: "Swarm Logic Algorithms", tag: "R&D", status: "Testing", year: 2026, sortOrder: 5,
      summary: "Coordination for groups of robots that share space and tasks.",
      body: "When several iXi units or serving robots work in the same venue, they need to share paths and split up tasks. Swarm Logic is our research into that coordination, tested on the iXi pilot fleet.",
      outcomes: ["Tested on the five-unit iXi fleet"],
      stack: ["Multi-agent planning"],
    },
    {
      slug: "bionic-actuation-modules", title: "Bionic Actuation Modules", tag: "Actuation", status: "R&D", year: 2026, sortOrder: 6,
      summary: "Compact joint modules that give our robots smoother, more lifelike movement.",
      body: "Bionic Actuation Modules are compact joints with built-in sensing, designed for arms and legged robots. They are the base for the next generation of our manipulators.",
      outcomes: ["Integrated torque sensing", "Designed for arms and legged robots"],
      stack: ["Actuator design", "Embedded control"],
    },
  ];
  for (const p of projects) {
    const { outcomes, stack, ...rest } = p;
    await db.project.upsert({ where: { slug: p.slug }, update: {}, create: { ...rest, outcomes: j(outcomes), stack: j(stack) } });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
