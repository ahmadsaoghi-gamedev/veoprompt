// ASMR Slice Prompt Generator
// Anti-mainstream cinematic slice prompt generation for Veo3

export interface ASMRSliceResult {
    version: string;
    mode: 'asmr' | 'epic';
    prompt: string;
    meta: {
        word_count: number;
        camera: string;
        lighting: string;
        must_have: {
            cutting_board: boolean;
            black_background: boolean;
            gloves_and_knife: boolean;
        };
        fx: string[];
        pacing: string;
        transition: string;
        sound_design: string[];
    };
    files_used: {
        used: boolean;
        ids: string[];
        notice: string;
    };
}

// Epic mode keywords
const EPIC_KEYWORDS = [
    'planet', 'planets', 'universe', 'explosion', 'explosions', 'sun', 'lightning',
    'apocalypse', 'slam', 'crash', 'destroy', 'destruction', 'bomb', 'nuclear',
    'asteroid', 'meteor', 'volcano', 'earthquake', 'tsunami', 'storm', 'hurricane',
    'fire', 'flame', 'lava', 'magma', 'thunder', 'blast', 'impact', 'collision'
];

// Creative ASMR reveal templates - anti-mainstream and spectacular
const ASMR_REVEALS = [
    'hidden galaxies swirling with cosmic dust',
    'glowing crystalline veins pulsing with energy',
    'collapsing cities made of liquid light',
    'bioluminescent oceans teeming with alien life',
    'crystalline interiors reflecting infinite dimensions',
    'neural networks of pure energy',
    'fractal patterns of living geometry',
    'aurora cores dancing with plasma storms',
    'diamond rain cascading through void',
    'molten oceans of liquid starlight',
    'quantum foam bubbling with reality',
    'time crystals forming temporal loops',
    'dark matter webs connecting dimensions',
    'stellar nurseries birthing new worlds',
    'black hole accretion disks of pure energy',
    'living organisms made of pure light',
    'floating islands with waterfalls of stardust',
    'crystal cities with inhabitants of energy',
    'bioluminescent forests with glowing creatures',
    'underwater civilizations with mermaid-like beings',
    'volcanic cores with fire elementals dancing',
    'ice crystals containing frozen time itself',
    'magnetic fields forming living patterns',
    'sound waves made visible as rippling energy',
    'gravity wells with floating debris and light'
];

