let recorder, audioBlob;
const recordBtn = document.getElementById('recordBtn');
const sendBtn = document.getElementById('sendBtn');
const status = document.getElementById('status');
const player = document.getElementById('player');
const responseText = document.getElementById('responseText');

recordBtn.onclick = async () => {
  if (!recorder) {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorder = new MediaRecorder(stream);
    let chunks = [];

    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.onstop = () => {
      audioBlob = new Blob(chunks, { type: 'audio/webm' });
      player.src = URL.createObjectURL(audioBlob);
      status.textContent = 'Audio grabado. Listo para enviar.';
      sendBtn.disabled = false;
    };

    recorder.start();
    recordBtn.textContent = 'Detener';
    status.textContent = 'Grabando...';
  } else {
    recorder.stop();
    recorder = null;
    recordBtn.textContent = 'Grabar';
  }
};

sendBtn.onclick = async () => {
  if (!audioBlob) return;

  status.textContent = 'Enviando audio para transcripción...';
  const formData = new FormData();
  formData.append('audio', audioBlob, 'audio.webm');

  const res = await fetch('/api/transcribe', {
    method: 'POST',
    body: formData
  });

  const data = await res.json();
  responseText.textContent = data.transcription || 'Error al transcribir';
  status.textContent = 'Transcripción recibida.';
};
