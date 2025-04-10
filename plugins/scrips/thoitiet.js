const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

// Function to generate a unique filename
function generateFileName() {
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(2, 8);
    return `${timestamp}_${randomString}.png`;
}
module.exports.config = {
    name: "thoitiet",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Hoàng Quân",
    description: "Xem thời tiết của thành phố",
    commandCategory: "other",
    usages: "thoitiet [tên thành phố]",
    cooldowns: 5
};
module.exports.run = async ({ api, event, args }) => {
    try {
        if (!args[0]) {
            return api.sendMessage("Vui lòng nhập tên thành phố cần xem thời tiết.", event.threadID);
        }

        const apiKey = '59f9f80c3d242e1b3756309e48690d15';
        const city = encodeURIComponent(args.join(' '));
        const units = 'metric';
        const lang = 'vi';
        const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}&lang=${lang}&appid=${apiKey}`;

        const response = await axios.get(url);
        const weatherData = response.data;

        if (weatherData.cod === '404') {
            return api.sendMessage("Không tìm thấy thành phố này. Vui lòng kiểm tra lại tên thành phố.", event.threadID);
        }

        // Ensure cache directory exists
        const cacheDir = path.join(__dirname, 'cache');
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir);
        }

        const canvas = createCanvas(400, 600);
        const ctx = canvas.getContext('2d');

        // Load background image
        const background = await loadImage('https://i.imgur.com/2HSe5Wf.jpeg'); // Replace 'background_image_url_here' with the URL of your background image
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // Draw weather information
        ctx.font = '25px Arial';
        ctx.fillStyle = '#000000';

        ctx.fillText(` - Thời tiết tại ${weatherData.name}:`, 10, 30);
        ctx.fillText(` - Nhiệt độ: ${weatherData.main.temp}°C`, 10, 60);
        ctx.fillText(` - Cảm nhận: ${weatherData.main.feels_like}°C`, 10, 90);
        ctx.fillText(` - Độ ẩm: ${weatherData.main.humidity}%`, 10, 120);
        ctx.fillText(` - Tốc độ gió: ${weatherData.wind.speed} m/s`, 10, 150);
        ctx.fillText(` - Lượng mưa (1h): ${weatherData.rain ? weatherData.rain["1h"] : 0} mm`, 10, 180);
        ctx.fillText(` - Tầm nhìn: ${weatherData.visibility / 1000} km`, 10, 210);
        ctx.fillText(` - Kinh độ: ${weatherData.coord.lon}`, 10, 240);
        ctx.fillText(` - Vĩ độ: ${weatherData.coord.lat}`, 10, 270);
        ctx.fillText(` - Áp suất: ${weatherData.main.pressure} hPa`, 10, 300);
        ctx.fillText(` - Mặt trời mọc: ${new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString()}`, 10, 330);
        ctx.fillText(` - Mặt trời lặn: ${new Date(weatherData.sys.sunset * 1000).toLocaleTimeString()}`, 10, 360);
        ctx.fillText(` - Tình trạng: ${weatherData.weather[0].description}`, 10, 390);
        ctx.fillText(` - Tia UV: ${weatherData.uvi}`, 10, 420);
        ctx.fillText(` - Bức xạ: ${weatherData.radiation}`, 10, 450);

        // Generate a unique filename for caching
        const fileName = generateFileName();

        // Save the canvas as an image
        const out = fs.createWriteStream(path.join(cacheDir, fileName));
        const stream = canvas.createPNGStream();
        stream.pipe(out);
        out.on('finish', () => {
            // Sending the image
            
           api.sendMessage(
                {
                    attachment: fs.createReadStream(path.join(cacheDir, fileName))
                },
                event.threadID,
                () => {
                    // Delete the cached file after sending
                    fs.unlinkSync(path.join(cacheDir, fileName));
                }
            );
        });
    } catch (error) {
        console.error(error);
        api.sendMessage("Đã có lỗi xảy ra khi xem thời tiết. Vui lòng thử lại sau.", event.threadID);
    }
};
