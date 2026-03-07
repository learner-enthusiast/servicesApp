import { ServiceTypeEnum } from '../utils/enums';

type ServiceType = keyof typeof ServiceTypeEnum;
type Listing = [string, string, ServiceType, number, [number, number]];

// ─── Base locations (anchor points for neighbourhoods) ────────────────────────
const BASE_LOCATIONS: { area: string; lat: number; lng: number }[] = [
  { area: 'Kolkata Central', lat: 22.5726, lng: 88.3639 },
  { area: 'Salt Lake', lat: 22.5958, lng: 88.4126 },
  { area: 'South Kolkata', lat: 22.5121, lng: 88.3697 },
  { area: 'North Kolkata', lat: 22.6089, lng: 88.3698 },
  { area: 'Howrah', lat: 22.5958, lng: 88.3105 },
  { area: 'Dum Dum', lat: 22.6512, lng: 88.4271 },
  { area: 'Baranagar', lat: 22.6439, lng: 88.3785 },
  { area: 'Behala', lat: 22.5003, lng: 88.3116 },
  { area: 'Tollygunge', lat: 22.4966, lng: 88.3479 },
  { area: 'Jadavpur', lat: 22.4974, lng: 88.3714 },
  { area: 'Ballygunge', lat: 22.5304, lng: 88.366 },
  { area: 'New Town', lat: 22.5871, lng: 88.4753 },
  { area: 'Garia', lat: 22.4621, lng: 88.3894 },
  { area: 'Kasba', lat: 22.5224, lng: 88.3942 },
  { area: 'Serampore', lat: 22.7489, lng: 88.3421 },
  { area: 'Chandannagar', lat: 22.8677, lng: 88.3676 },
  { area: 'Hooghly', lat: 22.9053, lng: 88.3959 },
  { area: 'Chinsurah', lat: 22.8896, lng: 88.3892 },
  { area: 'Rishra', lat: 22.7097, lng: 88.3522 },
  { area: 'Uttarpara', lat: 22.6651, lng: 88.3474 },
  { area: 'Barrackpore', lat: 22.7622, lng: 88.3718 },
  { area: 'Naihati', lat: 22.8894, lng: 88.4219 },
  { area: 'Kalyani', lat: 22.9754, lng: 88.4342 },
  { area: 'Barasat', lat: 22.7214, lng: 88.4782 },
  { area: 'Madhyamgram', lat: 22.6988, lng: 88.4386 },
  { area: 'Rajpur Sonarpur', lat: 22.4451, lng: 88.3956 },
  { area: 'Krishnanagar', lat: 23.4032, lng: 88.4928 },
  { area: 'Ranaghat', lat: 23.1784, lng: 88.5601 },
  { area: 'Burdwan', lat: 23.2324, lng: 87.8615 },
  { area: 'Durgapur', lat: 23.5204, lng: 87.3119 },
  { area: 'Asansol', lat: 23.6889, lng: 86.9661 },
  { area: 'Siliguri', lat: 26.7271, lng: 88.3953 },
  { area: 'Malda', lat: 25.0108, lng: 88.1415 },
  { area: 'Berhampore', lat: 24.0995, lng: 88.2477 },
  { area: 'Haldia', lat: 22.0667, lng: 88.0722 },
  { area: 'Kharagpur', lat: 22.3302, lng: 87.3237 },
  { area: 'Midnapore', lat: 22.4249, lng: 87.3216 },
  { area: 'Bolpur', lat: 23.6688, lng: 87.7089 },
  { area: 'Bankura', lat: 23.2324, lng: 87.0728 },
  { area: 'Diamond Harbour', lat: 22.1906, lng: 88.1928 },
];

// ─── Service metadata: names, pricing, descriptions ──────────────────────────
const SERVICE_META: Record<
  ServiceType,
  { names: string[]; priceRange: [number, number]; descriptions: string[] }
