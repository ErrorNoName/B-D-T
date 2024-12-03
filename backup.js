// backup_lookup.js
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const axios = require('axios');
const FormData = require('form-data');
const { Client, Intents } = require('discord.js-selfbot-v13');

// Chemin du fichier JSON pour stocker les URLs de webhook
const webhookConfigPath = path.join(__dirname, 'webhooks.json');

// Fonction pour afficher un message dans la console
function logMessage(message) {
  console.log(`[${new Date().toLocaleTimeString()}] ${message}`);
}

// Création d'une interface pour les entrées utilisateur
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Fonction pour poser une question dans la console
function askQuestion(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

// Fonction pour télécharger un fichier
async function downloadFile(url, dest) {
  const writer = fs.createWriteStream(dest);
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    throw new Error(`Erreur lors du téléchargement de l'image : ${error.message}`);
  }
}

// Fonction principale
(async () => {
  logMessage('🖤 B-D-T BackUpDoxTool Ezio/ErrorNoName 🌙');

  // Demander à l'utilisateur de choisir une action
  const action = await askQuestion('Choisissez une action : \n1. Backup \n2. Lookup \nEntrez le numéro de l\'action souhaitée : ');

  if (action === '1') {
    // Action Backup
    await performBackup();
  } else if (action === '2') {
    // Action Lookup
    await performLookup();
  } else {
    logMessage('❌ Action invalide. Veuillez redémarrer le script et choisir 1 ou 2.');
    rl.close();
    process.exit(1);
  }

  rl.close();
})();

// Fonction pour effectuer le backup
async function performBackup() {
  logMessage('🔧 Démarrage du processus de Backup...');

  // Demander le token utilisateur
  const token = await askQuestion('🔑 Entrez votre token Discord : ');

  // Créer une instance du client Discord
  const client = new Client({
    checkUpdate: false,
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.DIRECT_MESSAGES,
    ],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
  });

  // Gestion de la connexion
  client.on('ready', async () => {
    logMessage(`✅ Connecté en tant que ${client.user.tag}`);

    // Création des dossiers principaux
    const backupFolder = path.join(__dirname, 'Backup');
    if (!fs.existsSync(backupFolder)) fs.mkdirSync(backupFolder);

    // Création du dossier pour le compte utilisateur
    const accountFolder = path.join(backupFolder, client.user.username);
    if (!fs.existsSync(accountFolder)) fs.mkdirSync(accountFolder);

    // Sous-dossiers
    const imagesFolder = path.join(accountFolder, 'Images');
    const mpFolder = path.join(accountFolder, 'mp');
    const serversFolder = path.join(accountFolder, 'Serveurs');

    if (!fs.existsSync(imagesFolder)) fs.mkdirSync(imagesFolder);
    if (!fs.existsSync(mpFolder)) fs.mkdirSync(mpFolder);
    if (!fs.existsSync(serversFolder)) fs.mkdirSync(serversFolder);

    // Sauvegarder la liste des amis
    logMessage('📋 Sauvegarde de la liste des amis...');
    const friends = client.users.cache.filter((user) => !user.bot && user.id !== client.user.id);

    for (const [id, friend] of friends) {
      try {
        const dmChannel = await friend.createDM();
        const messages = await fetchAllMessages(dmChannel);

        if (messages.size === 0) {
          logMessage(`❌ Pas de messages avec ${friend.username}. Dossier non créé.`);
          continue; // Ne pas créer de dossier si pas de messages
        }

        const friendFolder = path.join(mpFolder, friend.username);
        if (!fs.existsSync(friendFolder)) fs.mkdirSync(friendFolder);

        const friendImagesFolder = path.join(friendFolder, 'Images');
        const friendMessagesFile = path.join(friendFolder, `${friend.username}_messages.txt`);

        if (!fs.existsSync(friendImagesFolder)) fs.mkdirSync(friendImagesFolder);

        logMessage(`📁 Création du dossier pour ${friend.username}.`);

        const messageLogs = [];
        for (const msg of messages.values()) {
          // Format: [Date] Username: Message
          messageLogs.push(`[${msg.createdAt.toLocaleString()}] ${msg.author.username}: ${msg.content}`);

          // Sauvegarde des images
          if (msg.attachments.size > 0) {
            for (const attachment of msg.attachments.values()) {
              const fileName = `${Date.now()}_${path.basename(attachment.url)}`;
              const filePath = path.join(friendImagesFolder, fileName);
              await downloadFile(attachment.url, filePath);
              logMessage(`📥 Image sauvegardée pour ${friend.username}: ${attachment.url}`);
            }
          }
        }

        fs.writeFileSync(friendMessagesFile, messageLogs.join('\n'), 'utf8');
        logMessage(`✅ Messages sauvegardés pour ${friend.username}.`);
      } catch (err) {
        logMessage(`❌ Erreur avec ${friend.username} : ${err.message}`);
      }
    }

    // Sauvegarder les serveurs
    logMessage('📋 Sauvegarde de la liste des serveurs...');
    const guilds = client.guilds.cache.map((guild) => ({
      id: guild.id,
      name: guild.name,
    }));
    fs.writeFileSync(
      path.join(serversFolder, 'servers.json'),
      JSON.stringify(guilds, null, 2),
      'utf8'
    );
    logMessage(`✅ Liste des serveurs sauvegardée (${guilds.length} serveurs).`);

    logMessage('🎉 Sauvegarde terminée. Vous pouvez trouver vos fichiers dans le dossier "Backup".');
    client.destroy();
  });

  // Gestion des erreurs
  client.on('error', (err) => logMessage(`❌ Erreur : ${err.message}`));

  // Connexion
  try {
    await client.login(token);
  } catch (err) {
    logMessage('❌ Token invalide. Veuillez réessayer.');
    process.exit(1);
  }
}

