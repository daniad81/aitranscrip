const busboy = require('busboy');
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

module.exports = async function (context, req) {
  if (req.method !== 'POST') {
    context.res = { status: 405, body: 'Método no permitido' };
    return;
  }

  const bb = busboy({ headers: req.headers });
  let audioPath = path.join('/tmp', `audio-${Date.now()}.webm`);
  const writeStream = fs.createWriteStream(audioPath);

  let transcription = '';

  bb.on('file', (_, file) => {
    file.pipe(writeStream);
  });

  bb.on('finish', async () => {
    try {
      const response = await openai.audio.transcriptions.create({
        file: fs.createReadStream(audioPath),
        model: 'whisper-1'
      });

      transcription = response.text;
      context.res = {
        status: 200,
        body: { transcription }
      };
    } catch (err) {
      context.res = {
        status: 500,
        body: { error: err.message }
      };
    }
  });

  req.pipe(bb);
};
