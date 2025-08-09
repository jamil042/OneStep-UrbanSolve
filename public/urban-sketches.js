// Urban Sketch SVG Content for OneStep Urban Solve
// Reusable SVG elements for different page themes

const UrbanSketches = {
    // Home page urban sketch (blue theme)
    home: `
        <!-- Buildings Skyline -->
        <g class="sketch-buildings">
            <path d="M50 600 L50 400 L120 380 L120 600 Z" />
            <path d="M120 600 L120 350 L200 330 L200 600 Z" />
            <path d="M200 600 L200 420 L270 410 L270 600 Z" />
            <path d="M270 600 L270 300 L350 280 L350 600 Z" />
            <path d="M350 600 L350 360 L420 350 L420 600 Z" />
            <path d="M420 600 L420 250 L500 230 L500 600 Z" />
            <path d="M500 600 L500 380 L570 370 L570 600 Z" />
            <path d="M570 600 L570 320 L650 300 L650 600 Z" />
            <path d="M650 600 L650 400 L720 390 L720 600 Z" />
            <path d="M720 600 L720 280 L800 260 L800 600 Z" />
            <rect x="70" y="450" width="15" height="20" />
            <rect x="140" y="380" width="15" height="20" />
            <rect x="290" y="330" width="15" height="20" />
            <rect x="440" y="280" width="15" height="20" />
            <rect x="590" y="340" width="15" height="20" />
            <rect x="740" y="300" width="15" height="20" />
        </g>
        <!-- Roads -->
        <g class="sketch-roads">
            <path d="M0 600 L1200 600" stroke-width="3" />
            <path d="M0 620 L1200 620" stroke-width="1" stroke-dasharray="20,10" />
            <path d="M150 600 L150 700" stroke-width="2" />
            <path d="M300 600 L300 700" stroke-width="2" />
            <path d="M450 600 L450 700" stroke-width="2" />
            <path d="M600 600 L600 700" stroke-width="2" />
        </g>
        <!-- Urban Elements -->
        <g class="sketch-elements">
            <path d="M100 600 L100 550 L110 540" stroke-width="2" />
            <circle cx="110" cy="540" r="5" fill="none" />
            <path d="M250 600 L250 550 L260 540" stroke-width="2" />
            <circle cx="260" cy="540" r="5" fill="none" />
            <path d="M180 600 L180 570" stroke-width="1.5" />
            <circle cx="180" cy="565" r="8" fill="none" />
            <path d="M320 600 L320 570" stroke-width="1.5" />
            <circle cx="320" cy="565" r="10" fill="none" />
        </g>
        <!-- Background -->
        <g class="sketch-background" opacity="0.6">
            <path d="M0 450 L50 440 L100 445 L150 435 L200 440 L250 430 L300 435 L350 425 L400 430 L450 420 L500 425 L550 415 L600 420 L650 410 L700 415 L750 405 L800 410 L850 400 L900 405 L950 395 L1000 400 L1050 390 L1100 395 L1150 385 L1200 390" />
        </g>
        <!-- Clouds -->
        <g class="sketch-clouds" stroke-width="1" fill="none" opacity="0.4">
            <path d="M200 150 Q220 140 240 150 Q260 140 280 150 Q300 140 320 150" />
            <path d="M500 120 Q530 110 560 120 Q590 110 620 120" />
            <path d="M800 180 Q820 170 840 180 Q860 170 880 180 Q900 170 920 180" />
        </g>
    `,

    // Signup page urban sketch (green theme)
    signup: `
        <!-- Green Buildings -->
        <g class="sketch-buildings">
            <path d="M80 600 L80 420 L140 410 L140 600 Z" />
            <path d="M140 600 L140 380 L210 370 L210 600 Z" />
            <path d="M210 600 L210 440 L280 430 L280 600 Z" />
            <path d="M280 600 L280 320 L360 310 L360 600 Z" />
            <path d="M360 600 L360 380 L430 370 L430 600 Z" />
            <path d="M430 600 L430 270 L510 260 L510 600 Z" />
            <rect x="100" y="470" width="15" height="20" />
            <rect x="160" y="410" width="15" height="20" />
            <rect x="240" y="470" width="15" height="20" />
            <rect x="310" y="350" width="15" height="20" />
            <rect x="380" y="400" width="15" height="20" />
            <rect x="460" y="300" width="15" height="20" />
        </g>
        <!-- Green Infrastructure -->
        <g class="sketch-roads">
            <path d="M0 600 L1200 600" stroke-width="3" />
            <path d="M0 640 L1200 640" stroke-width="2" stroke="#34d399" stroke-dasharray="5,5" />
            <path d="M170 600 L170 700" stroke-width="2" />
            <path d="M320 600 L320 700" stroke-width="2" />
            <path d="M470 600 L470 700" stroke-width="2" />
        </g>
        <!-- Green Elements -->
        <g class="sketch-elements">
            <path d="M120 600 L120 550 L130 540" stroke-width="2" />
            <rect x="125" y="530" width="10" height="5" fill="none" />
            <circle cx="130" cy="540" r="5" fill="none" />
            <path d="M200 600 L200 570" stroke-width="1.5" stroke="#059669" />
            <circle cx="200" cy="565" r="10" fill="none" stroke="#059669" />
            <circle cx="195" cy="560" r="5" fill="none" stroke="#059669" />
            <path d="M350 600 L350 570" stroke-width="1.5" stroke="#059669" />
            <circle cx="350" cy="565" r="12" fill="none" stroke="#059669" />
        </g>
        <!-- Eco Park -->
        <g class="sketch-elements" stroke="#10b981">
            <path d="M870 600 L1020 600 L1020 500 L870 500 Z" fill="none" />
            <rect x="880" y="520" width="30" height="15" stroke-dasharray="3,3" />
            <rect x="920" y="520" width="30" height="15" stroke-dasharray="3,3" />
            <circle cx="890" cy="560" r="18" />
            <circle cx="940" cy="570" r="15" />
        </g>
    `,

    // Signin page urban sketch (cyan theme)
    signin: `
        <!-- Smart Buildings -->
        <g class="sketch-buildings">
            <path d="M70 600 L70 430 L130 420 L130 600 Z" />
            <path d="M130 600 L130 390 L200 380 L200 600 Z" />
            <path d="M200 600 L200 450 L270 440 L270 600 Z" />
            <path d="M270 600 L270 330 L350 320 L350 600 Z" />
            <path d="M350 600 L350 390 L420 380 L420 600 Z" />
            <path d="M420 600 L420 280 L500 270 L500 600 Z" />
            <rect x="90" y="480" width="15" height="20" />
            <rect x="150" y="420" width="15" height="20" />
            <rect x="220" y="480" width="15" height="20" />
            <rect x="300" y="360" width="15" height="20" />
            <rect x="370" y="420" width="15" height="20" />
            <rect x="450" y="310" width="15" height="20" />
        </g>
        <!-- Smart Infrastructure -->
        <g class="sketch-roads">
            <path d="M0 600 L1200 600" stroke-width="3" />
            <path d="M0 620 L1200 620" stroke-width="1" stroke-dasharray="20,10" />
            <path d="M160 600 L160 700" stroke-width="2" />
            <path d="M310 600 L310 700" stroke-width="2" />
            <path d="M460 600 L460 700" stroke-width="2" />
        </g>
        <!-- Tech Elements -->
        <g class="sketch-elements">
            <path d="M110 600 L110 550 L120 540" stroke-width="2" />
            <circle cx="120" cy="540" r="5" fill="none" />
            <rect x="115" y="535" width="10" height="3" fill="none" />
            <path d="M190 600 L190 570" stroke-width="1.5" />
            <circle cx="190" cy="565" r="9" fill="none" />
            <path d="M340 600 L340 570" stroke-width="1.5" />
            <circle cx="340" cy="565" r="11" fill="none" />
        </g>
        <!-- Tech Park -->
        <g class="sketch-elements">
            <path d="M860 600 L1010 600 L1010 510 L860 510 Z" fill="none" />
            <circle cx="880" cy="550" r="16" />
            <circle cx="930" cy="560" r="14" />
            <circle cx="980" cy="545" r="18" />
            <path d="M860 580 Q905 570 950 580 Q975 575 1010 580" stroke-dasharray="5,5" />
        </g>
    `
};

// Function to create urban sketch SVG
function createUrbanSketchSVG(theme, strokeColor) {
    return `
        <svg
            class="urban-sketch-svg"
            viewBox="0 0 1200 800"
            preserveAspectRatio="xMidYMid slice"
            fill="none"
            stroke="${strokeColor}"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
        >
            ${UrbanSketches[theme]}
        </svg>
    `;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UrbanSketches, createUrbanSketchSVG };
}