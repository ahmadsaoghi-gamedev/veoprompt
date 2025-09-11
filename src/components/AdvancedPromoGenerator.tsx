// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ShoppingBag, Wand2, Copy, Download, Eye, Brain, Sparkles, Target, Camera, TrendingUp, Zap } from 'lucide-react';
import { getSettings } from '../utils/database';
import { APISettings } from '../types';
import { generateCompleteVeo3Prompt, Veo3SceneConfig } from '../utils/veo3-optimized-prompts';
import { generateProfessionalDialogue, ProfessionalDialogueConfig } from '../utils/professional-dialogue-system';

interface ProductInfo {
    name: string;
    category: string;
    price: string;
    features: string[];
    targetAudience: string;
    uniqueSellingPoint: string;
    brand: string;
    colors: string[];
    sizes: string[];
    materials: string[];
}

interface PromoScene {
    id: string;
    sceneNumber: number;
    duration: number;
    prompt: string;
    purpose: string;
    visualElements: string[];
    audioElements: string[];
    callToAction: string;
    targetEmotion: string;
    productFocus: string;
    customerPainPoint: string;
    solution: string;
    socialProof: string;
    urgency: string;
    platform: string;
}

interface PromoProject {
    id: string;
    title: string;
    businessType: string;
    product: ProductInfo;
    targetPlatform: string;
    targetDuration: number;
    totalScenes: number;
    scenes: PromoScene[];
    brandVoice: string;
    targetDemographics: string;
    budget: string;
    season: string;
    campaignGoal: string;
    createdAt: Date;
    updatedAt: Date;
}