// Creative object-specific reveals - anti-mainstream and spectacular
const OBJECT_SPECIFIC_REVEALS = {
    earth: [
        'ancient civilizations with glowing crystal cities and energy beings',
        'bioluminescent underground oceans with mermaid-like creatures',
        'floating islands with waterfalls of liquid light',
        'crystal caves with living organisms made of pure energy',
        'magnetic fields forming living patterns and energy creatures',
        'volcanic cores with fire elementals dancing in molten light',
        'ice crystals containing frozen time itself with temporal beings',
        'underground forests with glowing tree spirits and light creatures'
    ],
    moon: [
        'hidden lunar cities with crystalline inhabitants',
        'moon dust forming living patterns and energy beings',
        'crater lakes filled with liquid starlight and cosmic creatures',
        'lunar caves with bioluminescent organisms and light spirits',
        'moon rocks containing frozen galaxies and stellar nurseries',
        'lunar regolith forming living geometric patterns',
        'moon craters revealing underground crystal civilizations',
        'lunar surface with floating energy orbs and cosmic entities'
    ],
    banana: [
        'banana pulp revealing tropical paradise with floating islands',
        'banana seeds containing miniature rainforests with glowing creatures',
        'banana fibers forming living patterns and energy beings',
        'banana interior with bioluminescent organisms and light spirits',
        'banana cells containing microscopic tropical worlds',
        'banana texture revealing hidden geometric patterns and energy flows',
        'banana core with floating tropical creatures and light entities',
        'banana flesh containing living tropical ecosystems'
    ],
    forest: [
        'tree rings revealing ancient forest spirits and energy beings',
        'wood grain forming living patterns and bioluminescent creatures',
        'tree sap containing floating forest entities and light spirits',
        'wood fibers revealing hidden forest worlds and glowing organisms',
        'tree cells containing miniature forest ecosystems with light creatures',
        'wood texture forming living geometric patterns and energy flows',
        'tree core with floating forest spirits and bioluminescent entities',
        'wood interior containing living forest civilizations'
    ],
    wave: [
        'wave interior revealing underwater civilizations with mermaid-like beings',
        'water molecules forming living patterns and energy creatures',
        'wave core containing floating aquatic entities and light spirits',
        'water particles revealing hidden ocean worlds and glowing organisms',
        'wave structure containing miniature underwater ecosystems',
        'water texture forming living geometric patterns and energy flows',
        'wave center with floating sea spirits and bioluminescent entities',
        'water interior containing living aquatic civilizations'
    ],
    sun: [
        'solar core revealing plasma beings and fire elementals',
        'sun surface containing floating energy creatures and light spirits',
        'solar flares forming living patterns and energy beings',
        'sun interior with bioluminescent organisms and cosmic entities',
        'solar particles containing miniature stellar worlds',
        'sun texture revealing hidden geometric patterns and energy flows',
        'solar center with floating fire spirits and plasma entities',
        'sun core containing living stellar civilizations'
    ],
    diamond: [
        'diamond interior revealing crystal cities with energy inhabitants',
        'crystal facets containing floating geometric beings and light spirits',
        'diamond structure forming living patterns and energy creatures',
        'crystal core with bioluminescent organisms and light entities',
        'diamond cells containing miniature crystal worlds',
        'crystal texture revealing hidden geometric patterns and energy flows',
        'diamond center with floating crystal spirits and energy beings',
        'crystal interior containing living geometric civilizations'
    ],
    apple: [
        'apple core revealing miniature orchards with glowing fruit spirits',
        'apple seeds containing floating garden entities and light beings',
        'apple flesh forming living patterns and bioluminescent creatures',
        'apple interior with floating fruit spirits and energy entities',
        'apple cells containing microscopic garden worlds with light creatures',
        'apple texture revealing hidden organic patterns and energy flows',
        'apple center with floating garden spirits and bioluminescent entities',
        'apple core containing living orchard civilizations'
    ],
    orange: [
        'orange interior revealing citrus paradises with glowing fruit beings',
        'orange segments containing floating tropical entities and light spirits',
        'orange pulp forming living patterns and bioluminescent creatures',
        'orange core with floating citrus spirits and energy entities',
        'orange cells containing miniature tropical worlds with light creatures',
        'orange texture revealing hidden organic patterns and energy flows',
        'orange center with floating tropical spirits and bioluminescent entities',
        'orange interior containing living citrus civilizations'
    ],
    watermelon: [
        'watermelon interior revealing summer paradises with glowing fruit beings',
        'watermelon seeds containing floating garden entities and light spirits',
        'watermelon flesh forming living patterns and bioluminescent creatures',
        'watermelon core with floating summer spirits and energy entities',
        'watermelon cells containing miniature garden worlds with light creatures',
        'watermelon texture revealing hidden organic patterns and energy flows',
        'watermelon center with floating garden spirits and bioluminescent entities',
        'watermelon interior containing living summer civilizations'
    ],
    lightning: [
        'lightning core revealing electrical beings and energy elementals',
        'electrical discharge containing floating energy creatures and light spirits',
        'lightning structure forming living patterns and energy beings',
        'electrical core with bioluminescent organisms and cosmic entities',
        'lightning particles containing miniature electrical worlds',
        'electrical texture revealing hidden energy patterns and power flows',
        'lightning center with floating electrical spirits and energy beings',
        'electrical interior containing living energy civilizations'
    ],
    fire: [
        'fire core revealing flame beings and fire elementals',
        'flame structure containing floating fire creatures and light spirits',
        'fire interior forming living patterns and energy beings',
        'flame core with bioluminescent organisms and fire entities',
        'fire particles containing miniature flame worlds',
        'flame texture revealing hidden fire patterns and energy flows',
        'fire center with floating flame spirits and energy beings',
        'flame interior containing living fire civilizations'
    ],
    ice: [
        'ice core revealing frozen beings and ice elementals',
        'ice crystals containing floating frozen creatures and light spirits',
        'ice structure forming living patterns and energy beings',
        'ice core with bioluminescent organisms and frozen entities',
        'ice particles containing miniature frozen worlds',
        'ice texture revealing hidden crystal patterns and energy flows',
        'ice center with floating ice spirits and energy beings',
        'ice interior containing living frozen civilizations'
    ]
};