// Fonction pour effectuer le lookup
async function performLookup() {
  logMessage('🔧 Démarrage du processus de Lookup...');

  const backupFolder = path.join(__dirname, 'Backup');
  const lookupFolder = path.join(__dirname, 'Lookup');

  if (!fs.existsSync(backupFolder)) {
    logMessage('❌ Aucun dossier "Backup" trouvé. Veuillez effectuer un backup d\'abord.');
    process.exit(1);
  }

  // Liste des backups disponibles
  const backups = fs.readdirSync(backupFolder).filter((file) => {
    const fullPath = path.join(backupFolder, file);
    return fs.lstatSync(fullPath).isDirectory();
  });

  if (backups.length === 0) {
    logMessage('❌ Aucun backup disponible.');
    process.exit(1);
  }

  logMessage('📂 Backups disponibles :');
  backups.forEach((backup, index) => {
    console.log(`${index + 1}. ${backup}`);
  });

  // Demander à l'utilisateur de choisir un backup
  let backupChoice = await askQuestion('Entrez le numéro du backup à rechercher : ');
  backupChoice = parseInt(backupChoice);
  if (isNaN(backupChoice) || backupChoice < 1 || backupChoice > backups.length) {
    logMessage('❌ Choix invalide.');
    process.exit(1);
  }
  const selectedBackup = backups[backupChoice - 1];
  logMessage(`🔍 Backup sélectionné : ${selectedBackup}`);

  // Demander le mot-clé à rechercher
  const searchTerm = await askQuestion('Entrez le mot à rechercher dans les fichiers texte : ');
  if (!searchTerm) {
    logMessage('❌ Mot clé vide.');
    process.exit(1);
  }

  const selectedBackupPath = path.join(backupFolder, selectedBackup);

  if (!fs.existsSync(selectedBackupPath)) {
    logMessage('❌ Chemin du backup sélectionné invalide.');
    process.exit(1);
  }

  // Rechercher dans tous les fichiers texte du backup sélectionné
  logMessage(`🔎 Recherche du mot "${searchTerm}" dans le backup "${selectedBackup}"...`);

  let foundFiles = [];

  // Fonction récursive pour parcourir les dossiers
  function searchInFolder(folderPath) {
    const items = fs.readdirSync(folderPath);
    for (const item of items) {
      const fullPath = path.join(folderPath, item);
      const stats = fs.lstatSync(fullPath);
      if (stats.isDirectory()) {
        searchInFolder(fullPath); // Appel récursif
      } else if (stats.isFile() && path.extname(fullPath).toLowerCase() === '.txt') {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.toLowerCase().includes(searchTerm.toLowerCase())) {
          foundFiles.push(fullPath);
        }
      }
    }
  }

  searchInFolder(selectedBackupPath);

  if (foundFiles.length === 0) {
    logMessage(`❌ Aucun fichier texte contenant "${searchTerm}" n'a été trouvé.`);
  } else {
    logMessage(`✅ Fichiers contenant "${searchTerm}" :`);
    foundFiles.forEach((file, index) => {
      console.log(`${index + 1}. ${path.relative(__dirname, file)}`);
    });

    // Demander à l'utilisateur de sélectionner des fichiers
    let fileSelection = await askQuestion('\nEntrez les numéros des fichiers à traiter (séparés par des espaces, par exemple "2 5 8") ou "M" pour retourner au menu : ');
    
    if (fileSelection.toLowerCase() === 'm') {
      logMessage('🔙 Retour au menu principal.');
      return;
    }

    const selectedNumbers = fileSelection.split(' ').map(num => parseInt(num)).filter(num => !isNaN(num) && num >=1 && num <= foundFiles.length);

    if (selectedNumbers.length === 0) {
      logMessage('❌ Aucune sélection valide effectuée.');
      return;
    }

    const selectedFiles = selectedNumbers.map(num => foundFiles[num -1]);

    // Demander l'action à effectuer sur les fichiers sélectionnés
    const actionChoice = await askQuestion('Voulez-vous ouvrir (O) ou envoyer à un webhook (E) les fichiers sélectionnés ? (O/E) : ');

    if (actionChoice.toLowerCase() === 'o') {
      // Ouvrir les fichiers dans la console
      for (const filePath of selectedFiles) {
        const relativePath = path.relative(__dirname, filePath);
        const content = fs.readFileSync(filePath, 'utf8');
        console.log(`\n===== Contenu de "${relativePath}" =====\n`);
        console.log(content);
        console.log(`\n===== Fin de "${relativePath}" =====\n`);
      }
    } else if (actionChoice.toLowerCase() === 'e') {
      // Envoyer les fichiers à un webhook
      // Charger les configurations de webhook
      let webhookConfig = {};
      if (fs.existsSync(webhookConfigPath)) {
        try {
          const data = fs.readFileSync(webhookConfigPath, 'utf8');
          webhookConfig = JSON.parse(data);
        } catch (err) {
          logMessage('❌ Erreur en lisant le fichier de configuration des webhooks.');
        }
      }

      // Vérifier si un webhook est déjà configuré pour ce backup
      let webhookUrl = webhookConfig[selectedBackup];
      if (!webhookUrl) {
        // Demander l'URL du webhook
        webhookUrl = await askQuestion('🔗 Entrez l\'URL du webhook Discord : ');
        // Valider l'URL du webhook
        if (!isValidWebhookUrl(webhookUrl)) {
          logMessage('❌ URL de webhook invalide. Opération annulée.');
          return;
        }
        // Enregistrer l'URL dans le fichier de configuration
        webhookConfig[selectedBackup] = webhookUrl;
        fs.writeFileSync(webhookConfigPath, JSON.stringify(webhookConfig, null, 2), 'utf8');
      }

      // Envoyer chaque fichier sélectionné au webhook
      for (const filePath of selectedFiles) {
        const fileName = path.basename(filePath);
        try {
          await sendFileToWebhook(webhookUrl, filePath, fileName);
          logMessage(`✅ Fichier "${path.relative(__dirname, filePath)}" envoyé avec succès au webhook.`);
        } catch (err) {
          logMessage(`❌ Erreur en envoyant "${path.relative(__dirname, filePath)}" au webhook : ${err.message}`);
        }
      }
    } else {
      logMessage('❌ Option invalide. Opération annulée.');
    }

    // Demander si l'utilisateur veut retourner au menu
    const returnChoice = await askQuestion('Voulez-vous retourner au menu principal ? (O/N) : ');
    if (returnChoice.toLowerCase() === 'o') {
      logMessage('🔙 Retour au menu principal.');
      await performLookup(); // Re-appeler la fonction pour retourner au menu
    } else {
      logMessage('❌ Opération terminée.');
    }
  }

  logMessage('🎉 Lookup terminé.');
}

