//  Tạo hàm lấy phần tử cuối cùng của mảng
Array.prototype.last = function () {
    return this[this.length - 1];
};

// Hàm tính sin với tham số là độ
Math.sinus = function (degree) {
    return Math.sin((degree / 180) * Math.PI);
};

// Các biến dữ liệu
let phase = "waiting"; // waiting | stretching | turning | walking | transitioning | falling
let lastTimestamp; // gán mốc thời gian lần gần nhất hàm requestAnimationFrame gọi

let heroX; // Tọa độ X của đối tượng
let heroY; // Tọa độ Y của đối tượng
let sceneOffset; // Di chuyển khung cảnh game

let platforms = []; // mảng chứa các đối tượng vật cản
let sticks = []; // mảng chứa các "stick", giúp nhân vật vượt qua platform
let trees = []; // chứa các tree, giúp cấu thành nên background

// Chứa dữ liệu điểm người chơi
let score = 0;

// Cấu hình của Game
const canvasWidth = 375;
const canvasHeight = 375;
// chiều cao của vật thể cản
const platformHeight = 100;
// khảng cách nhân vật đến mép vật thể cản ( mép bên phải )
const heroDistanceFromEdge = 10; // While waiting
const paddingX = 100; // khoảng cách nhân vật so với mép trái của canvas (set cố định khi thu nhỏ màn hình => tránh nhân vật dính sát mép)
const perfectAreaSize = 10; // khi nhân vật "stretching" đến khu vực này => score x2

// Background chuyển động chậm hơn so với nhân vật => tạo hiệu ứng thị giác
const backgroundSpeedMultiplier = 0.2;

const hill1BaseHeight = 100; // chiều cao ngọn đồi 1
const hill1Amplitude = 10; // biên độ đồi 1
const hill1Stretch = 1;
const hill2BaseHeight = 70;
const hill2Amplitude = 20;
const hill2Stretch = 0.5;

const stretchingSpeed = 4;
const turningSpeed = 4;
const walkingSpeed = 4;
const transitioningSpeed = 2;
const fallingSpeed = 2;

const heroWidth = 17;
const heroHeight = 30;

const canvas = document.getElementById("game");
// Đảm bảo canvas tràn màn hình
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext("2d");

const introductionElement = document.getElementById("introduction");
const perfectElement = document.getElementById("perfect");
const restartButton = document.getElementById("restart");
const scoreElement = document.getElementById("score");
// Sound effects
const backgroundMusic = document.getElementById("backgroundMusic");
var stickGrowSound = new Audio("./audio/stick_grow_loop.wav");
var keepPlayingStick = false;
var scoreUp = new Audio("./audio/score.mp3");
var deadth = new Audio("./audio/death.mp3");
// Bat nhac nen
document.addEventListener("DOMContentLoaded", function () {
    const backgroundMusic = document.getElementById("backgroundMusic");
    backgroundMusic.play().catch((error) => {
        console.log("Autoplay was prevented:", error);
        // Hiển thị thông báo hoặc nút yêu cầu người dùng tương tác
        const interactionPrompt = document.createElement("div");
        interactionPrompt.id = "interactionPrompt";
        interactionPrompt.textContent =
            "Click anywhere to enable background music";
        interactionPrompt.style.position = "fixed";
        interactionPrompt.style.top = "0";
        interactionPrompt.style.left = "0";
        interactionPrompt.style.width = "100%";
        interactionPrompt.style.height = "100%";
        interactionPrompt.style.display = "flex";
        interactionPrompt.style.alignItems = "center";
        interactionPrompt.style.justifyContent = "center";
        interactionPrompt.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        interactionPrompt.style.color = "white";
        interactionPrompt.style.fontSize = "20px";
        interactionPrompt.style.cursor = "pointer";
        document.body.appendChild(interactionPrompt);

        interactionPrompt.addEventListener("click", () => {
            backgroundMusic.play();
            document.body.removeChild(interactionPrompt);
        });
    });
});
// sound effect khi kéo dài stick
function loopSound() {
    if (keepPlayingStick) {
        stickGrowSound.play();
        stickGrowSound
            .play()
            .catch((error) => console.error("Error playing the sound:", error))
            .then(() => {
                if (keepPlayingStick) {
                    // Kiểm tra lại trạng thái sau khi phát xong
                    setTimeout(
                        loopSound,
                        (stickGrowSound.duration - stickGrowSound.currentTime) *
                            1000
                    );
                }
            });
    }
}
// Khởi tạo game
resetGame();