// Specific object descriptions for realistic appearance
const OBJECT_DESCRIPTIONS = {
    moon: 'realistic moon surface with detailed craters, gray rocky texture, pockmarked surface, lunar regolith, crater rims, dust particles, authentic moon appearance, spherical shape, natural lunar colors',
    earth: 'realistic Earth globe with continents, oceans, clouds, atmospheric layers, blue and green colors, white cloud formations, authentic planet appearance, spherical shape, natural Earth colors',
    planets: 'realistic planetary surface with geological features, atmospheric layers, surface textures, authentic space object appearance, spherical shape, natural planetary colors',
    forest: 'realistic tree cross-section with wood grain, bark texture, growth rings, natural wood colors, organic patterns, authentic tree appearance, natural wood texture',
    ocean: 'realistic water cross-section with liquid properties, blue-green colors, bubbles, fluid dynamics, authentic water appearance, natural water texture',
    diamond: 'realistic crystal structure with geometric facets, transparent clarity, light refraction, authentic gemstone appearance, natural crystal formation',
    lightning: 'realistic electrical discharge with branching patterns, bright white-blue energy, crackling effects, authentic lightning appearance, natural electrical phenomena',
    sun: 'realistic sun surface with solar flares, plasma streams, bright yellow-orange colors, authentic stellar appearance, natural solar phenomena',
    stars: 'realistic star formation with bright points of light, twinkling effects, natural stellar appearance, authentic cosmic phenomena',
    galaxy: 'realistic galaxy with spiral arms, star clusters, cosmic dust, natural galactic appearance, authentic space phenomena',
    meteor: 'realistic meteor with rocky surface, burning trail, natural space rock appearance, authentic meteorite texture',
    comet: 'realistic comet with icy nucleus, glowing tail, natural cometary appearance, authentic space ice formation',
    asteroid: 'realistic asteroid with rocky surface, natural space rock appearance, authentic asteroid texture and shape',
    nebula: 'realistic nebula with colorful gas clouds, star formation, natural cosmic appearance, authentic space phenomena',
    blackhole: 'realistic black hole with event horizon, accretion disk, natural gravitational phenomena, authentic cosmic appearance',
    banana: 'realistic banana with yellow peel, curved shape, natural fruit texture, authentic banana appearance',
    wave: 'realistic ocean wave with blue-green water, foam, natural water texture, authentic wave appearance',
    apple: 'realistic apple with red skin, natural fruit texture, authentic apple appearance',
    orange: 'realistic orange with orange peel, natural citrus texture, authentic orange appearance',
    watermelon: 'realistic watermelon with green rind, red flesh, natural fruit texture, authentic watermelon appearance',
    fire: 'realistic flame with orange-red colors, flickering movement, natural fire texture, authentic flame appearance',
    ice: 'realistic ice crystal with transparent clarity, geometric facets, natural ice texture, authentic crystal appearance',
    rock: 'realistic rock with natural stone texture, authentic geological appearance',
    metal: 'realistic metal with metallic surface, natural metal texture, authentic metallic appearance',
    glass: 'realistic glass with transparent clarity, natural glass texture, authentic glass appearance',
    wood: 'realistic wood with natural grain pattern, authentic wood texture, natural wood appearance',
    paper: 'realistic paper with natural fiber texture, authentic paper appearance',
    plastic: 'realistic plastic with smooth surface, natural plastic texture, authentic plastic appearance',
    fabric: 'realistic fabric with natural fiber texture, authentic fabric appearance',
    leather: 'realistic leather with natural grain pattern, authentic leather texture, natural leather appearance',
    stone: 'realistic stone with natural geological texture, authentic stone appearance',
    sand: 'realistic sand with natural grain texture, authentic sand appearance',
    snow: 'realistic snow with natural crystal texture, authentic snow appearance',
    cloud: 'realistic cloud with natural vapor texture, authentic cloud appearance'
};