const AdvancedPromoGenerator: React.FC = () => {
    const [currentProject, setCurrentProject] = useState<PromoProject | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [apiSettings, setApiSettings] = useState<APISettings | null>(null);
    const [customChat, setCustomChat] = useState('');

    // Project configuration
    const [projectConfig, setProjectConfig] = useState({
        title: '',
        businessType: 'fashion',
        productName: '',
        productCategory: '',
        price: '',
        features: '',
        targetAudience: 'general',
        uniqueSellingPoint: '',
        brand: '',
        targetPlatform: 'tiktok',
        targetDuration: 24, // 3 scenes x 8 seconds
        brandVoice: 'friendly',
        targetDemographics: 'young-adults',
        budget: 'medium',
        season: 'all-year',
        campaignGoal: 'sales'
    });

    const businessTypes = [
        { value: 'fashion', label: 'Fashion & Clothing', icon: '👕', description: 'Pakaian, aksesoris, sepatu' },
        { value: 'health', label: 'Health & Medicine', icon: '💊', description: 'Obat, suplemen, kesehatan' },
        { value: 'beauty', label: 'Beauty & Cosmetics', icon: '💄', description: 'Kosmetik, skincare, parfum' },
        { value: 'food', label: 'Food & Beverage', icon: '🍔', description: 'Makanan, minuman, kuliner' },
        { value: 'tech', label: 'Technology', icon: '📱', description: 'Gadget, elektronik, aksesoris' },
        { value: 'home', label: 'Home & Living', icon: '🏠', description: 'Furnitur, dekorasi, peralatan rumah' },
        { value: 'sports', label: 'Sports & Fitness', icon: '⚽', description: 'Olahraga, fitness, outdoor' },
        { value: 'education', label: 'Education', icon: '📚', description: 'Kursus, buku, pembelajaran' },
        { value: 'automotive', label: 'Automotive', icon: '🚗', description: 'Mobil, motor, aksesoris' },
        { value: 'jewelry', label: 'Jewelry & Accessories', icon: '💍', description: 'Perhiasan, jam tangan, aksesoris' }
    ];

    const platforms = [
        { value: 'tiktok', label: 'TikTok', description: 'Video vertikal 9:16, musik trending' },
        { value: 'instagram', label: 'Instagram Reels', description: 'Video vertikal, estetika tinggi' },
        { value: 'youtube', label: 'YouTube Shorts', description: 'Video vertikal, durasi fleksibel' },
        { value: 'facebook', label: 'Facebook Video', description: 'Video horizontal/vertikal' },
        { value: 'twitter', label: 'Twitter Video', description: 'Video pendek, viral content' }
    ];

    const brandVoices = [
        { value: 'friendly', label: 'Friendly & Casual', description: 'Ramah, santai, mudah didekati' },
        { value: 'professional', label: 'Professional', description: 'Formal, kredibel, terpercaya' },
        { value: 'energetic', label: 'Energetic & Fun', description: 'Semangat, menyenangkan, dinamis' },
        { value: 'luxury', label: 'Luxury & Premium', description: 'Mewah, eksklusif, high-end' },
        { value: 'trustworthy', label: 'Trustworthy & Reliable', description: 'Dapat dipercaya, konsisten' },
        { value: 'trendy', label: 'Trendy & Modern', description: 'Kekinian, modern, up-to-date' }
    ];

    const targetAudiences = [
        { value: 'teens', label: 'Teens (13-19)', description: 'Remaja, Gen Z' },
        { value: 'young-adults', label: 'Young Adults (20-30)', description: 'Milenial, fresh graduate' },
        { value: 'adults', label: 'Adults (31-45)', description: 'Profesional, keluarga muda' },
        { value: 'middle-aged', label: 'Middle-aged (46-60)', description: 'Mapan, keluarga' },
        { value: 'seniors', label: 'Seniors (60+)', description: 'Lansia, pensiunan' },
        { value: 'general', label: 'General Audience', description: 'Semua kalangan' }
    ];

    const campaignGoals = [
        { value: 'sales', label: 'Increase Sales', description: 'Meningkatkan penjualan' },
        { value: 'awareness', label: 'Brand Awareness', description: 'Meningkatkan kesadaran merek' },
        { value: 'engagement', label: 'Engagement', description: 'Meningkatkan interaksi' },
        { value: 'traffic', label: 'Website Traffic', description: 'Mengarahkan ke website' },
        { value: 'leads', label: 'Lead Generation', description: 'Mendapatkan prospek' },
        { value: 'launch', label: 'Product Launch', description: 'Peluncuran produk baru' }
    ];

    useEffect(() => {
        loadApiSettings();
    }, []);

    const loadApiSettings = async () => {
        try {
            const settings = await getSettings();
            setApiSettings(settings);
        } catch (error) {
            console.error('Failed to load API settings:', error);
        }
    };

    const generatePromoScene = async (sceneNumber: number): Promise<PromoScene> => {
        if (!currentProject) throw new Error('No project loaded');

        console.log(`Creating enhanced Veo3-optimized promo scene ${sceneNumber}`);

        // Create Veo3 scene configuration for promotional content
        const veo3Config: Veo3SceneConfig = {
            sceneNumber,
            totalScenes: currentProject.totalScenes,
            duration: 8,
            genre: 'promotional',
            animationType: 'realistic',
            language: 'indonesian',
            characters: [
                {
                    name: 'Narator',
                    age: '30',
                    personality: 'Professional and trustworthy',
                    appearance: 'Professional presenter appearance',
                    speakingStyle: 'professional',
                    emotionalState: 'confident',
                    position: 'center',
                    clothing: 'business attire'
                },
                {
                    name: 'Pelanggan',
                    age: '25',
                    personality: 'Satisfied customer',
                    appearance: 'Happy and satisfied expression',
                    speakingStyle: 'casual',
                    emotionalState: 'excited',
                    position: 'side',
                    clothing: 'casual attire'
                }
            ],
            storyContext: `${projectConfig.productName} - ${projectConfig.businessType} promotion`,
            previousScene: undefined
        };

        // Generate professional promotional dialogue
        const dialogueConfig: ProfessionalDialogueConfig = {
            characters: [
                {
                    name: 'Narator',
                    age: '30',
                    personality: 'Professional and trustworthy',
                    speakingStyle: 'professional',
                    emotionalState: 'confident',
                    backstory: 'Professional presenter',
                    relationships: {},
                    characterArc: 'Build trust and credibility',
                    voiceCharacteristics: 'Clear and authoritative'
                },
                {
                    name: 'Pelanggan',
                    age: '25',
                    personality: 'Satisfied customer',
                    speakingStyle: 'casual',
                    emotionalState: 'excited',
                    backstory: 'Happy customer',
                    relationships: {},
                    characterArc: 'Share positive experience',
                    voiceCharacteristics: 'Enthusiastic and genuine'
                }
            ],
            sceneContext: `${projectConfig.productName} promotion`,
            genre: 'promotional',
            language: 'indonesian',
            duration: 8,
            emotionalArc: sceneNumber === 1 ? 'opening' : sceneNumber === currentProject.totalScenes ? 'resolution' : 'development',
            previousDialogue: undefined
        };

        const professionalDialogue = generateProfessionalDialogue(dialogueConfig);

        // Generate Veo3-optimized prompt
        const veo3Prompt = generateCompleteVeo3Prompt(veo3Config, professionalDialogue.dialogue);

        // Generate professional promotional content based on scene number and business context
        let purpose = "";
        let callToAction = "";
        let targetEmotion = "";
        let productFocus = "";
        let customerPainPoint = "";
        let solution = "";
        let socialProof = "";
        let urgency = "";
        let visualElements = [];
        let audioElements = [];

        // Generate content based on scene number and business type
        if (sceneNumber === 1) {
            // Opening scene - Hook and problem identification
            purpose = "Menangkap perhatian dan mengidentifikasi masalah pelanggan";
            callToAction = "Tonton sampai selesai untuk solusi terbaik!";
            targetEmotion = "Curiosity dan concern";
            productFocus = "Memperkenalkan produk dan manfaat utamanya";
            customerPainPoint = `Masalah yang dihadapi ${projectConfig.targetAudience} terkait ${projectConfig.productCategory}`;
            solution = `${projectConfig.productName} adalah solusi terbaik untuk mengatasi masalah ini`;
            socialProof = "Digunakan oleh ribuan pelanggan puas";
            urgency = "Jangan lewatkan kesempatan ini!";

            visualElements = [
                "Close-up wajah pelanggan yang frustasi",
                "Tampilan produk dengan highlight",
                "Text overlay dengan statistik masalah",
                "Brand logo dan tagline"
            ];

            audioElements = [
                "Narator: 'Apakah Anda pernah mengalami masalah dengan...'",
                "Background music yang menarik perhatian",
                "Sound effect untuk emphasis",
                "Voice over yang profesional"
            ];
        } else if (sceneNumber === 2) {
            // Development scene - Product demonstration and benefits
            purpose = "Mendemonstrasikan produk dan manfaat yang jelas";
            callToAction = "Dapatkan sekarang dengan harga spesial!";
            targetEmotion = "Interest dan desire";
            productFocus = "Menampilkan fitur-fitur unggulan produk";
            customerPainPoint = "Kebutuhan akan solusi yang efektif dan terpercaya";
            solution = `${projectConfig.productName} memberikan solusi lengkap dengan ${projectConfig.features}`;
            socialProof = "Testimoni pelanggan yang puas";
            urgency = "Harga promo terbatas!";

            visualElements = [
                "Demonstrasi produk dalam aksi",
                "Split screen before/after",
                "Highlight fitur-fitur utama",
                "Harga dan promo yang mencolok"
            ];

            audioElements = [
                "Narator: 'Lihat bagaimana ${projectConfig.productName} bekerja...'",
                "Testimoni pelanggan: 'Saya sangat puas dengan hasilnya!'",
                "Background music yang upbeat",
                "Sound effect untuk demonstrasi"
            ];
        } else {
            // Closing scene - Call to action and urgency
            purpose = "Mendorong aksi pembelian dengan urgency dan social proof";
            callToAction = "Pesan sekarang sebelum kehabisan!";
            targetEmotion = "Urgency dan FOMO (Fear of Missing Out)";
            productFocus = "Menekankan keunggulan dan nilai produk";
            customerPainPoint = "Ketakutan kehilangan kesempatan terbaik";
            solution = `${projectConfig.productName} adalah investasi terbaik untuk masa depan Anda`;
            socialProof = "Bergabunglah dengan ribuan pelanggan yang sudah merasakan manfaatnya";
            urgency = "Stok terbatas! Harga promo hanya hari ini!";

            visualElements = [
                "Countdown timer atau stok terbatas",
                "Logo brand dan contact information",
                "Testimoni dan review pelanggan",
                "Call-to-action button yang mencolok"
            ];

            audioElements = [
                "Narator: 'Jangan sampai kehabisan! Pesan sekarang!'",
                "Multiple testimoni: 'Produk terbaik yang pernah saya gunakan!'",
                "Background music yang urgent",
                "Sound effect untuk call-to-action"
            ];
        }

        // Use professional dialogue instead of basic promo dialogue
        const promoDialogues = professionalDialogue.dialogue;

        return {
            id: `scene_${sceneNumber}_${Date.now()}`,
            sceneNumber: sceneNumber,
            duration: 8,
            prompt: veo3Prompt.visualPrompt,
            purpose: purpose,
            visualElements: visualElements,
            audioElements: [...audioElements, ...promoDialogues],
            callToAction: callToAction,
            targetEmotion: targetEmotion,
            productFocus: productFocus,
            customerPainPoint: customerPainPoint,
            solution: solution,
            socialProof: socialProof,
            urgency: urgency,
            platform: projectConfig.targetPlatform
        };
    };

    const createNewProject = async () => {
        // No longer requires API settings for direct generation

        if (!projectConfig.title.trim() || !projectConfig.productName.trim()) {
            alert('Please enter project title and product name.');
            return;
        }

        setIsGenerating(true);
        try {
            // Business type is now integrated into scene generation

            const product: ProductInfo = {
                name: projectConfig.productName,
                category: projectConfig.productCategory,
                price: projectConfig.price,
                features: projectConfig.features.split(',').map(f => f.trim()).filter(f => f),
                targetAudience: projectConfig.targetAudience,
                uniqueSellingPoint: projectConfig.uniqueSellingPoint,
                brand: projectConfig.brand,
                colors: [],
                sizes: [],
                materials: []
            };

            const project: PromoProject = {
                id: `promo_${Date.now()}`,
                title: projectConfig.title,
                businessType: projectConfig.businessType,
                product,
                targetPlatform: projectConfig.targetPlatform,
                targetDuration: projectConfig.targetDuration,
                totalScenes: Math.ceil(projectConfig.targetDuration / 8),
                scenes: [],
                brandVoice: projectConfig.brandVoice,
                targetDemographics: projectConfig.targetDemographics,
                budget: projectConfig.budget,
                season: projectConfig.season,
                campaignGoal: projectConfig.campaignGoal,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            setCurrentProject(project);
        } catch (error) {
            console.error('Failed to create project:', error);
            alert('Failed to create project');
        } finally {
            setIsGenerating(false);
        }
    };

    const generateNextScene = async () => {
        if (!currentProject) return;

        setIsGenerating(true);
        try {
            const newScene = await generatePromoScene(currentProject.scenes.length + 1);

            setCurrentProject(prev => prev ? {
                ...prev,
                scenes: [...prev.scenes, newScene],
                updatedAt: new Date()
            } : null);
        } catch (error) {
            console.error('Failed to generate scene:', error);
            alert('Failed to generate scene');
        } finally {
            setIsGenerating(false);
        }
    };

    const generateAllScenes = async () => {
        if (!currentProject) return;

        setIsGenerating(true);
        try {
            const allScenes: PromoScene[] = [];

            // Generate all scenes with enhanced Veo3 optimization
            for (let i = 1; i <= currentProject.totalScenes; i++) {
                const newScene = await generatePromoScene(i);
                allScenes.push(newScene);

                // Update progress
                setCurrentProject(prev => prev ? {
                    ...prev,
                    scenes: [...allScenes],
                    updatedAt: new Date()
                } : null);

                // Small delay for visual effect
                if (i < currentProject.totalScenes) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }

            alert(`All ${allScenes.length} scenes generated successfully with Veo3 optimization!`);

            setCurrentProject(prev => prev ? {
                ...prev,
                scenes: allScenes,
                updatedAt: new Date()
            } : null);
        } catch (error) {
            console.error('Failed to generate all scenes:', error);
            alert('Failed to generate all scenes');
        } finally {
            setIsGenerating(false);
        }
    };

    const copySceneAsJSON = (scene: PromoScene) => {
        const jsonOutput = {
            sceneNumber: scene.sceneNumber,
            duration: scene.duration,
            prompt: scene.prompt,
            purpose: scene.purpose,
            visualElements: scene.visualElements,
            audioElements: scene.audioElements,
            callToAction: scene.callToAction,
            targetEmotion: scene.targetEmotion,
            productFocus: scene.productFocus,
            customerPainPoint: scene.customerPainPoint,
            solution: scene.solution,
            socialProof: scene.socialProof,
            urgency: scene.urgency,
            platform: scene.platform
        };

        navigator.clipboard.writeText(JSON.stringify(jsonOutput, null, 2));
        alert('Scene (JSON format) copied to clipboard!');
    };

    const exportProject = () => {
        if (!currentProject) return;

        const exportData = {
            ...currentProject,
            exportedAt: new Date().toISOString(),
            totalDuration: currentProject.scenes.reduce((acc, scene) => acc + scene.duration, 0),
            customChat: customChat
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentProject.title.replace(/\s+/g, '_')}_promo_project.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-6">
            <Helmet>
                <title>Advanced Promo Generator - AI-Powered Video Marketing - Shabira Prompt Lab</title>
                <meta name="description" content="Create powerful promotional videos for any business type with AI. Generate scene-by-scene content for TikTok, Instagram, and more." />
                <meta name="keywords" content="promo generator, video marketing, TikTok ads, Instagram reels, business promotion, AI marketing" />
            </Helmet>

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                        <ShoppingBag className="w-12 h-12 text-pink-400" />
                        Advanced Promo Generator
                    </h1>
                    <p className="text-xl text-pink-200">
                        Create Powerful Promotional Videos for Any Business Type
                    </p>
                </div>

                {!currentProject ? (
                    /* Project Setup */
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                        <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                            <Wand2 className="w-8 h-8 text-pink-400" />
                            Create New Promotional Campaign
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Basic Info */}
                            <div className="md:col-span-2">
                                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                    <Target className="w-5 h-5" />
                                    Campaign Information
                                </h3>
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-2">Campaign Title</label>
                                <input
                                    type="text"
                                    value={projectConfig.title}
                                    onChange={(e) => setProjectConfig({ ...projectConfig, title: e.target.value })}
                                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300"
                                    placeholder="e.g., Summer Fashion Collection 2024"
                                />
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-2">Business Type</label>
                                <select
                                    value={projectConfig.businessType}
                                    onChange={(e) => setProjectConfig({ ...projectConfig, businessType: e.target.value })}
                                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white"
                                >
                                    {businessTypes.map(type => (
                                        <option key={type.value} value={type.value} className="bg-slate-800">
                                            {type.icon} {type.label} - {type.description}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-2">Product Name</label>
                                <input
                                    type="text"
                                    value={projectConfig.productName}
                                    onChange={(e) => setProjectConfig({ ...projectConfig, productName: e.target.value })}
                                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300"
                                    placeholder="e.g., Premium Running Shoes"
                                />
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-2">Product Category</label>
                                <input
                                    type="text"
                                    value={projectConfig.productCategory}
                                    onChange={(e) => setProjectConfig({ ...projectConfig, productCategory: e.target.value })}
                                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300"
                                    placeholder="e.g., Athletic Footwear"
                                />
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-2">Price Range</label>
                                <input
                                    type="text"
                                    value={projectConfig.price}
                                    onChange={(e) => setProjectConfig({ ...projectConfig, price: e.target.value })}
                                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300"
                                    placeholder="e.g., Rp 299.000 - Rp 599.000"
                                />
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-2">Key Features</label>
                                <input
                                    type="text"
                                    value={projectConfig.features}
                                    onChange={(e) => setProjectConfig({ ...projectConfig, features: e.target.value })}
                                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300"
                                    placeholder="e.g., Waterproof, Lightweight, Comfortable"
                                />
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-2">Unique Selling Point</label>
                                <input
                                    type="text"
                                    value={projectConfig.uniqueSellingPoint}
                                    onChange={(e) => setProjectConfig({ ...projectConfig, uniqueSellingPoint: e.target.value })}
                                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300"
                                    placeholder="e.g., 30-day money-back guarantee"
                                />
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-2">Brand Name</label>
                                <input
                                    type="text"
                                    value={projectConfig.brand}
                                    onChange={(e) => setProjectConfig({ ...projectConfig, brand: e.target.value })}
                                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300"
                                    placeholder="e.g., Nike, Adidas, Local Brand"
                                />
                            </div>

                            {/* Platform & Audience */}
                            <div className="md:col-span-2">
                                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5" />
                                    Platform & Target Audience
                                </h3>
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-2">Target Platform</label>
                                <select
                                    value={projectConfig.targetPlatform}
                                    onChange={(e) => setProjectConfig({ ...projectConfig, targetPlatform: e.target.value })}
                                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white"
                                >
                                    {platforms.map(platform => (
                                        <option key={platform.value} value={platform.value} className="bg-slate-800">
                                            {platform.label} - {platform.description}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-2">Target Audience</label>
                                <select
                                    value={projectConfig.targetAudience}
                                    onChange={(e) => setProjectConfig({ ...projectConfig, targetAudience: e.target.value })}
                                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white"
                                >
                                    {targetAudiences.map(audience => (
                                        <option key={audience.value} value={audience.value} className="bg-slate-800">
                                            {audience.label} - {audience.description}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-2">Brand Voice</label>
                                <select
                                    value={projectConfig.brandVoice}
                                    onChange={(e) => setProjectConfig({ ...projectConfig, brandVoice: e.target.value })}
                                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white"
                                >
                                    {brandVoices.map(voice => (
                                        <option key={voice.value} value={voice.value} className="bg-slate-800">
                                            {voice.label} - {voice.description}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-2">Campaign Goal</label>
                                <select
                                    value={projectConfig.campaignGoal}
                                    onChange={(e) => setProjectConfig({ ...projectConfig, campaignGoal: e.target.value })}
                                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white"
                                >
                                    {campaignGoals.map(goal => (
                                        <option key={goal.value} value={goal.value} className="bg-slate-800">
                                            {goal.label} - {goal.description}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-2">Target Duration (seconds)</label>
                                <input
                                    type="number"
                                    value={projectConfig.targetDuration}
                                    onChange={(e) => setProjectConfig({ ...projectConfig, targetDuration: parseInt(e.target.value) })}
                                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white"
                                    min="8"
                                    step="8"
                                />
                                <p className="text-pink-200 text-sm mt-1">
                                    {Math.ceil(projectConfig.targetDuration / 8)} scenes × 8 seconds each
                                </p>
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-2">Season/Campaign Period</label>
                                <select
                                    value={projectConfig.season}
                                    onChange={(e) => setProjectConfig({ ...projectConfig, season: e.target.value })}
                                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white"
                                >
                                    <option value="all-year" className="bg-slate-800">All Year Round</option>
                                    <option value="spring" className="bg-slate-800">Spring</option>
                                    <option value="summer" className="bg-slate-800">Summer</option>
                                    <option value="autumn" className="bg-slate-800">Autumn</option>
                                    <option value="winter" className="bg-slate-800">Winter</option>
                                    <option value="holiday" className="bg-slate-800">Holiday Season</option>
                                    <option value="back-to-school" className="bg-slate-800">Back to School</option>
                                </select>
                            </div>

                            {/* Custom Chat Input */}
                            <div className="md:col-span-2">
                                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                    <Zap className="w-5 h-5" />
                                    Custom Instructions (Optional)
                                </h3>
                                <textarea
                                    value={customChat}
                                    onChange={(e) => setCustomChat(e.target.value)}
                                    className="w-full h-24 p-4 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 resize-none"
                                    placeholder="Enter any specific instructions, ideas, or requirements for your promotional video..."
                                />
                            </div>
                        </div>

                        <button
                            onClick={createNewProject}
                            disabled={isGenerating || !projectConfig.title.trim() || !projectConfig.productName.trim()}
                            className="mt-8 w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold py-4 px-8 rounded-xl hover:from-pink-700 hover:to-purple-700 disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {isGenerating ? (
                                <>
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Creating Campaign...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-6 h-6" />
                                    Create Promotional Campaign
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    /* Campaign Production Interface */
                    <div className="space-y-6">
                        {/* Campaign Header */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-3xl font-bold text-white">{currentProject.title}</h2>
                                    <p className="text-pink-200">{businessTypes.find(bt => bt.value === currentProject.businessType)?.label} • {currentProject.targetPlatform.toUpperCase()}</p>
                                    <p className="text-sm text-gray-300">
                                        {currentProject.scenes.length} / {currentProject.totalScenes} scenes •
                                        {currentProject.scenes.reduce((acc, scene) => acc + scene.duration, 0)} / {currentProject.targetDuration} seconds
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={exportProject}
                                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                                    >
                                        <Download className="w-4 h-4" />
                                        Export
                                    </button>
                                    <button
                                        onClick={() => setCurrentProject(null)}
                                        className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                                    >
                                        <Wand2 className="w-4 h-4" />
                                        New Campaign
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Product Information */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                                <ShoppingBag className="w-6 h-6 text-pink-400" />
                                Product Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <span className="text-pink-300 font-semibold">Product:</span>
                                    <p className="text-gray-300">{currentProject.product.name}</p>
                                </div>
                                <div>
                                    <span className="text-pink-300 font-semibold">Category:</span>
                                    <p className="text-gray-300">{currentProject.product.category}</p>
                                </div>
                                <div>
                                    <span className="text-pink-300 font-semibold">Price:</span>
                                    <p className="text-gray-300">{currentProject.product.price}</p>
                                </div>
                                <div>
                                    <span className="text-pink-300 font-semibold">Brand:</span>
                                    <p className="text-gray-300">{currentProject.product.brand}</p>
                                </div>
                                <div>
                                    <span className="text-pink-300 font-semibold">Target Audience:</span>
                                    <p className="text-gray-300">{currentProject.product.targetAudience}</p>
                                </div>
                                <div>
                                    <span className="text-pink-300 font-semibold">USP:</span>
                                    <p className="text-gray-300">{currentProject.product.uniqueSellingPoint}</p>
                                </div>
                            </div>
                        </div>

                        {/* Scene Generation */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <Camera className="w-6 h-6 text-pink-400" />
                                    Promotional Scenes ({currentProject.scenes.length})
                                </h3>
                                <div className="flex gap-3">
                                    <button
                                        onClick={generateNextScene}
                                        disabled={isGenerating || !apiSettings?.isActive || currentProject.scenes.length >= currentProject.totalScenes}
                                        className="bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:from-pink-700 hover:to-purple-700 disabled:opacity-50 flex items-center gap-3"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Wand2 className="w-5 h-5" />
                                                Generate Next Scene
                                            </>
                                        )}
                                    </button>
                                    {currentProject.scenes.length === 0 && (
                                        <button
                                            onClick={generateAllScenes}
                                            disabled={isGenerating || !apiSettings?.isActive}
                                            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 flex items-center gap-3"
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Generating All...
                                                </>
                                            ) : (
                                                <>
                                                    <Zap className="w-5 h-5" />
                                                    Generate All Scenes
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {currentProject.scenes.length === 0 ? (
                                <div className="text-center py-12 text-gray-300">
                                    <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg">No scenes generated yet</p>
                                    <p className="text-sm">Generate your first promotional scene</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {currentProject.scenes.map((scene) => (
                                        <div key={scene.id} className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                                            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white">
                                                <h4 className="font-bold text-lg">
                                                    Scene {scene.sceneNumber} ({scene.duration}s)
                                                </h4>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => copySceneAsJSON(scene)}
                                                        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                        Copy JSON
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="p-6">
                                                {/* JSON Format Display */}
                                                <div className="bg-gray-900 p-4 rounded-lg mb-4">
                                                    <h5 className="text-white font-semibold mb-2 flex items-center gap-2">
                                                        <Brain className="w-4 h-4" />
                                                        Scene Data (JSON)
                                                    </h5>
                                                    <pre className="whitespace-pre-wrap text-xs text-gray-300 font-mono overflow-x-auto">
                                                        {JSON.stringify({
                                                            sceneNumber: scene.sceneNumber,
                                                            duration: scene.duration,
                                                            prompt: scene.prompt,
                                                            purpose: scene.purpose,
                                                            callToAction: scene.callToAction,
                                                            targetEmotion: scene.targetEmotion,
                                                            productFocus: scene.productFocus,
                                                            customerPainPoint: scene.customerPainPoint,
                                                            solution: scene.solution,
                                                            socialProof: scene.socialProof,
                                                            urgency: scene.urgency,
                                                            platform: scene.platform
                                                        }, null, 2)}
                                                    </pre>
                                                </div>

                                                {/* Raw Prompt */}
                                                <div className="mb-4">
                                                    <h5 className="text-white font-semibold mb-2 flex items-center gap-2">
                                                        <Eye className="w-4 h-4" />
                                                        Video Prompt
                                                    </h5>
                                                    <div className="bg-gray-900 p-4 rounded-lg">
                                                        <pre className="whitespace-pre-wrap text-sm text-gray-300">{scene.prompt}</pre>
                                                    </div>
                                                </div>

                                                {/* Scene Details */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-pink-300 font-semibold">Purpose:</span>
                                                        <p className="text-gray-300">{scene.purpose}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-pink-300 font-semibold">Target Emotion:</span>
                                                        <p className="text-gray-300">{scene.targetEmotion}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-pink-300 font-semibold">Call to Action:</span>
                                                        <p className="text-gray-300">{scene.callToAction}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-pink-300 font-semibold">Product Focus:</span>
                                                        <p className="text-gray-300">{scene.productFocus}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-pink-300 font-semibold">Customer Pain Point:</span>
                                                        <p className="text-gray-300">{scene.customerPainPoint}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-pink-300 font-semibold">Solution:</span>
                                                        <p className="text-gray-300">{scene.solution}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-pink-300 font-semibold">Social Proof:</span>
                                                        <p className="text-gray-300">{scene.socialProof}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-pink-300 font-semibold">Urgency:</span>
                                                        <p className="text-gray-300">{scene.urgency}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-pink-300 font-semibold">Platform:</span>
                                                        <p className="text-gray-300">{scene.platform.toUpperCase()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdvancedPromoGenerator;