function resetGame() {
    // Reset game progress
    phase = "waiting";
    lastTimestamp = undefined;
    sceneOffset = 0;
    score = 0;
    introductionElement.style.opacity = 1;
    perfectElement.style.opacity = 0;
    restartButton.style.display = "none";
    scoreElement.innerText = score;

    // Khởi tạo vật ban đầu luôn giống nhau mọi trường hợp
    platforms = [{ x: 50, w: 50 }];
    generatePlatform();
    generatePlatform();
    generatePlatform();
    generatePlatform();
    // tọa độ của mỗi stick sẽ bắt đầu từ mép của mỗi platform
    sticks = [{ x: platforms[0].x + platforms[0].w, length: 0, rotation: 0 }];
    // Render ra các tree ở background
    trees = [];
    generateTree();
    generateTree();
    generateTree();
    generateTree();
    generateTree();
    generateTree();
    generateTree();
    generateTree();
    generateTree();
    generateTree();
    // Vị trí của nhân vật
    heroX = platforms[0].x + platforms[0].w - heroDistanceFromEdge;
    heroY = 0;

    draw();
}
// Generate ra các Tree ở background
function generateTree() {
    const minimumGap = 30;
    const maximumGap = 150;

    // Tọa độ X của cây ra nhất
    const lastTree = trees[trees.length - 1];
    let furthestX = lastTree ? lastTree.x : 0;

    const x =
        furthestX +
        minimumGap +
        Math.floor(Math.random() * (maximumGap - minimumGap));

    const treeColors = ["#6D8821", "#8FAC34", "#98B333"];
    const color = treeColors[Math.floor(Math.random() * 3)];

    trees.push({ x, color });
}
// Generate ra các vật cản ở Platform
function generatePlatform() {
    const minimumGap = 40;
    const maximumGap = 200;
    const minimumWidth = 20;
    const maximumWidth = 100;

    // Tọa độ X của vật cản xa nhất
    const lastPlatform = platforms[platforms.length - 1];
    let furthestX = lastPlatform.x + lastPlatform.w;

    const x =
        furthestX +
        minimumGap +
        Math.floor(Math.random() * (maximumGap - minimumGap));
    const w =
        minimumWidth +
        Math.floor(Math.random() * (maximumWidth - minimumWidth));

    platforms.push({ x, w });
}

resetGame();
// Space: reset lại game
window.addEventListener("keydown", function (event) {
    if (event.key == " ") {
        // Neu nguoi dung nhan khoang thang => reset game
        event.preventDefault();
        // Chan hanh vi mac dinh loading lai cua trinh duyet
        resetGame();
        return;
    }
});

window.addEventListener("mousedown", function (event) {
    if (phase == "waiting") {
        lastTimestamp = undefined;
        introductionElement.style.opacity = 0;
        phase = "stretching";
        keepPlayingStick = true;
        loopSound();
        window.requestAnimationFrame(animate);
    }
});

window.addEventListener("mouseup", function (event) {
    if (phase == "stretching") {
        phase = "turning";
        keepPlayingStick = false;
        stickGrowSound.pause();
        stickGrowSound.currentTime = 0;
    }
});

window.addEventListener("resize", function (event) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw();
});

window.requestAnimationFrame(animate);