// Epic reveal templates
const EPIC_REVEALS = [
    'aurora cores erupting with plasma storms',
    'molten oceans of liquid starlight',
    'diamond rain cascading through void',
    'stellar nurseries birthing new worlds',
    'black hole accretion disks of pure energy',
    'supernova remnants glowing with cosmic fire',
    'neutron star cores pulsing with gravitational waves',
    'quasar jets streaming across the universe',
    'dark matter halos surrounding galactic cores',
    'cosmic web filaments connecting all existence',
    'inflationary bubbles of new universes',
    'wormhole throats opening to parallel dimensions',
    'time dilation fields warping spacetime',
    'quantum foam bubbling with virtual particles',
    'multiverse membranes vibrating with reality'
];

// Camera setups
const CAMERA_SETUPS = {
    asmr: [
        'Macro lens, extreme close-up on hands and cutting board, shallow depth of field, focus on object details',
        'Torso-up framing, focus on arms and hands, exclude head/face explicitly, emphasize object texture',
        'Overhead shot, perpendicular to cutting board, shallow DOF, highlight object surface details',
        'Side angle, profile view of slicing motion, macro focus, capture object cross-section',
        'Low angle, dramatic perspective on cutting action, shallow DOF, emphasize object shape and texture',
        'Close-up macro shot, focus on object surface before slicing, shallow DOF, highlight realistic details',
        'Medium close-up, focus on object and knife interaction, shallow DOF, capture authentic material properties'
    ],
    epic: [
        'Medium shot, torso-up framing with quick cuts to wide establishing shots',
        'Dynamic camera movement, tracking the slice with dramatic angles',
        'Multi-angle coverage, close-up to wide shots with smooth transitions',
        'Cinematic framing, rule of thirds with dramatic perspective',
        'Handheld camera with slight shake for intensity, medium to close-up'
    ]
};

// Lighting setups
const LIGHTING_SETUPS = {
    asmr: [
        'Soft, diffused lighting with warm color temperature, minimal shadows, highlight object surface details',
        'Single key light from above, creating gentle shadows on the board, emphasize object texture',
        'Natural window light simulation, soft and even illumination, reveal object authentic appearance',
        'Warm LED panel lighting, creating smooth gradients, showcase object natural colors',
        'Ambient lighting with subtle rim light on the knife edge, highlight object material properties',
        'Professional studio lighting, even illumination, capture object realistic details',
        'Soft directional lighting, minimal shadows, emphasize object surface characteristics'
    ],
    epic: [
        'Dramatic three-point lighting with high contrast and deep shadows',
        'Cinematic lighting with warm key light and cool fill, dramatic shadows',
        'Dynamic lighting that shifts with the action, high contrast',
        'Theatrical lighting with colored gels, dramatic mood',
        'Explosive lighting with bright flashes and deep shadows'
    ]
};

// Visual effects
const VISUAL_EFFECTS = {
    asmr: [
        'dust clouds', 'glowing shards', 'liquid sprays', 'embers', 'vapor',
        'particle streams', 'crystal fragments', 'light beams', 'energy waves',
        'microscopic details', 'texture reveals', 'surface reflections'
    ],
    epic: [
        'explosive particles', 'shock waves', 'energy blasts', 'debris clouds',
        'plasma streams', 'cosmic rays', 'gravitational waves', 'stellar winds',
        'magnetic fields', 'quantum fluctuations', 'dimensional rifts'
    ]
};

// Sound design
const SOUND_DESIGN = {
    asmr: [
        'glove creak', 'metallic blade whisper', 'crumble', 'drip', 'crackle',
        'texture friction', 'microscopic sounds', 'resonance', 'harmonic vibrations',
        'surface contact', 'material separation', 'ambient textures'
    ],
    epic: [
        'metallic impact', 'atmospheric hiss', 'thunderous crack', 'debris clatter',
        'explosive boom', 'energy discharge', 'cosmic rumble', 'dimensional tear',
        'gravitational pulse', 'stellar wind', 'quantum resonance'
    ]
};

