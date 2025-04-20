 function calculateForces() { 
  let velocity = parseFloat(document.getElementById("velocity").value);
  let airDensity = parseFloat(document.getElementById("airDensity").value);
  let wingArea = parseFloat(document.getElementById("wingArea").value);
  let liftCoefficient = parseFloat(document.getElementById("liftCoefficient").value);
  let dragCoefficient = parseFloat(document.getElementById("dragCoefficient").value);
  let thrust = parseFloat(document.getElementById("thrust").value);

  const windSpeedValF = parseFloat(windSpeed.value);
  const windDirValF = parseFloat(windDir.value);
  const windAngle = windDirValF * Math.PI / 180;

  // Relative airspeed influenced by headwind
  const relativeVelocity = velocity + windSpeedValF * Math.cos(windAngle);

  lift = 0.5 * airDensity * relativeVelocity ** 2 * wingArea * liftCoefficient;
  drag = 0.5 * airDensity * relativeVelocity ** 2 * wingArea * dragCoefficient;

  document.getElementById("result").innerText = 
    `Lift: ${lift.toFixed(2)} N | Drag: ${drag.toFixed(2)} N | Thrust: ${thrust} N`;
}
const windSpeed = document.getElementById('windSpeed');
const windDir = document.getElementById('windDir');
const windSpeedVal = document.getElementById('windSpeedVal');
const windDirVal = document.getElementById('windDirVal');

function updateWeatherValues() {
  windSpeedVal.textContent = windSpeed.value;
  windDirVal.textContent = windDir.value;
  calculateForces(); // Forces update on input
}

windSpeed.addEventListener('input', updateWeatherValues);
windDir.addEventListener('input', updateWeatherValues);
let lift = 800;
let drag = 300;
let thrust = 600;
let forceFrame = 0;

function drawArrow(ctx, x, y, length, angle, color, label) {
  const endX = x + length * Math.cos(angle);
  const endY = y + length * Math.sin(angle);

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(endX - 10 * Math.cos(angle - 0.4), endY - 10 * Math.sin(angle - 0.4));
  ctx.lineTo(endX - 10 * Math.cos(angle + 0.4), endY - 10 * Math.sin(angle + 0.4));
  ctx.closePath();
  ctx.fill();

  ctx.font = "bold 12px Arial";
  ctx.fillText(label, endX + 5, endY - 5);
}

function drawFlightScene(lift, drag, thrust) {
  const canvas = document.getElementById('flightCanvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  forceFrame += 0.01;

  // Pulsation only for thrust (optional)
  const thrustPulse = Math.sin(forceFrame * 2) * 5;

  // Plane body
  ctx.fillStyle = "#004080";
  ctx.fillRect(centerX - 30, centerY - 15, 60, 30);

  // Plane nose
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.moveTo(centerX + 30, centerY);
  ctx.lineTo(centerX + 20, centerY - 5);
  ctx.lineTo(centerX + 20, centerY + 5);
  ctx.closePath();
  ctx.fill();

  // Wind data
  const windSpeedValF = parseFloat(windSpeed.value);
  const windDirValF = parseFloat(windDir.value);
  const windAngle = windDirValF * Math.PI / 180;
  const windLength = windSpeedValF * 3;

  // Thrust follows opposite of wind direction (plane pushes against wind)
  const thrustAngle = windAngle + Math.PI;

  // Forces
  drawArrow(ctx, centerX, centerY, lift / 10, -Math.PI / 2, "red", "Lift");
  drawArrow(ctx, centerX, centerY, drag / 10, windAngle, "blue", "Drag");

  // Thrust reacts to wind direction + dynamic pulse
  drawArrow(ctx, centerX + thrustPulse * Math.cos(thrustAngle), centerY + thrustPulse * Math.sin(thrustAngle),
            thrust / 10 + thrustPulse, thrustAngle, "green", "Thrust");

  drawArrow(ctx, centerX, centerY, windLength, -windAngle, "#666", "Wind");
}





function animate() {
  drawFlightScene(lift, drag, thrust);
  requestAnimationFrame(animate);
}



updateWeatherValues();
animate();
const aoaSlider = document.getElementById("aoaSlider");
const aoaVal = document.getElementById("aoaVal");
const canvas = document.getElementById("airflowCanvas");
const ctx = canvas.getContext("2d");

function updateSimulation() {
  const aoa = parseFloat(aoaSlider.value);
  aoaVal.textContent = aoa;
  drawAirflow(aoa);
}


function drawAirflow(aoa) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const midY = canvas.height / 2;

  // Airfoil shape
  ctx.beginPath();
  ctx.moveTo(50, midY);
  ctx.quadraticCurveTo(350, midY - aoa * 3, 450, midY);
  ctx.strokeStyle = "#003366";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Airflow lines
  for (let i = 0; i < 10; i++) {
    const y = midY - 50 + i * 10;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(550, y + aoa);
    ctx.strokeStyle = "#66ccff";
    ctx.stroke();
  }
}

aoaSlider.addEventListener("input", updateSimulation);
updateSimulation();
