/*
 * boats.js
 * Mystic / Arcane Boat Renderer
 *
 * Chỉ phụ trách vẽ giao diện thuyền.
 * Không chứa:
 * - Điều khiển
 * - AI
 * - Bắn đạn
 * - Máu
 * - Gameplay logic
 *
 * API giữ nguyên:
 *     drawBoat(ctx, boat)
 *
 * Các thuộc tính được sử dụng:
 *     boat.x
 *     boat.y
 *     boat.pitch
 *     boat.shield
 *     boat.isRed
 *     boat.gunAngleDegree
 *     boat.styleId
 */

(function (global) {
    "use strict";

    global.drawBoat = function drawBoat(ctx, boat) {
        const styleId = Number.isFinite(boat.styleId)
            ? Math.abs(Math.floor(boat.styleId)) % 6
            : 0;

        const isRed = !!boat.isRed;

        // ============================================================
        // PALETTES
        // ============================================================

        const palettes = [
            // 0 — Phantom
            {
                main: isRed ? "#ff1744" : "#00eaff",
                bright: isRed ? "#ff5c7c" : "#7fffff",
                dark: isRed ? "#5c0015" : "#003d5c",
                deepest: isRed ? "#190006" : "#00151f",
                deck: isRed ? "#ff8fa3" : "#9cffff",
                glass: isRed ? "#ff3158" : "#00c8ff",
                glow: isRed ? "#ff1744" : "#00eaff",
                energy: isRed ? "#ff0066" : "#00ffff",
                flag: isRed ? "#ffe600" : "#ff2bd6"
            },

            // 1 — Arcane
            {
                main: isRed ? "#ff6b18" : "#20ff8a",
                bright: isRed ? "#ffbd6b" : "#9affc8",
                dark: isRed ? "#6e1800" : "#034d2d",
                deepest: isRed ? "#1e0800" : "#001b10",
                deck: isRed ? "#ffe0bd" : "#d5ffe9",
                glass: isRed ? "#ff7a18" : "#00d987",
                glow: isRed ? "#ff5b18" : "#20ff8a",
                energy: isRed ? "#ffd000" : "#00ffc8",
                flag: "#ffe900"
            },

            // 2 — Abyss
            {
                main: isRed ? "#e51d4f" : "#4169ff",
                bright: isRed ? "#ff7092" : "#8ca5ff",
                dark: isRed ? "#51051a" : "#101a68",
                deepest: isRed ? "#160008" : "#03051d",
                deck: isRed ? "#ffb4c5" : "#bfcaff",
                glass: isRed ? "#ff3b72" : "#71d7ff",
                glow: isRed ? "#ff174f" : "#4169ff",
                energy: isRed ? "#ff00a8" : "#00d9ff",
                flag: "#ffffff"
            },

            // 3 — Dream
            {
                main: isRed ? "#ff3f9f" : "#9d5cff",
                bright: isRed ? "#ff9dcc" : "#d0aaff",
                dark: isRed ? "#63113d" : "#35135f",
                deepest: isRed ? "#1c0311" : "#0c031b",
                deck: isRed ? "#ffd0e6" : "#e0caff",
                glass: isRed ? "#ff4fb1" : "#9b6cff",
                glow: isRed ? "#ff2d91" : "#a855ff",
                energy: isRed ? "#ff00d4" : "#6a00ff",
                flag: "#ffe900"
            },

            // 4 — Relic
            {
                main: isRed ? "#c83232" : "#a87535",
                bright: isRed ? "#ff7777" : "#e2bb72",
                dark: isRed ? "#4b1010" : "#3d2108",
                deepest: isRed ? "#160303" : "#100802",
                deck: isRed ? "#e7b0a0" : "#e2c08e",
                glass: isRed ? "#681d29" : "#274b54",
                glow: isRed ? "#ff3d3d" : "#ffb84a",
                energy: isRed ? "#ff6b35" : "#ffd166",
                flag: "#ffffff"
            },

            // 5 — Specter
            {
                main: isRed ? "#d0d0d0" : "#78909c",
                bright: isRed ? "#ffffff" : "#c7f8ff",
                dark: isRed ? "#414141" : "#263c45",
                deepest: isRed ? "#111111" : "#081114",
                deck: isRed ? "#eeeeee" : "#b9d3dc",
                glass: isRed ? "#bcbcbc" : "#5ce5f2",
                glow: isRed ? "#ffffff" : "#65efff",
                energy: isRed ? "#eeeeee" : "#00eaff",
                flag: "#ffea00"
            }
        ];

        const pal = palettes[styleId];

        // ============================================================
        // HELPERS
        // ============================================================

        function hexToRgb(hex) {
            hex = hex.replace("#", "");

            if (hex.length === 3) {
                hex = hex
                    .split("")
                    .map(function (c) {
                        return c + c;
                    })
                    .join("");
            }

            return {
                r: parseInt(hex.substring(0, 2), 16),
                g: parseInt(hex.substring(2, 4), 16),
                b: parseInt(hex.substring(4, 6), 16)
            };
        }

        function rgba(hex, alpha) {
            const c = hexToRgb(hex);
            return "rgba(" + c.r + "," + c.g + "," + c.b + "," + alpha + ")";
        }

        function glow(color, blur, alpha) {
            ctx.shadowColor = rgba(color, alpha);
            ctx.shadowBlur = blur;
        }

        function noGlow() {
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
        }

        function roundedRect(x, y, w, h, r) {
            if (ctx.roundRect) {
                ctx.roundRect(x, y, w, h, r);
                return;
            }

            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, y + h - r);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
        }

        function createGradient(y1, y2) {
            const g = ctx.createLinearGradient(0, y1, 0, y2);

            g.addColorStop(0, pal.bright);
            g.addColorStop(0.28, pal.main);
            g.addColorStop(0.72, pal.dark);
            g.addColorStop(1, pal.deepest);

            return g;
        }

        // ============================================================
        // START
        // ============================================================

        ctx.save();

        ctx.translate(boat.x || 0, boat.y || 0);
        ctx.rotate(Number.isFinite(boat.pitch) ? boat.pitch : 0);

        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        // ============================================================
        // MYSTIC AURA
        // ============================================================

        ctx.save();

        const aura = ctx.createRadialGradient(
            75, 35, 8,
            75, 35, 110
        );

        aura.addColorStop(0, rgba(pal.glow, 0.24));
        aura.addColorStop(0.35, rgba(pal.glow, 0.12));
        aura.addColorStop(0.7, rgba(pal.energy, 0.045));
        aura.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = aura;

        ctx.beginPath();
        ctx.arc(75, 35, 108, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // ============================================================
        // SHIELD
        // ============================================================

        if (boat.shield) {
            ctx.save();

            // Outer glow
            ctx.beginPath();
            ctx.arc(75, 40, 88, 0, Math.PI * 2);

            ctx.strokeStyle = rgba(pal.energy, 0.16);
            ctx.lineWidth = 11;
            glow(pal.energy, 25, 0.9);
            ctx.stroke();

            // Main shield
            ctx.beginPath();
            ctx.arc(75, 40, 84, 0, Math.PI * 2);

            ctx.fillStyle = rgba(pal.energy, 0.055);
            ctx.fill();

            ctx.strokeStyle = pal.energy;
            ctx.lineWidth = 2.5;
            glow(pal.energy, 12, 1);
            ctx.stroke();

            // Inner shield
            ctx.beginPath();
            ctx.arc(75, 40, 78, -0.9, 1.7);

            ctx.strokeStyle = rgba(pal.bright, 0.8);
            ctx.lineWidth = 1;
            glow(pal.bright, 7, 0.8);
            ctx.stroke();

            noGlow();

            ctx.restore();
        }

        // ============================================================
        // ENERGY RINGS UNDER BOAT
        // ============================================================

        ctx.save();

        ctx.globalAlpha = 0.55;

        ctx.beginPath();
        ctx.ellipse(75, 61, 67, 8, 0, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(pal.energy, 0.45);
        ctx.lineWidth = 1;
        glow(pal.energy, 8, 0.8);
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(75, 61, 48, 4, 0, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(pal.bright, 0.65);
        ctx.lineWidth = 1;
        ctx.stroke();

        noGlow();
        ctx.restore();

        // ============================================================
        // CANNON
        // ============================================================

        ctx.save();

        ctx.translate(75, 20);

        const gunAngle = Number.isFinite(boat.gunAngleDegree)
            ? boat.gunAngleDegree * Math.PI / 180
            : 0;

        const cannonRotation = isRed
            ? Math.PI + gunAngle
            : -gunAngle;

        ctx.rotate(cannonRotation);

        // Cannon energy trail / aura
        ctx.save();

        ctx.fillStyle = rgba(pal.energy, 0.14);
        glow(pal.energy, 15, 1);

        ctx.beginPath();
        ctx.rect(0, -10, 58, 20);
        ctx.fill();

        noGlow();
        ctx.restore();

        // Cannon body
        const cannonGradient = ctx.createLinearGradient(0, -8, 0, 8);

        cannonGradient.addColorStop(0, "#30343a");
        cannonGradient.addColorStop(0.45, "#080a0d");
        cannonGradient.addColorStop(1, "#000000");

        ctx.fillStyle = cannonGradient;

        ctx.beginPath();
        ctx.moveTo(0, -7);
        ctx.lineTo(48, -7);
        ctx.lineTo(55, -5);
        ctx.lineTo(55, 5);
        ctx.lineTo(48, 7);
        ctx.lineTo(0, 7);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = rgba("#ffffff", 0.7);
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Cannon energy muzzle
        ctx.fillStyle = pal.energy;
        glow(pal.energy, 13, 1);

        ctx.beginPath();
        ctx.moveTo(44, -9);
        ctx.lineTo(58, -9);
        ctx.lineTo(61, 0);
        ctx.lineTo(58, 9);
        ctx.lineTo(44, 9);
        ctx.closePath();
        ctx.fill();

        noGlow();

        ctx.fillStyle = rgba("#ffffff", 0.9);

        ctx.beginPath();
        ctx.arc(57, 0, 3, 0, Math.PI * 2);
        ctx.fill();

        // Cannon rune line
        ctx.strokeStyle = rgba(pal.energy, 0.9);
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(12, -4);
        ctx.lineTo(35, -4);
        ctx.moveTo(12, 4);
        ctx.lineTo(35, 4);
        ctx.stroke();

        ctx.restore();

        // ============================================================
        // HULL SHADOW
        // ============================================================

        ctx.save();

        ctx.beginPath();
        ctx.ellipse(75, 52, 69, 15, 0, 0, Math.PI * 2);

        ctx.fillStyle = "rgba(0,0,0,0.42)";
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 12;
        ctx.fill();

        ctx.restore();

        // ============================================================
        // HULL
        // ============================================================

        ctx.save();

        ctx.beginPath();

        if (styleId === 0) {
            // Phantom
            ctx.moveTo(2, 38);
            ctx.lineTo(18, 24);
            ctx.lineTo(130, 24);
            ctx.lineTo(148, 38);
            ctx.lineTo(128, 57);
            ctx.lineTo(22, 57);
            ctx.closePath();

        } else if (styleId === 1) {
            // Arcane
            ctx.moveTo(5, 39);
            ctx.lineTo(34, 19);
            ctx.lineTo(117, 19);
            ctx.lineTo(145, 39);
            ctx.lineTo(111, 60);
            ctx.lineTo(35, 60);
            ctx.closePath();

        } else if (styleId === 2) {
            // Abyss
            roundedRect(4, 23, 142, 39, 12);

        } else if (styleId === 3) {
            // Dream
            ctx.moveTo(0, 39);
            ctx.lineTo(20, 21);
            ctx.lineTo(131, 21);
            ctx.lineTo(150, 39);
            ctx.lineTo(127, 60);
            ctx.lineTo(20, 60);
            ctx.closePath();

        } else if (styleId === 4) {
            // Relic
            ctx.moveTo(5, 40);
            ctx.quadraticCurveTo(75, 75, 145, 40);
            ctx.lineTo(124, 59);
            ctx.lineTo(26, 59);
            ctx.closePath();

        } else {
            // Specter
            ctx.ellipse(75, 42, 72, 25, 0, 0, Math.PI * 2);
        }

        ctx.fillStyle = createGradient(18, 62);

        glow(pal.glow, 12, 0.65);
        ctx.fill();

        noGlow();

        // Outer hull outline
        ctx.strokeStyle = pal.bright;
        ctx.lineWidth = 2.5;
        glow(pal.glow, 8, 0.8);
        ctx.stroke();

        noGlow();

        // Dark inner contour
        ctx.strokeStyle = rgba(pal.deepest, 0.95);
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();

        // ============================================================
        // HULL ENERGY LINE
        // ============================================================

        ctx.save();

        ctx.beginPath();

        if (styleId === 4) {
            ctx.moveTo(24, 50);
            ctx.quadraticCurveTo(75, 67, 126, 50);
        } else {
            ctx.moveTo(16, 49);
            ctx.quadraticCurveTo(75, 61, 134, 49);
        }

        ctx.strokeStyle = pal.energy;
        ctx.lineWidth = 2;
        glow(pal.energy, 10, 1);
        ctx.stroke();

        noGlow();

        ctx.restore();

        // ============================================================
        // DECK
        // ============================================================

        ctx.save();

        const deckY = styleId === 5 ? 29 : 20;

        ctx.fillStyle = pal.deck;

        ctx.beginPath();
        roundedRect(18, deckY, 115, 21, 4);
        ctx.fill();

        ctx.strokeStyle = rgba("#000000", 0.9);
        ctx.lineWidth = 2;
        ctx.stroke();

        // Deck glow edge
        ctx.beginPath();
        ctx.moveTo(22, deckY + 2);
        ctx.lineTo(129, deckY + 2);

        ctx.strokeStyle = rgba(pal.bright, 0.8);
        ctx.lineWidth = 1;
        glow(pal.bright, 5, 0.8);
        ctx.stroke();

        noGlow();

        // Deck rune markings
        ctx.strokeStyle = rgba(pal.energy, 0.7);
        ctx.lineWidth = 1;

        ctx.beginPath();

        ctx.moveTo(32, deckY + 16);
        ctx.lineTo(45, deckY + 16);

        ctx.moveTo(105, deckY + 16);
        ctx.lineTo(118, deckY + 16);

        ctx.moveTo(62, deckY + 16);
        ctx.lineTo(88, deckY + 16);

        ctx.stroke();

        ctx.restore();

        // ============================================================
        // STYLE-SPECIFIC DETAILS
        // ============================================================

        ctx.save();

        if (styleId === 0) {
            // Phantom energy fins

            ctx.fillStyle = rgba(pal.energy, 0.8);
            glow(pal.energy, 10, 1);

            ctx.beginPath();
            ctx.moveTo(25, 31);
            ctx.lineTo(8, 42);
            ctx.lineTo(27, 39);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(125, 31);
            ctx.lineTo(142, 42);
            ctx.lineTo(123, 39);
            ctx.closePath();
            ctx.fill();

            noGlow();

        } else if (styleId === 1) {
            // Arcane side crystals

            ctx.fillStyle = pal.energy;
            glow(pal.energy, 12, 1);

            ctx.beginPath();
            ctx.moveTo(29, 8);
            ctx.lineTo(40, 3);
            ctx.lineTo(48, 15);
            ctx.lineTo(36, 19);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(101, 15);
            ctx.lineTo(109, 3);
            ctx.lineTo(121, 8);
            ctx.lineTo(114, 19);
            ctx.closePath();
            ctx.fill();

            noGlow();

        } else if (styleId === 2) {
            // Abyss armor plates

            ctx.fillStyle = pal.main;

            ctx.fillRect(26, 7, 22, 13);
            ctx.fillRect(102, 7, 22, 13);

            ctx.strokeStyle = rgba(pal.energy, 0.9);
            ctx.lineWidth = 1;
            glow(pal.energy, 6, 1);

            ctx.strokeRect(26, 7, 22, 13);
            ctx.strokeRect(102, 7, 22, 13);

            noGlow();

        } else if (styleId === 3) {
            // Dream orbs

            ctx.fillStyle = pal.energy;
            glow(pal.energy, 15, 1);

            ctx.beginPath();
            ctx.arc(40, 18, 7, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(110, 18, 7, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#ffffff";

            ctx.beginPath();
            ctx.arc(38, 16, 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(108, 16, 2, 0, Math.PI * 2);
            ctx.fill();

            noGlow();

        } else if (styleId === 4) {
            // Ancient gold machinery

            ctx.strokeStyle = pal.energy;
            ctx.lineWidth = 2;
            glow(pal.energy, 8, 1);

            ctx.beginPath();
            ctx.arc(39, 18, 7, 0, Math.PI * 2);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(111, 18, 7, 0, Math.PI * 2);
            ctx.stroke();

            noGlow();

            ctx.fillStyle = pal.energy;

            ctx.beginPath();
            ctx.arc(39, 18, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(111, 18, 3, 0, Math.PI * 2);
            ctx.fill();

        } else {
            // Specter central energy core

            ctx.fillStyle = pal.energy;
            glow(pal.energy, 15, 1);

            ctx.beginPath();
            ctx.moveTo(75, 0);
            ctx.lineTo(82, 10);
            ctx.lineTo(75, 17);
            ctx.lineTo(68, 10);
            ctx.closePath();
            ctx.fill();

            noGlow();

            ctx.fillStyle = "#ffffff";

            ctx.beginPath();
            ctx.arc(75, 9, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();

        // ============================================================
        // CABIN / BRIDGE
        // ============================================================

        ctx.save();

        // Cabin outer aura
        ctx.fillStyle = rgba(pal.energy, 0.12);
        glow(pal.energy, 14, 0.8);

        ctx.beginPath();
        roundedRect(49, -15, 52, 37, 5);
        ctx.fill();

        noGlow();

        // Cabin body
        const cabinGradient = ctx.createLinearGradient(0, -14, 0, 21);

        cabinGradient.addColorStop(0, pal.bright);
        cabinGradient.addColorStop(0.35, pal.deck);
        cabinGradient.addColorStop(1, pal.main);

        ctx.fillStyle = cabinGradient;

        ctx.beginPath();
        roundedRect(52, -12, 46, 32, 3);
        ctx.fill();

        ctx.strokeStyle = "#080b0e";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Cabin roof
        ctx.fillStyle = rgba(pal.bright, 0.9);

        ctx.beginPath();
        roundedRect(49, -15, 52, 5, 2);
        ctx.fill();

        ctx.strokeStyle = rgba(pal.energy, 0.8);
        ctx.lineWidth = 1;
        glow(pal.energy, 5, 0.8);
        ctx.stroke();

        noGlow();

        // ========================================================
        // WINDOWS
        // ========================================================

        const glassGradient = ctx.createLinearGradient(0, -5, 0, 10);

        glassGradient.addColorStop(0, "#ffffff");
        glassGradient.addColorStop(0.12, pal.glass);
        glassGradient.addColorStop(0.6, rgba(pal.glass, 0.65));
        glassGradient.addColorStop(1, "#02070c");

        ctx.fillStyle = glassGradient;

        ctx.beginPath();
        roundedRect(57, -5, 13, 13, 2);
        ctx.fill();

        ctx.beginPath();
        roundedRect(78, -5, 13, 13, 2);
        ctx.fill();

        ctx.strokeStyle = pal.energy;
        ctx.lineWidth = 1.2;
        glow(pal.energy, 6, 1);

        ctx.stroke();

        ctx.beginPath();
        roundedRect(57, -5, 13, 13, 2);
        ctx.stroke();

        ctx.beginPath();
        roundedRect(78, -5, 13, 13, 2);
        ctx.stroke();

        noGlow();

        // Window reflection
        ctx.strokeStyle = rgba("#ffffff", 0.85);
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(59, -2);
        ctx.lineTo(64, -2);

        ctx.moveTo(80, -2);
        ctx.lineTo(85, -2);

        ctx.stroke();

        ctx.restore();

        // ============================================================
        // MAST
        // ============================================================

        ctx.save();

        ctx.strokeStyle = pal.energy;
        ctx.lineWidth = 2;
        glow(pal.energy, 7, 1);

        ctx.beginPath();
        ctx.moveTo(75, -17);
        ctx.lineTo(75, -58);
        ctx.stroke();

        noGlow();

        // Mast cap
        ctx.fillStyle = "#ffffff";
        glow(pal.bright, 8, 1);

        ctx.beginPath();
        ctx.arc(75, -58, 2.5, 0, Math.PI * 2);
        ctx.fill();

        noGlow();

        ctx.restore();

        // ============================================================
        // MYSTIC FLAG
        // ============================================================

        ctx.save();

        const flagGradient = ctx.createLinearGradient(75, -65, 113, -49);

        flagGradient.addColorStop(0, pal.energy);
        flagGradient.addColorStop(0.5, pal.flag);
        flagGradient.addColorStop(1, pal.glow);

        ctx.fillStyle = flagGradient;

        glow(pal.energy, 9, 0.9);

        ctx.beginPath();
        ctx.moveTo(76, -65);
        ctx.lineTo(113, -57);
        ctx.lineTo(76, -49);
        ctx.closePath();
        ctx.fill();

        noGlow();

        ctx.strokeStyle = rgba("#ffffff", 0.8);
        ctx.lineWidth = 1;
        ctx.stroke();

        // Flag rune
        ctx.fillStyle = rgba("#ffffff", 0.8);

        ctx.beginPath();
        ctx.arc(88, -57, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // ============================================================
        // ENERGY CORE
        // ============================================================

        ctx.save();

        const coreX = 75;
        const coreY = 34;

        // Outer core aura
        ctx.fillStyle = rgba(pal.energy, 0.12);
        glow(pal.energy, 20, 1);

        ctx.beginPath();
        ctx.arc(coreX, coreY, 13, 0, Math.PI * 2);
        ctx.fill();

        // Core
        const coreGradient = ctx.createRadialGradient(
            coreX - 2,
            coreY - 2,
            1,
            coreX,
            coreY,
            10
        );

        coreGradient.addColorStop(0, "#ffffff");
        coreGradient.addColorStop(0.2, pal.bright);
        coreGradient.addColorStop(0.55, pal.energy);
        coreGradient.addColorStop(1, rgba(pal.energy, 0));

        ctx.fillStyle = coreGradient;

        ctx.beginPath();
        ctx.arc(coreX, coreY, 10, 0, Math.PI * 2);
        ctx.fill();

        noGlow();

        // Core ring
        ctx.strokeStyle = rgba(pal.bright, 0.9);
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.arc(coreX, coreY, 8, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();

        // ============================================================
        // DECORATIVE ARCANE LINES
        // ============================================================

        ctx.save();

        ctx.strokeStyle = rgba(pal.energy, 0.55);
        ctx.lineWidth = 1;

        // Left
        ctx.beginPath();
        ctx.moveTo(24, 45);
        ctx.lineTo(31, 41);
        ctx.lineTo(37, 44);
        ctx.stroke();

        // Right
        ctx.beginPath();
        ctx.moveTo(126, 45);
        ctx.lineTo(119, 41);
        ctx.lineTo(113, 44);
        ctx.stroke();

        // Center
        ctx.beginPath();
        ctx.moveTo(61, 48);
        ctx.lineTo(67, 45);
        ctx.lineTo(75, 48);
        ctx.lineTo(83, 45);
        ctx.lineTo(89, 48);
        ctx.stroke();

        ctx.restore();

        // ============================================================
        // FINAL HIGHLIGHT
        // ============================================================

        ctx.save();

        ctx.globalAlpha = 0.8;

        ctx.strokeStyle = rgba("#ffffff", 0.65);
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(22, 27);
        ctx.quadraticCurveTo(75, 18, 128, 27);
        ctx.stroke();

        ctx.restore();

        // ============================================================
        // RESTORE
        // ============================================================

        ctx.restore();
    };
})(window);