// Pacing options
const PACING_OPTIONS = {
    asmr: [
        'Deliberate slow motion, methodical and meditative',
        'Gentle, rhythmic pacing with natural pauses',
        'Controlled, precise movements with breathing room',
        'Slow, intentional slicing with focus on texture',
        'Meditative tempo, allowing details to emerge naturally'
    ],
    epic: [
        'Rapid cuts building to spectacular slow-motion climax',
        'Dynamic pacing with quick transitions and explosive reveals',
        'High-energy rhythm with dramatic pauses for impact',
        'Intense tempo building to overwhelming spectacle',
        'Explosive pacing with controlled chaos and grandeur'
    ]
};

// Transition options
const TRANSITION_OPTIONS = {
    asmr: [
        'Hard cut to black, leaving mystery and wonder',
        'Fade to reveal, allowing the surprise to sink in',
        'Quick cut with lingering afterimage of the slice',
        'Sharp transition emphasizing the moment of discovery',
        'Clean cut maintaining focus on the revealed interior'
    ],
    epic: [
        'Hard cut to aftermath shot showing the full scope',
        'Explosive transition with particle effects and energy',
        'Dramatic cut revealing the cosmic scale of destruction',
        'Spectacular transition with multiple angle coverage',
        'Epic cut showing the full impact and consequences'
    ]
};

// Generate ASMR slice prompt
export function generateASMRSlicePrompt(userInput: string): ASMRSliceResult {
    const input = userInput.toLowerCase();

    // Auto-detect mode
    const isEpic = EPIC_KEYWORDS.some(keyword => input.includes(keyword));
    const mode: 'asmr' | 'epic' = isEpic ? 'epic' : 'asmr';

    // Generate base elements
    const camera = getRandomElement(CAMERA_SETUPS[mode]);
    const lighting = getRandomElement(LIGHTING_SETUPS[mode]);
    const pacing = getRandomElement(PACING_OPTIONS[mode]);
    const transition = getRandomElement(TRANSITION_OPTIONS[mode]);

    // Generate reveals based on mode
    const reveals = mode === 'asmr' ? ASMR_REVEALS : EPIC_REVEALS;
    const primaryReveal = getRandomElement(reveals);
    const secondaryReveal = getRandomElement(reveals.filter(r => r !== primaryReveal));

    // Generate effects and sound
    const fx = getRandomElements(VISUAL_EFFECTS[mode], 3);
    const soundDesign = getRandomElements(SOUND_DESIGN[mode], 4);

    // Generate the main prompt
    const prompt = generateMainPrompt(userInput, mode, primaryReveal, secondaryReveal, camera, lighting, fx, soundDesign);

    // Count words
    const wordCount = prompt.split(' ').length;

    return {
        version: "1.0",
        mode,
        prompt,
        meta: {
            word_count: wordCount,
            camera,
            lighting,
            must_have: {
                cutting_board: true,
                black_background: true,
                gloves_and_knife: true
            },
            fx,
            pacing,
            transition,
            sound_design: soundDesign
        },
        files_used: {
            used: false,
            ids: [],
            notice: "No file insights found."
        }
    };
}