// The main game loop
function animate(timestamp) {
    if (!lastTimestamp) {
        lastTimestamp = timestamp;
        window.requestAnimationFrame(animate);
        return;
    }

    switch (phase) {
        case "waiting":
            return; // Stop the loop
        case "stretching": {
            sticks.last().length +=
                (timestamp - lastTimestamp) / stretchingSpeed;
            break;
        }
        case "turning": {
            sticks.last().rotation +=
                (timestamp - lastTimestamp) / turningSpeed;

            if (sticks.last().rotation > 90) {
                sticks.last().rotation = 90;
                let isScoreSoundPlaying = false;
                const [nextPlatform, perfectHit] = thePlatformTheStickHits();
                if (nextPlatform) {
                    // Increase score
                    if (!isScoreSoundPlaying) {
                        scoreUp.play();
                        isScoreSoundPlaying = true;
                    } else {
                        scoreUp.pause();
                        scoreUp.currentTime = 0;
                    }
                    score += perfectHit ? 2 : 1;
                    scoreElement.innerText = score;

                    if (perfectHit) {
                        perfectElement.style.opacity = 1;
                        setTimeout(
                            () => (perfectElement.style.opacity = 0),
                            1000
                        );
                    }

                    generatePlatform();
                    generateTree();
                    generateTree();
                }

                phase = "walking";
            }
            scoreUp.onended = function () {
                isScoreSoundPlaying = false;
            };
            break;
        }
        case "walking": {
            heroX += (timestamp - lastTimestamp) / walkingSpeed;

            const [nextPlatform] = thePlatformTheStickHits();
            if (nextPlatform) {
                // nếu thành công đến vật cản tiếp theo, đặt ví trí HeroX ở rìa bên phải vật cản
                const maxHeroX =
                    nextPlatform.x + nextPlatform.w - heroDistanceFromEdge;
                if (heroX > maxHeroX) {
                    heroX = maxHeroX;
                    phase = "transitioning";
                }
            } else {
                // Nếu thất bại, đặt ví trí HeroX ra ngoài rìa của gậy
                const maxHeroX =
                    sticks.last().x + sticks.last().length + heroWidth;
                if (heroX > maxHeroX) {
                    heroX = maxHeroX;
                    phase = "falling";
                }
            }
            break;
        }
        case "transitioning": {
            sceneOffset += (timestamp - lastTimestamp) / transitioningSpeed;

            const [nextPlatform] = thePlatformTheStickHits();
            if (sceneOffset > nextPlatform.x + nextPlatform.w - paddingX) {
                // Add the next step
                sticks.push({
                    x: nextPlatform.x + nextPlatform.w,
                    length: 0,
                    rotation: 0,
                });
                phase = "waiting";
            }
            break;
        }
        case "falling": {
            if (sticks.last().rotation < 180)
                sticks.last().rotation +=
                    (timestamp - lastTimestamp) / turningSpeed;

            heroY += (timestamp - lastTimestamp) / fallingSpeed;
            const maxHeroY =
                platformHeight + 100 + (window.innerHeight - canvasHeight) / 2;
            if (heroY > maxHeroY) {
                deadth.play();
                restartButton.style.display = "block";
                return;
            }
            break;
        }
        default:
            throw Error("Wrong phase");
    }

    draw();
    window.requestAnimationFrame(animate);

    lastTimestamp = timestamp;
}

// Trả về vật cản mà thanh chạm đến, nếu không trả về undefined
function thePlatformTheStickHits() {
    if (sticks.last().rotation != 90)
        throw Error(`Stick is ${sticks.last().rotation}°`);
    const stickFarX = sticks.last().x + sticks.last().length;

    const platformTheStickHits = platforms.find(
        (platform) =>
            platform.x < stickFarX && stickFarX < platform.x + platform.w
    );

    // If the stick hits the perfect area
    if (
        platformTheStickHits &&
        platformTheStickHits.x +
            platformTheStickHits.w / 2 -
            perfectAreaSize / 2 <
            stickFarX &&
        stickFarX <
            platformTheStickHits.x +
                platformTheStickHits.w / 2 +
                perfectAreaSize / 2
    )
        return [platformTheStickHits, true];

    return [platformTheStickHits, false];
}

function draw() {
    ctx.save();
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    drawBackground();

    // Căn giữa canvas vào chính giữa màn hình
    ctx.translate(
        (window.innerWidth - canvasWidth) / 2 - sceneOffset,
        (window.innerHeight - canvasHeight) / 2
    );

    // Draw scene
    drawPlatforms();
    drawHero();
    drawSticks();

    // Restore transformation
    ctx.restore();
}

restartButton.addEventListener("click", function (event) {
    event.preventDefault();
    resetGame();
    restartButton.style.display = "none";
});

function drawPlatforms() {
    platforms.forEach(({ x, w }) => {
        // Draw platform
        ctx.fillStyle = "black";
        ctx.fillRect(
            x,
            canvasHeight - platformHeight,
            w,
            platformHeight + (window.innerHeight - canvasHeight) / 2
        );

        // Tạo ví trị hoàn hảo => x2 điểm khi stick chạm đến
        if (sticks.last().x < x) {
            ctx.fillStyle = "red";
            ctx.fillRect(
                x + w / 2 - perfectAreaSize / 2,
                canvasHeight - platformHeight,
                perfectAreaSize,
                perfectAreaSize
            );
        }
    });
}

