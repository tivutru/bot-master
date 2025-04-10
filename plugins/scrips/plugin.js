module.exports.config = {
    name: "plugin",
    version: "1.0.2",
    credits: "Hoàng Quân",
    hasPermssion: 2,
    description: "Quản lý module plugin",
    commandCategory: "system",
    usages: "plugin [exec] args",
    cooldowns: 0,
    dependencies: ["fs-extra"],
};
const load = async ({ name, event, api, client, global, loadAll }) => {
    const logger = require(process.cwd() + "/utils/log.js"),
        { join } = require("path"),
        { writeFileSync } = require("fs-extra");
    delete require.cache[require.resolve(client.dirConfig)];
    var configValue = require(client.dirConfig);
    try {
        require.resolve(__dirname + `/${name}.js`);
    } catch {
        return api.sendMessage(`Không tìm thấy module: ${name}.js`, event.threadID, event.messageID);
    }
    client.commands.delete(name);
    delete require.cache[require.resolve(__dirname + `/${name}.js`)];
    try {
        const command = require(join(__dirname, `${name}`));
        if (!command.config || !command.run || !command.config.commandCategory || typeof command.run !== "function")
            throw new Error(`Module không đúng định dạng!`);
        if (client.commands.has(command.config.name))
            throw new Error(`Tên module bị trùng với một module mang cùng tên khác!`);
        if (command.config.dependencies) {
            try {
                for (const i of command.config.dependencies) require.resolve(i);
            } catch (e) {
                // Optional: Log a message here if needed
            }
        }
        if (command.config.envConfig) {
            try {
                for (const [key, value] of Object.entries(command.config.envConfig)) {
                    if (typeof global[command.config.name] == "undefined")
                        global[command.config.name] = new Object();
                    if (typeof configValue[command.config.name] == "undefined")
                        configValue[command.config.name] = new Object();
                    if (typeof configValue[command.config.name][key] !== "undefined")
                        global[command.config.name][key] = configValue[command.config.name][key];
                    else global[command.config.name][key] = value || "";
                    if (typeof configValue[command.config.name][key] == "undefined")
                        configValue[command.config.name][key] = value || "";
                }
                logger.loader(`Loaded config module ${command.config.name}`);
            } catch (error) {
                console.log(error);
                logger.loader(`Không thể tải config module ${command.config.name}`, "error");
            }
        }
        if (command.onLoad)
            try {
                command.onLoad({ global, client, configValue });
            } catch (error) {
                logger.loader(
                    `Không thể chạy setup module: ${command} với lỗi: ${error.message}`,
                    "error"
                );
            }
        if (command.event) {
            var registerCommand =
                client.commandRegister.get("event") || [];
            registerCommand.push(command.config.name);
            client.commandRegister.set("event", registerCommand);
        }
        client.commands.set(command.config.name, command);
        if (
            global.config["commandDisabled"].includes(`${name}.js`) ||
            configValue["commandDisabled"].includes(`${name}.js`)
        ) {
            configValue["commandDisabled"].splice(
                configValue["commandDisabled"].indexOf(`${name}.js`),
                1
            );
            global.config["commandDisabled"].splice(
                global.config["commandDisabled"].indexOf(`${name}.js`),
                1
            );
        }
        writeFileSync(client.dirConfig, JSON.stringify(configValue, null, 4));
        logger.loader(`Loaded module ${command.config.name}`);
        if (loadAll == true) return;
        else return api.sendMessage(`Loaded command ${command.config.name}!`, event.threadID);
    } catch (error) {
        logger.loader(
            `Không thể load module command ${name} với lỗi: ${error.name}:${error.message}`,
            "error"
        );
        if (loadAll == true) return;
        else
            return api.sendMessage(
                `Không thể load module command ${name} với lỗi: ${error.name}:${error.message}`,
                event.threadID
            );
    }
};
const unload = async ({ name, event, api, client, global }) => {
    const { writeFileSync } = require("fs-extra");
    delete require.cache[require.resolve(client.dirConfig)];
    var configValue = require(client.dirConfig);
    client.commands.delete(name);
    configValue["commandDisabled"].push(`${name}.js`);
    global.config["commandDisabled"].push(`${name}.js`);
    writeFileSync(client.dirConfig, JSON.stringify(configValue, null, 4));
    return api.sendMessage(`Đã unload lệnh: ${name}`, event.threadID, event.messageID);
};
const reloadConfig = ({ global, event, api, client }) => {
    delete require.cache[require.resolve(client.dirConfig)];
    const config = require(client.dirConfig);
    try {
        for (let [name, value] of Object.entries(config))
            global.config[name] = value;
        return api.sendMessage("Config Reloaded!", event.threadID, event.messageID);
    } catch (error) {
        return api.sendMessage(
            `Không thể reload config với lỗi: ${error.name}: ${error.message}`,
            event.threadID,
            event.messageID
        );
    }
};
module.exports.run = async ({ event, api, global, client, args, utils }) => {
    const { readdirSync } = require("fs-extra");
    const content = args.slice(1, args.length);
    switch (args[0]) {
        case "info": {
            const commands = client.commands.values();
            const commandsPerPage = 5; // Number of commands to display per page
            const totalCommands = client.commands.size;
            const totalPages = Math.ceil(totalCommands / commandsPerPage);
            const requestedPage = parseInt(content[0]) || 1; // Parse the requested page number from the command argument
            const currentPage = Math.min(Math.max(requestedPage, 1), totalPages);
            const startIdx = (currentPage - 1) * commandsPerPage;
            const endIdx = startIdx + commandsPerPage;
            let infoCommand = "";
            let count = 0;
            for (const cmd of commands) {
                if (cmd.config.name && cmd.config.version && cmd.config.credits) {
                    count++;
                    if (count > startIdx && count <= endIdx) {
                        infoCommand += `\n [ ${cmd.config.name} ] \n - version : ${cmd.config.version} \n - by : ${cmd.config.credits}`;
                    }
                }
            }
            api.sendMessage(
                `page ${currentPage} / ${totalPages}\nHiện đang có ${totalCommands} plugin có thể sử dụng!${infoCommand}`,
                event.threadID,
                event.messageID
            );
        }
        break;
        case "load": {
            const commands = content;
            if (commands.length == 0) return api.sendMessage("không được để trống", event.threadID, event.messageID);
            for (const name of commands) {
                load({ name, event, api, client, global });
                await new Promise(resolve => setTimeout(resolve, 1 * 1000));
            }
        }
        break;
        case "unload": {
            const commands = content;
            if (commands.length == 0) return api.sendMessage("không được để trống", event.threadID, event.messageID);
            let count = 0;
            for (const name of commands) {
                unload({ name, event, api, client, global });
                count++;
                await new Promise(resolve => setTimeout(resolve, 1 * 1000));
            }
        }
        break;
        case "all": {
            const totalCommands = client.commands.size;
            api.sendMessage(
                `⚙️ Đã load thành công\n - [ ${totalCommands} / ${totalCommands} ] scrips`,
                event.threadID,
                event.messageID
            );
        }    
        break;
        default:
            utils.throwError("command", event.threadID, event.messageID);
        break;
    }
};