// Generate the main cinematic prompt
function generateMainPrompt(
    userInput: string,
    mode: 'asmr' | 'epic',
    primaryReveal: string,
    secondaryReveal: string,
    camera: string,
    lighting: string,
    fx: string[],
    soundDesign: string[]
): string {
    // Get specific object description
    const objectKey = userInput.toLowerCase().replace('slice ', '').trim();
    const objectDescription = OBJECT_DESCRIPTIONS[objectKey as keyof typeof OBJECT_DESCRIPTIONS] ||
        `realistic ${objectKey} with authentic surface texture, detailed appearance, natural colors, and realistic material properties`;

    // Get creative reveals for the object
    const creativeReveals = generateCreativeReveals(objectKey);
    const finalPrimaryReveal = getRandomElement(creativeReveals);
    const finalSecondaryReveal = getRandomElement(creativeReveals.filter(r => r !== finalPrimaryReveal));

    if (mode === 'asmr') {
        return `A cinematic ASMR masterpiece unfolds as black-gloved hands approach a ${objectDescription} with surgical precision. ${camera}. ${lighting}. The mirror-polished chef's knife descends in deliberate slow motion, creating a perfect slice through the ${objectKey} that reveals ${finalPrimaryReveal}. ${fx.join(', ')} cascade from the cut as ${soundDesign.join(', ')} fill the audio space. The interior pulses with ${finalSecondaryReveal}, creating a mesmerizing display of otherworldly beauty. Clean wooden cutting board, pure pitch black background, black nitrile gloves, mirror-polished chef's knife. No music, no voice, no captions - pure tactile ASMR perfection. Hard cut to black, leaving mystery and wonder.`;
    } else {
        return `An epic cinematic spectacle begins as the ${objectDescription} is approached with dramatic intensity. ${camera}. ${lighting}. The blade strikes with explosive force, creating a spectacular slice that reveals ${finalPrimaryReveal}. ${fx.join(', ')} erupt from the impact as ${soundDesign.join(', ')} create an immersive soundscape. The interior explodes with ${finalSecondaryReveal}, showcasing the full destructive grandeur of the moment. Quick cuts build to slow-motion glory, capturing every particle and energy burst. Hard cut to aftermath shot showing the full scope.`;
    }
}

// Generate creative reveals for any object
function generateCreativeReveals(objectKey: string): string[] {
    const baseReveals = [
        'hidden worlds with glowing creatures and energy beings',
        'living organisms made of pure light and energy',
        'floating entities with bioluminescent properties',
        'crystal formations with energy inhabitants',
        'microscopic civilizations with light-based life forms',
        'organic patterns forming living geometric structures',
        'energy flows creating living patterns and beings',
        'natural materials revealing hidden life forms'
    ];

    const objectSpecificReveals = OBJECT_SPECIFIC_REVEALS[objectKey as keyof typeof OBJECT_SPECIFIC_REVEALS];

    if (objectSpecificReveals) {
        return objectSpecificReveals;
    }

    // Generate creative reveals for unknown objects
    return baseReveals.map(reveal =>
        `${objectKey} interior revealing ${reveal}`
    );
}

// Helper functions
function getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Enhanced prompt variations for creativity
export function generateVariationPrompt(userInput: string, baseResult: ASMRSliceResult): ASMRSliceResult {
    // Generate a variation by changing some elements
    const variation = { ...baseResult };

    // Change some visual effects
    const newFx = getRandomElements(VISUAL_EFFECTS[baseResult.mode], 3);
    variation.meta.fx = newFx;

    // Change some sound design
    const newSound = getRandomElements(SOUND_DESIGN[baseResult.mode], 4);
    variation.meta.sound_design = newSound;

    // Regenerate prompt with new elements
    const reveals = baseResult.mode === 'asmr' ? ASMR_REVEALS : EPIC_REVEALS;
    const primaryReveal = getRandomElement(reveals);
    const secondaryReveal = getRandomElement(reveals.filter(r => r !== primaryReveal));

    variation.prompt = generateMainPrompt(
        userInput,
        baseResult.mode,
        primaryReveal,
        secondaryReveal,
        baseResult.meta.camera,
        baseResult.meta.lighting,
        newFx,
        newSound
    );

    variation.meta.word_count = variation.prompt.split(' ').length;

    return variation;
}

// Batch generation for multiple variations
export function generateBatchPrompts(userInput: string, count: number = 3): ASMRSliceResult[] {
    const results: ASMRSliceResult[] = [];

    for (let i = 0; i < count; i++) {
        if (i === 0) {
            results.push(generateASMRSlicePrompt(userInput));
        } else {
            results.push(generateVariationPrompt(userInput, results[0]));
        }
    }

    return results;
}