> = {
  PLUMBING: {
    names: [
      'AquaFix Plumbing',
      'PipeRight Solutions',
      'LeakStop Services',
      'FlowPro Plumbers',
      'DrainMaster Works',
      'TapTech Plumbing',
      'ClearFlow Pipe Works',
      'SealPro Plumbing',
    ],
    priceRange: [400, 1500],
    descriptions: [
      'Expert pipe repairs, leakage fixing, tap replacement, and drain unblocking at affordable rates.',
      'Overhead tank fitting, pipeline installation, and emergency leak repairs. Same-day service available.',
      'Bathroom renovation, drainage repair, and water line installation for homes and offices.',
    ],
  },
  ELECTRICAL: {
    names: [
      'SparkFix Electricals',
      'VoltPro Wiring',
      'PowerLine Electric',
      'BrightWire Solutions',
      'CircuitPro Electrical',
      'SafeWire Services',
      'AmpereTech Electric',
    ],
    priceRange: [500, 2000],
    descriptions: [
      'Fan installation, AC wiring, MCB replacement, switchboard repairs, and full home wiring solutions.',
      'Inverter installation, short circuit fixes, meter room work, and emergency electrical faults resolved quickly.',
      'Geyser wiring, CCTV power setup, earthing work, and ceiling light installations.',
    ],
  },
  CARPENTRY: {
    names: [
      'WoodCraft Joinery',
      'TimberPro Works',
      'CraftMaster Carpentry',
      'TeakPro Furniture',
      'JoineryPlus Services',
      'WoodWorks Solutions',
      'PineCraft Studio',
    ],
    priceRange: [800, 5000],
    descriptions: [
      'Door and window repairs, furniture assembly, custom cupboard fabrication, and wooden flooring installation.',
      'Modular furniture fitting, almirah repairs, false ceiling frames, and wood polish work.',
      'Wardrobe fitting, door frame replacement, kitchen cabinet installation, and furniture repair.',
    ],
  },
  PAINTING: {
    names: [
      'ColorPro Painters',
      'BrushMaster Painting',
      'FreshCoat Services',
      'WallArt Contractors',
      'TexturePro Painting',
      'ShinePaint Works',
      'CoatPro Wall Solutions',
    ],
    priceRange: [3000, 25000],
    descriptions: [
      'Interior and exterior wall painting, texture finishes, waterproofing coats, and wood polish. Quality materials used.',
      'Distemper, emulsion, enamel, and designer texture painting for homes and commercial spaces.',
      'Wall putty application, primer coats, and premium paint finishes at competitive rates.',
    ],
  },
  CLEANING: {
    names: [
      'SparkClean Services',
      'FreshHome Cleaners',
      'ShineHome Cleaning',
      'NeatPro Clean Team',
      'PureClean Solutions',
      'BrightHome Cleaners',
      'HygieneFirst Services',
    ],
    priceRange: [600, 2500],
    descriptions: [
      'Full apartment cleaning, kitchen scrubbing, bathroom sanitisation, and floor mopping. All equipment provided.',
      'Post-party cleanup, move-in/move-out cleaning, and regular weekly cleaning packages available.',
      'Trained staff, eco-friendly products, and flexible scheduling to suit your needs.',
    ],
  },
  DEEP_CLEANING: {
    names: [
      'DeepClean Pro',
      'ThoroughClean Services',
      'PowerClean Intensive',
      'UltraClean Sanitization',
      'MasterClean Services',
      'PureZone Deep Clean',
      'HygienePro Intensive',
    ],
    priceRange: [1500, 5000],
    descriptions: [
      'Post-construction cleaning, move-in/move-out sanitisation, high-pressure washing, and grout scrubbing.',
      'Heavy-duty equipment, steam cleaning, and disinfection treatments for homes and offices.',
      'Full apartment sanitisation, pest-grade disinfection, and odour removal included.',
    ],
  },
  SOFA_CLEANING: {
    names: [
      'SofaCare Pro',
      'UpholsteryPro Services',
      'FoamFresh Cleaning',
      'SofaSpa Solutions',
      'FabricFresh Care',
      'SofaShine Services',
      'CushionClean Pro',
    ],
    priceRange: [500, 2000],
    descriptions: [
      'Foam shampooing, stain removal, and dry cleaning for all sofa types.',
      'Leather conditioning, fabric freshening, and deep foam extraction. Results guaranteed.',
      'Handles all fabric types including velvet, suede, and rexine. Quick drying technology used.',
    ],
  },
  BATHROOM_CLEANING: {
    names: [
      'BathSpark Cleaners',
      'TilePro Services',
      'FreshBath Cleaning',
      'ShineBath Solutions',
      'GroutClean Pro',
      'BathroomPro Services',
      'TileShine Cleaners',
    ],
    priceRange: [400, 1200],
    descriptions: [
      'Tile scrubbing, grout cleaning, commode disinfection, and exhaust fan dusting. Anti-bacterial products used.',
      'Removes limescale, soap scum, and stubborn stains. All fittings cleaned and polished.',
      'Complete sanitisation including tiles, mirrors, pipes, and overhead tanks.',
    ],
  },
  KITCHEN_CLEANING: {
    names: [
      'KitchenSpark Pro',
      'GreaseFix Cleaning',
      'FreshKitchen Services',
      'KitchenWash Solutions',
      'OvenClean Pro',
      'KitchenShine Cleaners',
      'CookAreaPro Services',
    ],
    priceRange: [600, 1800],
    descriptions: [
      'Chimney cleaning, stove degreasing, tile scrubbing, and cabinet interior cleaning.',
      'Grease removal, exhaust fan cleaning, countertop polishing, and sink descaling included.',
      'Oven cleaning, hood filters, walls, and floor scrubbing. Food-safe products used.',
    ],
  },
  APPLIANCE_REPAIR: {
    names: [
      'ApplianceFix Pro',
      'QuickRepair Services',
      'HomeTech Repairs',
      'ApplianceCare Solutions',
      'RepairMaster Services',
      'FixItFast Appliances',
      'TechFix Home',
    ],
    priceRange: [300, 1500],
    descriptions: [
      'Handles fridges, washing machines, geysers, microwaves, and more. Quick diagnosis and fix.',
      'Factory-trained technicians, genuine parts, and service warranty provided.',
      'On-site repairs for all major brands. Same-day service for most common faults.',
    ],
  },
  REFRIGERATOR_REPAIR: {
    names: [
      'FridgePro Services',
      'CoolFix Repairs',
      'ChillMaster Tech',
      'FridgeCare Solutions',
      'FrostFix Refrigeration',
      'ColdRepair Pro',
      'FreezeFix Services',
    ],
    priceRange: [500, 2500],
    descriptions: [
      'Compressor replacement, gas refilling, thermostat repair, and cooling issues resolved.',
      'All brands serviced: Samsung, LG, Whirlpool, Haier, Godrej, and more.',
      'Frost buildup, water leakage, ice maker faults, and door seal replacement handled.',
    ],
  },
  WASHING_MACHINE_REPAIR: {
    names: [
      'WashFix Pro',
      'SpinCare Repairs',
      'DrumTech Services',
      'LaundryFix Solutions',
      'WashMaster Tech',
      'CleanMachine Repair',
      'DrumFix Services',
    ],
    priceRange: [400, 2000],
    descriptions: [
      'Drum issues, motor faults, water inlet valve repair, and PCB replacement for all brands.',
      'Front-load and top-load washing machines serviced. Error code diagnosis and repair.',
      'Belt replacement, spin problems, drainage faults, and door latch repairs.',
    ],
  },
  MICROWAVE_REPAIR: {
    names: [
      'MicroFix Services',
      'OvenPro Repairs',
      'WaveFix Tech',
      'MicroCare Solutions',
      'HeatFix Appliances',
      'MicrowavePro Services',
      'OvenCare Repairs',
    ],
    priceRange: [300, 1200],
    descriptions: [
      'Magnetron replacement, turntable motor, door lock, and heating element faults fixed.',
      'All brands: Samsung, LG, IFB, Bajaj, and more. Genuine parts used.',
      'Not heating, sparking, display faults, and door sensor issues resolved same day.',
    ],
  },
  TV_REPAIR: {
    names: [
      'TVFix Pro',
      'ScreenPro Repairs',
      'DisplayTech Services',
      'TVCare Solutions',
      'PixelFix Tech',
      'SmartTVPro Repairs',
      'ScreenFix Services',
    ],
    priceRange: [500, 3000],
    descriptions: [
      'LED, LCD, and Smart TV screen replacement, backlight issues, HDMI port, and remote sensor repair.',
      'All brands serviced including Sony, Samsung, LG, and Mi. No display, dim screen resolved.',
      'Power board replacement, panel repair, sound issues, and software updates for Smart TVs.',
    ],
  },
  PEST_CONTROL: {
    names: [
      'PestAway Services',
      'BugFree Pro',
      'TermiteKill Solutions',
      'PestGuard Services',
      'BugStop Pro',
      'ClearPest Management',
      'SafeHome Pest Control',
    ],
    priceRange: [800, 4000],
    descriptions: [
      'Cockroach, termite, mosquito, rat, and bed bug treatments. Odourless chemicals, safe for children and pets.',
      'AMC packages available. Preventive and curative treatments for all types of pests.',
      'Government-approved chemicals. Cockroach gel treatment, termite drilling, and mosquito fogging.',
    ],
  },
  WATER_PURIFIER_SERVICE: {
    names: [
      'AquaPure Services',
      'ClearWater RO',
      'PureFlow Maintenance',
      'WaterCare Solutions',
      'FilterPro Services',
      'AquaService Pro',
      'PureWater Tech',
    ],
    priceRange: [300, 1000],
    descriptions: [
      'Filter replacement, membrane cleaning, TDS calibration, and UV lamp replacement.',
      'All brands: Kent, Aquaguard, Pureit, Livpure, and more. AMC packages available.',
      'Filter cartridge change, motor repair, and complete system sanitisation. Same-day service.',
    ],
  },
  INVERTER_BATTERY_SERVICE: {
    names: [
      'PowerBack Services',
      'InverterPro Tech',
      'BatteryTech Solutions',
      'BackupTech Services',
      'PowerMaster Inverter',
      'InverterFix Pro',
      'ChargePro Services',
    ],
    priceRange: [500, 3000],
    descriptions: [
      'Battery water topping, terminal cleaning, capacity testing, and inverter PCB repair.',
      'All brands: Luminous, Exide, Amaron, Microtek. Battery replacement and charger repair.',
      'Inverter servicing, battery health check, wiring inspection, and system optimisation.',
    ],
  },
  CHIMNEY_CLEANING: {
    names: [
      'ChimneyCare Pro',
      'SmokeClean Services',
      'FlueClean Solutions',
      'HoodMaster Cleaning',
      'ChimneyFix Pro',
      'VentClean Services',
      'ChimneySpark Care',
    ],
    priceRange: [400, 1200],
    descriptions: [
      'Oil trap washing, mesh filter cleaning, motor servicing, and suction restoration.',
      'Complete disassembly, degreasing, and reinstallation. All brands serviced.',
      'Baffle filter cleaning, carbon removal, and LED light replacement. Service warranty provided.',
    ],
  },
  AC_SERVICE: {
    names: [
      'CoolAir Services',
      'ACPro Tech',
      'FrostAir Solutions',
      'AirCare Pro',
      'ChillPro AC',
      'ACMaster Services',
      'CoolBreeze AC Care',
    ],
    priceRange: [400, 1500],
    descriptions: [
      'Gas charging, coil cleaning, filter wash, compressor check, and PCB repair. All brands.',
      'Split and window AC serviced. Pre-summer maintenance packages available.',
      'Cooling issues, water leakage, noise problems, and capacitor replacement handled.',
    ],
  },
  GEYSER_REPAIR: {
    names: [
      'HotFix Geyser',
      'GeyserPro Services',
      'WaterHeat Tech',
      'HeatPro Solutions',
      'GeyserFix Pro',
      'WarmWater Services',
      'HeaterPro Tech',
    ],
    priceRange: [300, 1500],
    descriptions: [
      'Heating element replacement, thermostat repair, anode rod change, and leakage fixing.',
      'All brands: Racold, Venus, Bajaj, AO Smith. Instant and storage geysers serviced.',
      'Not heating, tripping issues, rust water, and pressure valve problems resolved.',
    ],
  },
  AC_INSTALLATION: {
    names: [
      'CoolInstall Pro',
      'ACSetup Services',
      'AirFit Installation',
      'ChillInstall Tech',
      'AirInstall Pro',
      'ACMount Services',
      'FrostInstall Solutions',
    ],
    priceRange: [1000, 4000],
    descriptions: [
      'Wall mounting, copper piping, drainage setup, and trial run. All brands installed.',
      'Split AC installation with stabiliser connection and remote pairing. Quick service.',
      'Proper bracket fitting, gas line setup, and insulation provided.',
    ],
  },
  TV_WALL_MOUNTING: {
    names: [
      'WallFix Pro',
      'TVMount Services',
      'MountMaster Tech',
      'WallTech Mounting',
      'TVHang Solutions',
      'MountPro Services',
      'ScreenMount Pro',
    ],
    priceRange: [400, 1200],
    descriptions: [
      'All sizes and bracket types. Wire concealment, tilt and swivel brackets fitted professionally.',
      'Stud wall, concrete, and plasterboard mounting. Cable management included.',
      'Fixed and full-motion brackets. Ensures level mounting and secure installation.',
    ],
  },
  WATER_PURIFIER_INSTALLATION: {
    names: [
      'AquaInstall Pro',
      'PureSetup Services',
      'FilterInstall Tech',
      'AquaFit Solutions',
      'ROSetup Pro',
      'WaterFit Services',
      'FilterSetup Installation',
    ],
    priceRange: [500, 2000],
    descriptions: [
      'Under-sink and countertop RO systems fitted. Plumbing connections and trial run included.',
      'All brands fitted including Kent, Aquaguard, and Livpure. Proper line tapping and setup.',
      'Wall mounting, tank connection, and water quality testing done post-installation.',
    ],
  },
  GEYSER_INSTALLATION: {
    names: [
      'HeatInstall Pro',
      'GeyserFit Services',
      'WaterHeatInstall Tech',
      'GeyserMount Solutions',
      'HeatSetup Pro',
      'GeyserInstall Services',
      'ShowerHeat Fitting',
    ],
    priceRange: [600, 2000],
    descriptions: [
      'Wall mounting, inlet/outlet pipe connections, pressure valve fitting, and electrical wiring.',
      'All capacity geysers fitted. Safety valve and ELCB connection included.',
      'Instant and storage geysers installed. Proper waterproofing and sealing done.',
    ],
  },
  FAN_INSTALLATION: {
    names: [
      'FanFit Pro',
      'AirInstall Services',
      'CeilingFit Tech',
      'BreezeInstall Solutions',
      'FanMount Pro',
      'CoolFan Fitting',
      'BladeMount Services',
    ],
    priceRange: [200, 800],
    descriptions: [
      'Hooks, canopy fitting, wiring connection, and balancing. All fan brands installed.',
      'New fan installation, old fan replacement, and regulator connection done safely.',
      'Pedestal, wall, and exhaust fans also fitted. Includes wiring and earthing check.',
    ],
  },
  LIGHT_INSTALLATION: {
    names: [
      'LightFit Pro',
      'BrightInstall Services',
      'LumoPro Lighting',
      'LEDFit Solutions',
      'LightMount Tech',
      'GlowInstall Pro',
      'LumoFit Lighting',
    ],
    priceRange: [200, 800],
    descriptions: [
      'Ceiling lights, panel lights, strip lights, and chandeliers installed safely.',
      'Concealed wiring, conduit fitting, and dimmer switch connections.',
      'False ceiling lights, spot lights, and outdoor security lights fitted.',
    ],
  },
  MAID_SERVICE: {
    names: [
      'HomeHelp Services',
      'MaidPro Agency',
      'CleanHands Maids',
      'DomesticPro Help',
      'HomeAide Services',
      'MaidMatch Agency',
      'CleanCrew Services',
    ],
    priceRange: [3000, 12000],
    descriptions: [
      'Part-time and full-time maids for daily cleaning, utensil washing, and floor mopping. Background checked.',
      'Experienced maids for cleaning, dishes, and laundry. Weekly and monthly packages available.',
      'Trained, ID-verified house helpers for daily household work. Replacement guarantee.',
    ],
  },
  COOK_SERVICE: {
    names: [
      'HomeChef Services',
      'CookPro Agency',
      'TastyHome Cooks',
      'HomeCook Solutions',
      'CookMatch Services',
      'ChefHome Agency',
      'KitchenAide Cooks',
    ],
    priceRange: [5000, 20000],
    descriptions: [
      'Experienced cooks for daily meals — breakfast, lunch, and dinner. Bengali, North Indian, and South Indian cuisines.',
      'Part-time and live-in cooks available. Hygienic cooking practices, background checked.',
      'Monthly packages for regular meal preparation. Special diet and health meal options available.',
    ],
  },
  BABYSITTER: {
    names: [
      'BabyCare Services',
      'TinyGuard Nannies',
      'KidsCare Pro',
      'NurturePro Agency',
      'BabyWatch Services',
      'TenderCare Nannies',
      'BabyMinder Pro',
    ],
    priceRange: [8000, 20000],
    descriptions: [
      'Experienced nannies for infants and toddlers. Background verified, first-aid trained.',
      'Part-time and full-time babysitters available. Trained in child development and safety.',
      'Caring, experienced staff for daytime and evening childcare. References provided.',
    ],
  },
  ELDERLY_CARE: {
    names: [
      'ElderCare Pro',
      'SeniorHelp Services',
      'GoldenCare Agency',
      'ElderGuard Services',
      'AgeCare Solutions',
      'GoldenYears Care',
      'SeniorSupport Pro',
    ],
    priceRange: [10000, 30000],
    descriptions: [
      'Trained attendants for senior citizens — medication reminders, mobility assistance, and companionship.',
      'Day care and live-in options. Medical escort, physiotherapy coordination, and daily assistance.',
      'Experienced caretakers for aged parents. Cooking, bathing assistance, and emergency support.',
    ],
  },
  DRIVER_ON_HIRE: {
    names: [
      'DriveEasy Services',
      'SafeDrive Pro',
      'HireDrive Agency',
      'ProDriver Services',
      'DriveRight Solutions',
      'SafeRide Drivers',
      'DriverPlus Agency',
    ],
    priceRange: [8000, 20000],
    descriptions: [
      'Experienced, licensed drivers for daily commute, outstation trips, and corporate use.',
      'Part-time and full-time drivers available. Clean record, familiar with local routes.',
      'Monthly and daily packages. Drivers for office, hospital, airport, and personal use.',
    ],
  },
  MENS_SALON: {
    names: [
      'BladeClub Barbers',
      'ManCut Studio',
      'GroomKing Salon',
      'FadePro Barbers',
      'SharpeBarber Studio',
      'ClipMaster Grooming',
      'ManGroom Services',
    ],
    priceRange: [100, 800],
    descriptions: [
      'Haircut, beard shaping, head massage, and facial done by professional barbers at your doorstep.',
      "Trendy cuts, fades, razor shaving, and hair colouring. Men's grooming made convenient.",
      'Classic and modern haircuts, beard styling, and scalp treatments.',
    ],
  },
  WOMENS_SALON: {
    names: [
      'GlowSalon Services',
      'BeautyHome Pro',
      'LushStyle Salon',
      'GlamourPro Beauty',
      'BlossomSalon Services',
      'VelvetBeauty Studio',
      'ShimmerStyle Salon',
    ],
    priceRange: [300, 3000],
    descriptions: [
      'Haircut, waxing, facial, manicure, pedicure, and threading done by trained beauticians.',
      'Bridal and party packages, hair spa, keratin treatment, and mehndi available.',
      'Full grooming packages for women including skin care, hair care, and nail art.',
    ],
  },
  MASSAGE_THERAPY: {
    names: [
      'ZenTouch Therapy',
      'RelaxPro Massage',
      'SpaHome Services',
      'HealTouch Therapy',
      'BodyZen Massage',
      'CalmBody Services',
      'TherapyPlus Massage',
    ],
    priceRange: [500, 3000],
    descriptions: [
      'Swedish, deep tissue, aromatherapy, and foot massage by trained therapists.',
      'Relaxation and therapeutic massage at your doorstep. All therapists certified.',
      'Full body, back, and head massage. Oils and equipment provided by therapist.',
    ],
  },
  MEHENDI: {
    names: [
      'MehendiPro Artist',
      'HennaArt Services',
      'ArtisticHenna Pro',
      'MehendiMaster Studio',
      'HennaDesign Pro',
      'MehendiGuru Services',
      'HennaArtist Pro',
    ],
    priceRange: [300, 5000],
    descriptions: [
      'Bridal, Arabic, Indo-Arabic, and Rajasthani designs. Home visits available.',
      'Intricate bridal mehendi, party designs, and quick Arabic patterns. Fresh henna used.',
      'Full bridal package including hands and feet. Party and festival designs also available.',
    ],
  },
  BRIDAL_MAKEUP: {
    names: [
      'BridalGlow Studio',
      'WeddingBeauty Pro',
      'GlamBride Services',
      'BridalStar Makeup',
      'WeddingGlam Pro',
      'BridalBliss Studio',
      'GlowBride Artist',
    ],
    priceRange: [5000, 30000],
    descriptions: [
      'Airbrush, HD, and traditional makeup styles. Trial sessions available.',
      'Complete bridal package including makeup, hairstyling, and saree draping.',
      'Long-lasting makeup using top brands. Pre-bridal skin prep sessions also offered.',
    ],
  },
  HAIR_STYLING: {
    names: [
      'StyleCraft Hair',
      'HairPro Studio',
      'LocksMaster Styling',
      'HairGlam Services',
      'StrandStyle Pro',
      'HairArtist Studio',
      'LocksPro Styling',
    ],
    priceRange: [300, 2000],
    descriptions: [
      'Blow dry, curling, straightening, braids, and updos for parties and events.',
      'Keratin treatment, hair colouring, highlights, and hair spa services.',
      'All hair types styled. Bridal hairdos, everyday styling, and hair treatment packages.',
    ],
  },
  PHYSIOTHERAPY: {
    names: [
      'HealPro Physio',
      'PhysioCare Services',
      'RecoverPro Rehab',
      'PhysioHome Services',
      'RehabPro Therapy',
      'MotionCare Physio',
      'ActiveHeal Services',
    ],
    priceRange: [500, 2000],
    descriptions: [
      'Pain management, post-surgery rehab, stroke recovery, and sports injury treatment by qualified physiotherapists.',
      'Joint pain, back pain, neck pain, and neurological conditions treated.',
      'Electrotherapy, exercise programmes, and manual therapy. Post-fracture and orthopaedic care.',
    ],
  },
  DOCTOR_HOME_VISIT: {
    names: [
      'DocHome Services',
      'MediVisit Pro',
      'HomeDoc Care',
      'DoctorVisit Services',
      'HomeMedic Pro',
      'QuickDoctor Services',
      'MediCall Home',
    ],
    priceRange: [300, 1500],
    descriptions: [
      'General physicians available for fever, cold, BP check, and minor ailments. Quick response.',
      'Experienced GPs for home visits. Prescription, injections, and basic diagnostics done.',
      'Doctors visit for elderly patients, bedridden cases, and post-hospitalisation follow-up.',
    ],
  },
  NURSE_CARETAKER: {
    names: [
      'NursingPro Services',
      'CarePro Nursing',
      'MediCare Nurses',
      'NurseAide Services',
      'HomeNurse Pro',
      'MediAttend Services',
      'CareNurse Agency',
    ],
    priceRange: [10000, 30000],
    descriptions: [
      'Trained nurses and attendants for post-operative care, IV drip, wound dressing, and catheter care.',
      'Day and night duty. Bed-ridden patient care, vital monitoring, and medication management.',
      'ICU-trained nurses available. Elderly patients, cancer patients, and critical care at home.',
    ],
  },
  DIETICIAN: {
    names: [
      'NutriPro Services',
      'DietExpert Consulting',
      'HealthDiet Pro',
      'DietCare Solutions',
      'NutriPlan Services',
      'WellNutri Pro',
      'DietMaster Consulting',
    ],
    priceRange: [500, 2000],
    descriptions: [
      'Personalised diet plans for weight loss, diabetes, PCOS, thyroid, and sports nutrition.',
      'Home visits and online consultations. Meal planning and lifestyle guidance included.',
      'Evidence-based nutrition therapy for chronic diseases, weight management, and child nutrition.',
    ],
  },
  YOGA_TRAINER: {
    names: [
      'YogaPro Services',
      'ZenYoga Training',
      'AsanaMaster Pro',
      'FlexYoga Home',
      'MindBody Yoga',
      'YogaGuru Services',
      'BreathPro Yoga',
    ],
    priceRange: [3000, 10000],
    descriptions: [
      'Personalised sessions for beginners and advanced. Hatha, Vinyasa, and Pranayama taught.',
      'Morning sessions at home. Weight management, stress relief, and flexibility programmes.',
      'Group and individual sessions. Meditation and breathing techniques included.',
    ],
  },
  FITNESS_TRAINER: {
    names: [
      'FitPro Training',
      'StrongHome Fitness',
      'PowerFit Coach',
      'BodyFit Pro',
      'ActiveCoach Services',
      'FitZone Training',
      'StrengthPro Fitness',
    ],
    priceRange: [3000, 12000],
    descriptions: [
      'Home workout sessions for weight loss, muscle building, and overall fitness. Custom plans.',
      'HIIT, strength training, and cardio sessions at your home. Diet guidance included.',
      'Morning and evening slots. Functional fitness, fat loss, and rehabilitation programmes.',
    ],
  },
  HOME_TUTOR: {
    names: [
      'TutorPro Services',
      'HomeTutor Expert',
      'EduHome Tuitions',
      'TutorZone Services',
      'SmartTutor Pro',
      'LearnHome Tuitions',
      'TutorMaster Services',
    ],
    priceRange: [2000, 10000],
    descriptions: [
      'All subjects for Class 1–12. CBSE, ICSE, and West Bengal board. Results-focused teaching.',
      'Maths, Science, English, and competitive exam coaching. Flexible timings.',
      'Trained graduates and post-graduates. Personalised attention and regular progress tests.',
    ],
  },
  MUSIC_CLASSES: {
    names: [
      'MusicPro Classes',
      'SwarHome Academy',
      'TuneGuru Music',
      'MelodyHome School',
      'HarmonyHome Music',
      'RagaPro Classes',
      'BeatHome Academy',
    ],
    priceRange: [1500, 6000],
    descriptions: [
      'Guitar, keyboard, tabla, harmonium, and vocals taught. All age groups, beginner to advanced.',
      'Classical and contemporary music. ABRSM and Trinity exam preparation available.',
      'One-on-one lessons at home. Hindustani classical, Rabindra Sangeet, and modern music.',
    ],
  },
  DANCE_CLASSES: {
    names: [
      'DancePro Academy',
      'StepHome Classes',
      'GrooveHome Dance',
      'RhythmHome School',
      'DanceMaster Pro',
      'BeatDance Academy',
      'MovePro Classes',
    ],
    priceRange: [1500, 6000],
    descriptions: [
      'Bharatanatyam, Kathak, Rabindra Nritya, and Bollywood dance taught. Kids and adults welcome.',
      'Classical and folk dance forms. Exam board preparation and performance training.',
      'Western, hip-hop, salsa, and contemporary dance lessons at home.',
    ],
  },
  ART_CLASSES: {
    names: [
      'ArtHome Classes',
      'CreativePro Studio',
      'DrawPro Academy',
      'ArtMaster Classes',
      'CanvasPro Studio',
      'PaintArt Classes',
      'CreativeHome Academy',
    ],
    priceRange: [1000, 5000],
    descriptions: [
      'Drawing, sketching, watercolour, oil painting, and craft activities for all ages.',
      'Fine arts, digital art basics, and examination preparation. Kits provided.',
      'Mixed media, portrait drawing, and mandala art. Kids and adults welcome.',
    ],
  },
  SPOKEN_ENGLISH: {
    names: [
      'SpeakWell Academy',
      'EnglishPro Classes',
      'FluencyHome Training',
      'TalkPro Services',
      'FluentHome Academy',
      'EnglishGuru Classes',
      'VoicePro Training',
    ],
    priceRange: [1000, 5000],
    descriptions: [
      'Grammar correction, pronunciation, and conversation fluency. Corporate and personal coaching.',
      'Interview preparation, presentation skills, and accent neutralisation.',
      'IELTS, TOEFL, and daily communication coaching for students and professionals.',
    ],
  },
  COMPUTER_CLASSES: {
    names: [
      'TechHome Classes',
      'ComputerPro Academy',
      'DigiLearn Institute',
      'TechTutor Services',
      'DigiHome Academy',
      'TechMaster Classes',
      'DigiPro Institute',
    ],
    priceRange: [1000, 5000],
    descriptions: [
      'MS Office, internet basics, Tally, DTP, and programming for beginners and professionals.',
      'School and college level IT coaching, typing, and graphic design basics.',
      'Python, HTML, Excel, and operating system training. All age groups welcome.',
    ],
  },
  CAR_WASHING: {
    names: [
      'ShineWash Auto',
      'SparkCar Wash',
      'GlossWash Services',
      'AutoShine Pro',
      'CarSpa Detailing',
      'WashPro Auto',
      'DetailPro Car Care',
    ],
    priceRange: [300, 1500],
    descriptions: [
      'Exterior wash, interior vacuuming, dashboard polishing, and tyre dressing. Doorstep service available.',
      'Steam wash, foam wash, and full detailing packages. All car types serviced.',
      'Interior deep cleaning, odour treatment, and paint protection coating available.',
    ],
  },
  BIKE_SERVICE: {
    names: [
      'BikeCarePro Services',
      'SpeedService Moto',
      'MotoFix Pro',
      'BikeZone Services',
      'RideService Pro',
      'TwoWheelPro Service',
      'MotoService Centre',
    ],
    priceRange: [200, 2000],
    descriptions: [
      'Oil change, chain lubrication, brake adjustment, and filter replacement. All brands.',
      'Engine tuning, carburetor cleaning, tyre rotation, and battery check.',
      'Full service, running repairs, and pre-trip checkup. Hero, Bajaj, Honda, Royal Enfield.',
    ],
  },
  PUNCTURE_REPAIR: {
    names: [
      'TyreFix Pro',
      'PuncturePro Services',
      'QuickFix Tyres',
      'TyreHelp Mobile',
      'PatchPro Services',
      'TyreSeal Pro',
      'TyreRescue Services',
    ],
    priceRange: [50, 300],
    descriptions: [
      'Roadside assistance for cars and bikes. Quick patch and tubeless repair. 24/7 available.',
      'Tyre patching, tube replacement, and tyre rotation. Cars, bikes, and scooters.',
      'Puncture fixing, tyre inflation, and rim straightening. Doorstep service.',
    ],
  },
  DRIVING_LESSONS: {
    names: [
      'DriveLearn School',
      'SafeDrivePro Academy',
      'DriveRight Classes',
      'AutoLearn School',
      'RoadReady Driving',
      'DriveMaster Classes',
      'LearnDrive Academy',
    ],
    priceRange: [2000, 8000],
    descriptions: [
      'Car and two-wheeler training for beginners. Licence test preparation included.',
      'Comprehensive car driving course with road safety and traffic rules training.',
      'Automatic and manual car lessons. Flexible timings and female-friendly instructors available.',
    ],
  },
  CAR_MECHANIC: {
    names: [
      'AutoFix Garage',
      'CarMech Pro',
      'SpeedWrench Services',
      'MechPro Auto',
      'CarCare Workshop',
      'AutoTech Garage',
      'WrenchMaster Services',
    ],
    priceRange: [500, 5000],
    descriptions: [
      'Engine repair, oil change, brake service, and suspension repair. All car brands.',
      'On-site and workshop repairs. AC gas refilling, gear box, and transmission work.',
      'Multi-brand car mechanic. Diagnostics, tune-up, and complete overhaul services.',
    ],
  },
  BATTERY_REPLACEMENT: {
    names: [
      'BatteryPro Services',
      'PowerCell Replacement',
      'ChargeMaster Services',
      'BatteryFix Pro',
      'AutoBattery Services',
      'PowerPlus Batteries',
      'CellPro Replacement',
    ],
    priceRange: [500, 4000],
    descriptions: [
      'Car and bike battery replacement. All brands: Exide, Amaron, Bosch, and Luminous.',
      'Home delivery and installation. Old battery exchange and disposal service.',
      'Battery testing, jump start, and emergency replacement available 24/7.',
    ],
  },
  COMPUTER_REPAIR: {
    names: [
      'ComputerFix Pro',
      'PCRepair Services',
      'TechDoc Computer',
      'DesktopFix Pro',
      'ComputerCare Services',
      'PCDoc Repair',
      'TechMend Computer',
    ],
    priceRange: [300, 3000],
    descriptions: [
      'Desktop and PC repair at home. Hardware and software issues, virus removal, and OS installation.',
      'RAM upgrade, hard disk replacement, power supply repair, and data recovery services.',
      'All brands serviced. Networking setup, printer installation, and software support.',
    ],
  },
  LAPTOP_REPAIR: {
    names: [
      'LaptopFix Pro',
      'NotebookCare Services',
      'LaptopDoc Repair',
      'PortablePC Fix',
      'LaptopMend Pro',
      'NotebookFix Services',
      'LaptopCare Tech',
    ],
    priceRange: [500, 4000],
    descriptions: [
      'Screen replacement, keyboard repair, motherboard service, and battery replacement for all brands.',
      'Water damage recovery, overheating fixes, fan replacement, and SSD upgrade.',
      'Dell, HP, Lenovo, Asus, Acer, and Apple MacBook serviced. Data backup before repair.',
    ],
  },
  MOBILE_REPAIR: {
    names: [
      'MobileFix Pro',
      'PhoneDoc Services',
      'ScreenFix Mobile',
      'MobileCare Pro',
      'PhoneMend Services',
      'MobileTech Repair',
      'QuickPhone Fix',
    ],
    priceRange: [200, 3000],
    descriptions: [
      'Screen replacement, battery swap, charging port repair, and software flashing for all brands.',
      'Water damage repair, camera replacement, and speaker fix. Android and iOS devices.',
      'Same-day screen repair for popular models. Genuine parts and 30-day warranty on repairs.',
    ],
  },
  WIFI_SETUP: {
    names: [
      'WiFiSetup Pro',
      'NetConnect Services',
      'RouterPro Setup',
      'WirelessFix Pro',
      'NetConfig Services',
      'WiFiMaster Pro',
      'ConnectTech Services',
    ],
    priceRange: [300, 1500],
    descriptions: [
      'Router installation, WiFi extender setup, and network troubleshooting at home.',
      'Broadband setup, LAN wiring, and WiFi optimisation for better coverage.',
      'All router brands configured. Parental controls, guest network, and security settings.',
    ],
  },
  CCTV_INSTALLATION: {
    names: [
      'SecureCam Pro',
      'CCTV Install Services',
      'SafeEye Solutions',
      'WatchGuard CCTV',
      'SecureVision Pro',
      'CamSetup Services',
      'EyePro CCTV',
    ],
    priceRange: [3000, 15000],
    descriptions: [
      'CCTV camera installation for homes and offices. DVR/NVR setup, remote viewing configuration.',
      'HD and IP camera installation. Cable concealment, night vision setup, and mobile app configuration.',
      'Hikvision, Dahua, and CP Plus cameras installed. Maintenance and AMC packages available.',
    ],
  },
  PHOTOGRAPHY: {
    names: [
      'FramePro Photography',
      'ClickMaster Studio',
      'ShutterPro Services',
      'LensArt Photography',
      'CapturePro Studio',
      'PhotoMaster Services',
      'FrameCapture Pro',
    ],
    priceRange: [3000, 20000],
    descriptions: [
      'Wedding, birthday, naming ceremony, and event photography. Edited photos delivered digitally.',
      'Professional photographer for portfolio, product, and real estate shoots.',
      'Candid and traditional photography. Same-day preview and quick delivery packages.',
    ],
  },
  VIDEOGRAPHY: {
    names: [
      'VideoPro Services',
      'ReelMaster Studio',
      'ShootPro Videography',
      'CinemaPro Services',
      'ReelCapture Studio',
      'VideoMaster Pro',
      'FilmPro Services',
    ],
    priceRange: [5000, 30000],
    descriptions: [
      'Wedding and event videography with cinematic editing. Drone footage available.',
      'Reels, corporate videos, and documentary-style shoots. Full editing and delivery included.',
      'Same-day highlight reels and full event coverage. 4K recording available.',
    ],
  },
  CATERING: {
    names: [
      'TasteMaster Catering',
      'FeastPro Services',
      'FlavorChef Catering',
      'EpicFeast Catering',
      'CaterPro Services',
      'GrandFeast Catering',
      'DishMaster Catering',
    ],
    priceRange: [10000, 100000],
    descriptions: [
      'Event catering for weddings, birthdays, and corporate events. Bengali and multi-cuisine menus.',
      'Full-service catering with setup, serving, and cleanup. Vegetarian and non-vegetarian options.',
      'Live counters, snack stations, and buffet arrangements. Customised menus on request.',
    ],
  },
  TENT_DECORATION: {
    names: [
      'TentPro Decoration',
      'EventDecor Services',
      'CanopyPro Decor',
      'TentMaster Decor',
      'EventSetup Pro',
      'DecorTent Services',
      'CanopyDecor Pro',
    ],
    priceRange: [5000, 50000],
    descriptions: [
      'Wedding and event tent decoration with lighting, drapes, and floral arrangements.',
      'Stage decoration, entrance arches, and seating arrangement for all event sizes.',
      'Traditional and modern decor themes. Full setup and dismantling included.',
    ],
  },
  DJ_SOUND: {
    names: [
      'BeatMaster DJ',
      'SoundPro Events',
      'DJPro Services',
      'RhythmSound Pro',
      'BassLine DJ',
      'SoundMaster Events',
      'NightBeat DJ',
    ],
    priceRange: [5000, 30000],
    descriptions: [
      'DJ and sound system for weddings, birthdays, and parties. LED dance floor available.',
      'Professional sound setup with subwoofers and lighting. All music genres.',
      'Complete DJ package with equipment, operator, and setup. Custom playlist accepted.',
    ],
  },
  EVENT_PLANNING: {
    names: [
      'EventPro Solutions',
      'CelebratePro Services',
      'OccasionMaster Events',
      'EventCraft Pro',
      'FestaPro Services',
      'OccasionPro Events',
      'EventMaster Solutions',
    ],
    priceRange: [10000, 100000],
    descriptions: [
      'End-to-end event planning for weddings, birthdays, and corporate events.',
      'Vendor coordination, venue booking, and on-day management. Stress-free planning.',
      'Themed events, destination weddings, and intimate gatherings expertly managed.',
    ],
  },
  FLOWER_DECORATION: {
    names: [
      'FloralPro Decoration',
      'BloomDecor Services',
      'PetalMaster Decor',
      'FlowerCraft Pro',
      'GarlandPro Services',
      'BloomArt Decoration',
      'FloralMaster Pro',
    ],
    priceRange: [2000, 20000],
    descriptions: [
      'Fresh flower decoration for weddings, pujas, and events. Car decoration included.',
      'Stage backdrop, entrance garlands, and floral centrepieces. Custom designs available.',
      'Seasonal flowers, imported roses, and artificial flower decor on request.',
    ],
  },
  PACKERS_AND_MOVERS: {
    names: [
      'SafeMove Packers',
      'QuickShift Movers',
      'ReliableMove Pro',
      'EasyShift Packers',
      'TrustMove Services',
      'PackRight Movers',
      'SwiftShift Packers',
    ],
    priceRange: [3000, 20000],
    descriptions: [
      'Household relocation with packing, loading, transport, and unpacking. GPS-tracked vehicles.',
      'Local and intercity moving. Furniture disassembly and reassembly included.',
      'Fragile item handling, wardrobe boxes, and insurance coverage for goods in transit.',
    ],
  },
  COURIER_PICKUP: {
    names: [
      'QuickCourier Pro',
      'PickupExpress Services',
      'SpeedCourier Pro',
      'DoorCourier Services',
      'FastPickup Pro',
      'CourierMaster Services',
      'ExpressPick Pro',
    ],
    priceRange: [50, 500],
    descriptions: [
      'Doorstep courier pickup for documents and parcels. Same-day and next-day delivery options.',
      'All courier brands: Blue Dart, DTDC, Delhivery, and more. Tracking provided.',
      'Bulk pickup for businesses. Fragile and oversized package handling available.',
    ],
  },
  GOODS_TRANSPORT: {
    names: [
      'CargoMove Pro',
      'GoodsTrans Services',
      'LoadMaster Transport',
      'FreightPro Services',
      'CargoShift Pro',
      'GoodsMover Services',
      'TransPro Cargo',
    ],
    priceRange: [2000, 15000],
    descriptions: [
      'Mini truck and tempo hire for goods transport within city and intercity.',
      'Commercial and household goods transport. Loading and unloading labour provided.',
      'All vehicle sizes available. Furniture, appliances, and bulk goods moved safely.',
    ],
  },
  TILING: {
    names: [
      'TileMaster Pro',
      'FloorTile Services',
      'TileCraft Pro',
      'TileRight Solutions',
      'FloorPro Tiling',
      'TileWorks Services',
      'MasterTile Pro',
    ],
    priceRange: [3000, 30000],
    descriptions: [
      'Floor and wall tiling for bathrooms, kitchens, and living spaces. All tile types.',
      'Tile laying, grout filling, and waterproofing. New installation and re-tiling work.',
      'Anti-skid, designer, and vitrified tile installation. Clean finish guaranteed.',
    ],
  },
  MARBLE_WORK: {
    names: [
      'MarblePro Services',
      'StoneWorks Marble',
      'MarbleCraft Pro',
      'StoneMaster Works',
      'MarbleArt Services',
      'PremiumMarble Pro',
      'MarbleFinish Works',
    ],
    priceRange: [5000, 50000],
    descriptions: [
      'Marble flooring, countertop installation, and staircase work. All marble types.',
      'Marble polishing, crack repair, and restoration services for old flooring.',
      'Italian, Rajasthani, and Indian marble fitted. Waterjet cutting available.',
    ],
  },
  GRANITE_WORK: {
    names: [
      'GranitePro Services',
      'StoneWorks Granite',
      'GraniteCraft Pro',
      'GraniteMaster Works',
      'GraniteFinish Pro',
      'StonePro Granite',
      'GraniteArt Services',
    ],
    priceRange: [5000, 50000],
    descriptions: [
      'Granite kitchen platform, flooring, and bathroom countertop installation.',
      'Granite polishing, edge cutting, and custom size fabrication.',
      'All granite colours and varieties. Stain-resistant coating applied after installation.',
    ],
  },
  FALSE_CEILING: {
    names: [
      'CeilPro Services',
      'FalseCeiling Pro',
      'GypsumMaster Works',
      'InteriorCeil Pro',
      'CeilingCraft Services',
      'GypboardPro Works',
      'DesignCeil Pro',
    ],
    priceRange: [5000, 40000],
    descriptions: [
      'Gypsum and POP false ceiling installation with LED lighting integration.',
      'Designer false ceilings for living rooms, bedrooms, and offices.',
      'Moisture-resistant and fire-rated ceiling panels installed. Maintenance and repair available.',
    ],
  },
  WATERPROOFING: {
    names: [
      'WaterShield Pro',
      'LeakProof Services',
      'WaterStop Solutions',
      'SealMaster Pro',
      'WaterGuard Services',
      'ProofTech Waterproofing',
      'DryShield Pro',
    ],
    priceRange: [3000, 20000],
    descriptions: [
      'Roof, terrace, bathroom, and basement waterproofing. Chemical and membrane treatment.',
      'Crystalline waterproofing, injection grouting, and cementitious coating applied.',
      'Leakage sealing, dampness treatment, and crack injection for walls and floors.',
    ],
  },
  INTERIOR_DESIGN: {
    names: [
      'DesignPro Interiors',
      'SpaceArt Design',
      'InteriorCraft Pro',
      'LivingSpace Design',
      'DesignMaster Pro',
      'SpacePro Interiors',
      'ArtisanDesign Pro',
    ],
    priceRange: [10000, 200000],
    descriptions: [
      'Complete interior design for homes and offices. 2D/3D visualisation provided before execution.',
      'Modular furniture, false ceiling, lighting design, and wall treatment solutions.',
      'Budget-friendly to luxury interiors. Project management and vendor coordination included.',
    ],
  },
  CIVIL_CONTRACTOR: {
    names: [
      'CivilPro Contractors',
      'BuildRight Services',
      'StructurePro Works',
      'CivilMaster Builders',
      'BuildPro Contractors',
      'FoundationPro Works',
      'CivilCraft Services',
    ],
    priceRange: [20000, 500000],
    descriptions: [
      'Residential and commercial construction, extension work, and structural repairs.',
      'RCC work, brick masonry, plastering, and finishing for new and renovation projects.',
      'Site supervision, BOQ preparation, and quality construction. Licensed contractors.',
    ],
  },
  HOUSE_RENOVATION: {
    names: [
      'RenovatePro Services',
      'HomeRebuild Pro',
      'RenovMaster Works',
      'HouseRenew Pro',
      'RenovCraft Services',
      'RebuildPro Works',
      'HomeFresh Renovation',
    ],
    priceRange: [30000, 500000],
    descriptions: [
      'Complete home renovation including flooring, painting, electrical, plumbing, and carpentry.',
      'Kitchen and bathroom renovation with supply of all materials and skilled labour.',
      'Turnkey renovation projects. Timely completion and quality guarantee.',
    ],
  },
  MODULAR_KITCHEN: {
    names: [
      'KitchenMod Pro',
      'ModularKitchen Works',
      'KitchenCraft Pro',
      'KitchenDesign Pro',
      'ModKitchen Services',
      'KitchenMaster Works',
      'FitKitchen Pro',
    ],
    priceRange: [30000, 300000],
    descriptions: [
      'Modular kitchen design and installation. Plywood, HDF, and acrylic finish options.',
      'L-shape, U-shape, and parallel kitchen layouts. Soft-close hardware and quartz platforms.',
      '3D design preview before installation. Countertop, backsplash, and chimney integration.',
    ],
  },
  ALUMINIUM_WORK: {
    names: [
      'AlumPro Works',
      'AluminiumCraft Services',
      'AlumMaster Pro',
      'AlumFrame Works',
      'Aluminium Solutions',
      'AlumFit Pro',
      'MetalCraft Aluminium',
    ],
    priceRange: [5000, 50000],
    descriptions: [
      'Aluminium windows, doors, partitions, and railings. Anodised and powder-coated finishes.',
      'Sliding windows, casement doors, and shopfront aluminium work.',
      'Heavy-duty aluminium fabrication. Curtain wall and composite panel cladding available.',
    ],
  },
  GLASS_WORK: {
    names: [
      'GlassPro Works',
      'CrystalCraft Services',
      'GlassMaster Pro',
      'GlassArt Works',
      'TransGlass Pro',
      'GlassFit Services',
      'ClearView Glass',
    ],
    priceRange: [3000, 30000],
    descriptions: [
      'Glass partitions, shower enclosures, glass doors, and balcony railings.',
      'Toughened, frosted, and laminated glass work. Broken glass replacement.',
      'Spider glazing, mirror fitting, and decorative glass panel installation.',
    ],
  },
  WELDING: {
    names: [
      'WeldPro Services',
      'IronCraft Welding',
      'WeldMaster Pro',
      'FabricWeld Services',
      'SteelPro Welding',
      'WeldRight Services',
      'MetalFab Welding',
    ],
    priceRange: [500, 5000],
    descriptions: [
      'MS gate, grill, and railing fabrication and welding. Stainless steel work.',
      'Arc and MIG welding for structural and decorative metalwork. Repairs included.',
      'Mobile welding service at site. Ladder, loft, and furniture frame welding.',
    ],
  },
  BOREWELL_SERVICE: {
    names: [
      'BorewellPro Services',
      'DrillMaster Borewell',
      'WaterBore Pro',
      'BorewellTech Services',
      'GroundWater Pro',
      'BoreDrill Services',
      'WellDig Pro',
    ],
    priceRange: [5000, 30000],
    descriptions: [
      'New borewell drilling and pump installation. Groundwater survey available.',
      'Borewell deepening, cleaning, and compressor flushing services.',
      'Submersible pump fitting, pipe replacement, and motor repair for borewells.',
    ],
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

function randInt(min: number, max: number, rand: () => number): number {
  return Math.round(min + rand() * (max - min));
}

function randomCoord(base: number, radius: number, rand: () => number): number {
  const delta = (rand() - 0.5) * 2 * radius;
  return parseFloat((base + delta).toFixed(6));
}

// ─── Main generator ───────────────────────────────────────────────────────────
function generateListings(count: number = 5000, seed: number = 42): Listing[] {
  const rand = seededRandom(seed);
  const serviceTypes = Object.keys(SERVICE_META) as ServiceType[];
  const listings: Listing[] = [];

  // To satisfy "≥5 of same service type in same/nearby location",
  // we batch 5–8 same-service listings per location before moving on.
  let i = 0;
  while (listings.length < count) {
    const serviceType = pick(serviceTypes, rand);
    const location = pick(BASE_LOCATIONS, rand);
    const meta = SERVICE_META[serviceType];
    const clusterSize = 5 + Math.floor(rand() * 4); // 5–8 per cluster

    for (let j = 0; j < clusterSize && listings.length < count; j++) {
      const name = pick(meta.names, rand);
      const description = pick(meta.descriptions, rand);
      const price = randInt(meta.priceRange[0], meta.priceRange[1], rand);
      const lat = randomCoord(location.lat, 0.012, rand); // ~1.3 km radius
      const lng = randomCoord(location.lng, 0.015, rand);

      listings.push([name, description, serviceType, price, [lng, lat]]);
      i++;
    }
  }

  return listings;
}

export { generateListings };
// ─── Usage ────────────────────────────────────────────────────────────────────
// import { generateListings } from './listingsGenerator';
// const LISTINGS_DATA = generateListings(5000);