function drawHero() {
    ctx.save();
    ctx.fillStyle = "black";
    ctx.translate(
        heroX - heroWidth / 2,
        heroY + canvasHeight - platformHeight - heroHeight / 2
    );

    // Body
    drawRoundedRect(
        -heroWidth / 2,
        -heroHeight / 2,
        heroWidth,
        heroHeight - 4,
        5
    );

    // Legs
    const legDistance = 5;
    ctx.beginPath();
    ctx.arc(legDistance, 11.5, 3, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-legDistance, 11.5, 3, 0, Math.PI * 2, false);
    ctx.fill();

    // Eye
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.arc(5, -7, 3, 0, Math.PI * 2, false);
    ctx.fill();

    // Band
    ctx.fillStyle = "green";
    ctx.fillRect(-heroWidth / 2 - 1, -12, heroWidth + 2, 4.5);
    ctx.beginPath();
    ctx.moveTo(-9, -14.5);
    ctx.lineTo(-17, -18.5);
    ctx.lineTo(-14, -8.5);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-10, -10.5);
    ctx.lineTo(-15, -3.5);
    ctx.lineTo(-5, -7);
    ctx.fill();

    ctx.restore();
}

function drawRoundedRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x, y + radius);
    ctx.lineTo(x, y + height - radius);
    ctx.arcTo(x, y + height, x + radius, y + height, radius);
    ctx.lineTo(x + width - radius, y + height);
    ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
    ctx.lineTo(x + width, y + radius);
    ctx.arcTo(x + width, y, x + width - radius, y, radius);
    ctx.lineTo(x + radius, y);
    ctx.arcTo(x, y, x, y + radius, radius);
    ctx.fill();
}

function drawSticks() {
    sticks.forEach((stick) => {
        ctx.save();

        // Move the anchor point to the start of the stick and rotate
        ctx.translate(stick.x, canvasHeight - platformHeight);
        ctx.rotate((Math.PI / 180) * stick.rotation);

        // Draw stick
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -stick.length);
        ctx.stroke();

        // Restore transformations
        ctx.restore();
    });
}

function drawBackground() {
    // Draw sky
    var gradient = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
    gradient.addColorStop(0, "#BBD691");
    gradient.addColorStop(1, "#FEF1E1");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    // Draw hills
    drawHill(hill1BaseHeight, hill1Amplitude, hill1Stretch, "#95C629");
    drawHill(hill2BaseHeight, hill2Amplitude, hill2Stretch, "#659F1C");

    // Draw trees
    trees.forEach((tree) => drawTree(tree.x, tree.color));
}

function drawHill(baseHeight, amplitude, stretch, color) {
    ctx.beginPath();
    ctx.moveTo(0, window.innerHeight);
    ctx.lineTo(0, getHillY(0, baseHeight, amplitude, stretch));
    for (let i = 0; i < window.innerWidth; i++) {
        ctx.lineTo(i, getHillY(i, baseHeight, amplitude, stretch));
    }
    ctx.lineTo(window.innerWidth, window.innerHeight);
    ctx.fillStyle = color;
    ctx.fill();
}

function drawTree(x, color) {
    ctx.save();
    ctx.translate(
        (-sceneOffset * backgroundSpeedMultiplier + x) * hill1Stretch,
        getTreeY(x, hill1BaseHeight, hill1Amplitude)
    );

    const treeTrunkHeight = 5;
    const treeTrunkWidth = 2;
    const treeCrownHeight = 25;
    const treeCrownWidth = 10;

    // Draw trunk
    ctx.fillStyle = "#7D833C";
    ctx.fillRect(
        -treeTrunkWidth / 2,
        -treeTrunkHeight,
        treeTrunkWidth,
        treeTrunkHeight
    );

    // Draw crown
    ctx.beginPath();
    ctx.moveTo(-treeCrownWidth / 2, -treeTrunkHeight);
    ctx.lineTo(0, -(treeTrunkHeight + treeCrownHeight));
    ctx.lineTo(treeCrownWidth / 2, -treeTrunkHeight);
    ctx.fillStyle = color;
    ctx.fill();

    ctx.restore();
}

function getHillY(windowX, baseHeight, amplitude, stretch) {
    const sineBaseY = window.innerHeight - baseHeight;
    return (
        Math.sinus(
            (sceneOffset * backgroundSpeedMultiplier + windowX) * stretch
        ) *
            amplitude +
        sineBaseY
    );
}

function getTreeY(x, baseHeight, amplitude) {
    const sineBaseY = window.innerHeight - baseHeight;
    return Math.sinus(x) * amplitude + sineBaseY;
}
