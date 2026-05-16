// Static business configuration data
// Services offered by BlackPiston Garage
// These are managed by the business and not user-generated content

import { Service } from '@/types/user';

// ============================================================
// Garage Services
// ============================================================
export const services: Service[] = [
    {
        id: 'SRV-001',
        name: 'ECU Tuning & Remapping',
        price: 14999,
        description: 'Unlock your motorcycle\'s true potential with custom ECU tuning, optimizing fuel maps and ignition timing.',
        image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&h=600&fit=crop',
        duration: '2-4 hours',
        highlights: [
            'Performance remap',
            'Fuel optimization',
            'Throttle response enhancement',
            'Dyno tuning support'
        ],
        included: [
            'Complete ECU backup',
            'Custom mapping for your exhaust/intake setup',
            'Rev limiter adjustment',
            'Post-tune road test and logging'
        ],
        benefits: [
            'Increased horsepower and torque',
            'Smoother power delivery',
            'Better throttle response',
            'Optimized engine temperatures'
        ],
        process: [
            'Initial diagnostic scan',
            'Baseline dyno run (if applicable)',
            'Map flashing and parameter adjustment',
            'Final verification and testing'
        ],
        supportedBikes: 'Most modern fuel-injected superbikes, streetfighters, and ADVs.'
    },
    {
        id: 'SRV-002',
        name: 'Premium General Service',
        price: 4999,
        description: 'Comprehensive preventative maintenance to keep your machine running perfectly. We check everything.',
        image: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=800&h=600&fit=crop',
        duration: '3-5 hours',
        highlights: [
            'Fully synthetic oil change',
            'Brake system overhaul',
            'Chain cleaning & adjustment',
            'Multipoint inspection'
        ],
        included: [
            'Engine oil and filter replacement',
            'Coolant flush and top-up',
            'Brake pad inspection and fluid bleed',
            'Air filter cleaning or replacement'
        ],
        benefits: [
            'Prolonged engine life',
            'Improved braking performance',
            'Better fuel economy',
            'Peace of mind on long rides'
        ],
        process: [
            'Intake and detailed inspection',
            'Fluid draining and replacement',
            'Component lubrication and torque check',
            'Test ride and final wash'
        ],
        supportedBikes: 'All makes and models (Japanese, European, American).'
    },
    {
        id: 'SRV-003',
        name: 'Accident Recovery & Rebuild',
        price: 25000,
        description: 'Professional assessment, frame alignment, and complete restoration of accident-damaged motorcycles.',
        image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&h=600&fit=crop',
        duration: 'Varies by damage',
        highlights: [
            'Insurance estimate support',
            'Frame geometry check',
            'OEM parts sourcing',
            'Complete teardown and rebuild'
        ],
        included: [
            'Thorough damage assessment report',
            'Chassis and fork alignment check',
            'Replacement of damaged structural and cosmetic parts',
            'Repainting and decal matching'
        ],
        benefits: [
            'Restores factory safety standards',
            'Prevents hidden structural failures',
            'Maintains vehicle resale value',
            'Hassle-free recovery process'
        ],
        process: [
            'Vehicle pickup and intake',
            'Insurance coordination',
            'Parts ordering and fabrication',
            'Reassembly and safety certification'
        ],
        supportedBikes: 'All makes and models.'
    },
    {
        id: 'SRV-004',
        name: 'Throttle Body Cleaning',
        price: 2999,
        description: 'Restore crisp throttle response and idle stability by deep cleaning the intake and throttle bodies.',
        image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=600&fit=crop',
        duration: '2-3 hours',
        highlights: [
            'Ultrasonic injector cleaning',
            'Butterfly valve decarb',
            'TPS sensor calibration',
            'Idle sync adjustment'
        ],
        included: [
            'Removal of throttle body assembly',
            'Deep cleaning with specialized solvents',
            'Injector spray pattern test',
            'Vacuum synchronization'
        ],
        benefits: [
            'Cures rough idling',
            'Restores lost fuel efficiency',
            'Eliminates throttle hesitation',
            'Smoother low-speed riding'
        ],
        process: [
            'Tank and airbox removal',
            'Component extraction and ultrasonic cleaning',
            'Reassembly with new seals',
            'Electronic synchronization and test'
        ],
        supportedBikes: 'Fuel-injected multi-cylinder motorcycles.'
    },
    {
        id: 'SRV-005',
        name: 'Performance Modifications',
        price: 5000,
        description: 'Expert installation of aftermarket performance parts, exhausts, quickshifters, and racing components.',
        image: 'https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=800&h=600&fit=crop',
        duration: '1-3 days',
        highlights: [
            'Full exhaust systems',
            'Quickshifter & autoblipper setup',
            'Racing rearsets and clip-ons',
            'Big brake kits'
        ],
        included: [
            'Professional installation to manufacturer spec',
            'Torque wrench assembly',
            'Clearance and safety checks',
            'System calibration (if electronic)'
        ],
        benefits: [
            'Transform the look and sound',
            'Significant weight reduction',
            'Track-ready performance',
            'Perfected riding ergonomics'
        ],
        process: [
            'Consultation and parts selection',
            'Careful removal of stock components',
            'Precision installation of upgrades',
            'Functionality testing and adjustment'
        ],
        supportedBikes: 'Sportbikes, Nakeds, and Track-focused machines.'
    },
    {
        id: 'SRV-006',
        name: 'Detailing & Ceramic Coating',
        price: 7999,
        description: 'Premium multi-stage detailing, paint correction, and 9H ceramic coating for ultimate protection.',
        image: 'https://images.unsplash.com/photo-1605810731054-08eb7658c148?w=800&h=600&fit=crop',
        duration: '1-2 days',
        highlights: [
            'Paint correction & polishing',
            '9H Ceramic Coating (3-year)',
            'Engine & exhaust detailing',
            'Hydrophobic protection'
        ],
        included: [
            'Foam wash and decontamination',
            'Machine compounding to remove swirls',
            'Application of premium ceramic coat',
            'Plastics and rubber restoration'
        ],
        benefits: [
            'Mirror-like gloss finish',
            'Protection against UV and chemical stains',
            'Makes future washing incredibly easy',
            'Preserves the "brand new" look'
        ],
        process: [
            'Deep cleaning and clay bar treatment',
            'Multi-stage paint correction',
            'Surface prep and coating application',
            '24-hour curing process'
        ],
        supportedBikes: 'All makes and models, including matte finishes.'
    }
];