// Fonction pour récupérer tous les messages d'un canal DM
async function fetchAllMessages(dmChannel) {
  let allMessages = new Map();
  let lastId;

  while (true) {
    const options = { limit: 100 };
    if (lastId) {
      options.before = lastId;
    }

    try {
      const messages = await dmChannel.messages.fetch(options);
      if (messages.size === 0) {
        break;
      }

      messages.forEach((msg) => {
        allMessages.set(msg.id, msg);
      });

      lastId = messages.last().id;

      // Limiter à 1000 messages pour éviter les abus
      if (allMessages.size >= 1000) {
        logMessage('⚠️ Limite de 1000 messages atteinte pour ce canal.');
        break;
      }
    } catch (err) {
      logMessage(`❌ Erreur lors de la récupération des messages : ${err.message}`);
      break;
    }
  }

  return allMessages;
}

// Fonction pour valider l'URL du webhook
function isValidWebhookUrl(url) {
  const webhookRegex = /^https:\/\/discord(?:app)?\.com\/api\/webhooks\/\d+\/[\w-]+$/;
  return webhookRegex.test(url);
}

// Fonction pour envoyer un fichier à un webhook
async function sendFileToWebhook(webhookUrl, filePath, fileName) {
  if (!isValidWebhookUrl(webhookUrl)) {
    throw new Error('URL de webhook invalide.');
  }

  const form = new FormData();
  form.append('file', fs.createReadStream(filePath), fileName);

  await axios.post(webhookUrl, form, {
    headers: form.getHeaders(),
  });
}
